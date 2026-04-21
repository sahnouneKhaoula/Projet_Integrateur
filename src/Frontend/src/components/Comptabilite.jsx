import { useCallback, useEffect, useMemo, useState } from 'react';

const BASE = 'http://localhost:3002';
const token = () => localStorage.getItem('token');

const money = (value) =>
  new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 2 }).format(
    Number(value || 0)
  );

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

const statusLabel = {
  draft: 'Brouillon',
  paid: 'Payée',
  partial: 'Partielle',
  unpaid: 'Impayée',
};

export default function Comptabilite() {
  const [events, setEvents] = useState([]);
  const [services, setServices] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [eventFilter, setEventFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [invoiceForm, setInvoiceForm] = useState({
    event_id: '',
    status: 'unpaid',
  });
  const [invoiceServiceLineIds, setInvoiceServiceLineIds] = useState([]);
  const [invoiceServiceOverrides, setInvoiceServiceOverrides] = useState({});
  const [invoiceExtraLines, setInvoiceExtraLines] = useState([]);
  const [newExtraLabel, setNewExtraLabel] = useState('');
  const [newExtraAmount, setNewExtraAmount] = useState('');
  const [invoicePreviewOpen, setInvoicePreviewOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    invoice_id: '',
    amount: '',
    method: 'virement',
  });
  const [savingInvoice, setSavingInvoice] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const headers = { Authorization: `Bearer ${token()}` };
      const [evRes, svRes, ivRes, pyRes] = await Promise.all([
        fetch(`${BASE}/api/events`, { headers }),
        fetch(`${BASE}/api/services`, { headers }),
        fetch(`${BASE}/api/invoices`, { headers }),
        fetch(`${BASE}/api/payments`, { headers }),
      ]);

      const [evData, svData, ivData, pyData] = await Promise.all([
        evRes.json(),
        svRes.json(),
        ivRes.json(),
        pyRes.json(),
      ]);

      if (!evRes.ok || !Array.isArray(evData)) throw new Error(evData.message || 'Erreur de chargement des événements.');
      if (!svRes.ok || !Array.isArray(svData)) throw new Error(svData.message || 'Erreur de chargement des services.');
      if (!ivRes.ok || !Array.isArray(ivData)) throw new Error(ivData.message || 'Erreur de chargement des factures.');
      if (!pyRes.ok || !Array.isArray(pyData)) throw new Error(pyData.message || 'Erreur de chargement des paiements.');

      setEvents(evData);
      setServices(svData);
      setInvoices(ivData);
      setPayments(pyData);
    } catch (err) {
      setError(err.message || 'Erreur de chargement.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const servicesByEvent = useMemo(() => {
    const map = new Map();
    for (const s of services) {
      const key = Number(s.event_id);
      map.set(key, Number(map.get(key) || 0) + Number(s.price || 0));
    }
    return map;
  }, [services]);

  const invoicesWithComputed = useMemo(() => {
    return invoices.map((inv) => {
      const total = Number(inv.total || 0);
      const paid = Number(inv.paid_total || 0);
      const due = Math.max(0, total - paid);
      const computedStatus =
        inv.status === 'draft'
          ? 'draft'
          : paid >= total && total > 0
            ? 'paid'
            : paid > 0
              ? 'partial'
              : 'unpaid';
      return { ...inv, due, computedStatus };
    });
  }, [invoices]);

  const validatedInvoices = useMemo(
    () => invoicesWithComputed.filter((inv) => inv.status !== 'draft'),
    [invoicesWithComputed]
  );

  const filteredInvoices = useMemo(() => {
    return invoicesWithComputed.filter((inv) => {
      const matchEvent = eventFilter === 'all' || String(inv.event_id) === String(eventFilter);
      const matchStatus = statusFilter === 'all' || inv.computedStatus === statusFilter;
      return matchEvent && matchStatus;
    });
  }, [invoicesWithComputed, eventFilter, statusFilter]);

  const visiblePayments = useMemo(() => {
    if (eventFilter === 'all') return payments;
    return payments.filter((p) => String(p.event_id) === String(eventFilter));
  }, [payments, eventFilter]);

  const selectedPaymentInvoice = useMemo(
    () => validatedInvoices.find((inv) => String(inv.id) === String(paymentForm.invoice_id)) || null,
    [validatedInvoices, paymentForm.invoice_id]
  );

  const remainingToPay = useMemo(() => {
    if (!selectedPaymentInvoice) return 0;
    return Math.max(0, Number(selectedPaymentInvoice.total || 0) - Number(selectedPaymentInvoice.paid_total || 0));
  }, [selectedPaymentInvoice]);

  const kpis = useMemo(() => {
    const totalFacture = invoicesWithComputed.reduce((acc, i) => acc + Number(i.total || 0), 0);
    const totalPaye = invoicesWithComputed.reduce((acc, i) => acc + Number(i.paid_total || 0), 0);
    const reste = Math.max(0, totalFacture - totalPaye);
    const impayees = invoicesWithComputed.filter((i) => i.computedStatus !== 'paid').length;
    return { totalFacture, totalPaye, reste, impayees };
  }, [invoicesWithComputed]);

  const handleCreateOrValidateInvoice = async (mode = 'validate') => {
    setMessage('');
    setError('');
    const selectedEventId = Number(invoiceForm.event_id);
    if (!invoiceForm.event_id || Number.isNaN(selectedEventId) || selectedEventId <= 0) {
      return setError("Sélectionne un événement pour la facture.");
    }
    if (selectedInvoiceServices.length === 0 && invoiceExtraLines.length === 0) {
      return setError('La facture ne contient aucune ligne. Ajoute un service ou un autre frais.');
    }

    const invoiceLinesPayload = [
      ...selectedInvoiceServices.map((svc) => ({
        source_type: 'service',
        service_id: Number(svc.id),
        label: svc.name,
        unit_price: Number(svc.price || 0),
        quantity: 1,
      })),
      ...invoiceExtraLines.map((line) => ({
        source_type: 'extra',
        service_id: null,
        label: line.label,
        unit_price: Number(line.amount || 0),
        quantity: 1,
      })),
    ];

    const payload = {
      event_id: selectedEventId,
      total: selectedInvoiceTotal,
      status: mode === 'draft' ? 'draft' : invoiceForm.status,
      lines: invoiceLinesPayload,
    };

    setSavingInvoice(true);
    try {
      const res = await fetch(`${BASE}/api/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur création facture.');

      setMessage(mode === 'draft' ? 'Facture brouillon créée avec succès.' : 'Facture validée avec succès.');
      setInvoiceForm({ event_id: '', status: 'unpaid' });
      setInvoiceServiceLineIds([]);
      setInvoiceServiceOverrides({});
      setInvoiceExtraLines([]);
      setNewExtraLabel('');
      setNewExtraAmount('');
      setInvoicePreviewOpen(false);
      await loadData();
    } catch (err) {
      setError(err.message || 'Erreur création facture.');
    } finally {
      setSavingInvoice(false);
    }
  };

  const selectedInvoiceServices = useMemo(() => {
    if (!invoiceForm.event_id) return [];
    const selectedEventId = Number(invoiceForm.event_id);
    const available = services.filter((s) => Number(s.event_id) === selectedEventId);
    if (!available.length) return [];
    if (!invoiceServiceLineIds.length) return available;
    const selectedSet = new Set(invoiceServiceLineIds.map(Number));
    return available
      .filter((s) => selectedSet.has(Number(s.id)))
      .map((s) => ({
        ...s,
        price: invoiceServiceOverrides[s.id] !== undefined ? Number(invoiceServiceOverrides[s.id]) : Number(s.price || 0),
      }));
  }, [services, invoiceForm.event_id, invoiceServiceLineIds, invoiceServiceOverrides]);

  const selectedInvoiceTotal = useMemo(
    () =>
      selectedInvoiceServices.reduce((acc, s) => acc + Number(s.price || 0), 0) +
      invoiceExtraLines.reduce((acc, l) => acc + Number(l.amount || 0), 0),
    [selectedInvoiceServices, invoiceExtraLines]
  );

  const handleSelectInvoiceEvent = (eventIdValue) => {
    setError('');
    setMessage('');
    setInvoiceForm((f) => ({ ...f, event_id: eventIdValue }));
    const eventId = Number(eventIdValue);
    if (!eventIdValue || Number.isNaN(eventId)) {
      setInvoiceServiceLineIds([]);
      return;
    }
    const ids = services
      .filter((s) => Number(s.event_id) === eventId)
      .map((s) => Number(s.id));
    setInvoiceServiceLineIds(ids);
    setInvoiceServiceOverrides({});
  };

  const handleRemoveInvoiceLine = (serviceId) => {
    setInvoiceServiceLineIds((prev) => prev.filter((id) => Number(id) !== Number(serviceId)));
    setInvoiceServiceOverrides((prev) => {
      const next = { ...prev };
      delete next[serviceId];
      return next;
    });
  };

  const handleChangeServicePrice = (serviceId, value) => {
    if (value === '') {
      setInvoiceServiceOverrides((prev) => ({ ...prev, [serviceId]: 0 }));
      return;
    }
    const amount = Number(value);
    if (!Number.isFinite(amount) || amount < 0) return;
    setInvoiceServiceOverrides((prev) => ({ ...prev, [serviceId]: amount }));
  };

  const handleAddExtraLine = () => {
    const label = newExtraLabel.trim();
    const amount = Number(newExtraAmount);
    if (!label) {
      setError('Le libellé du frais supplémentaire est obligatoire.');
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Le montant du frais supplémentaire doit être supérieur à 0.');
      return;
    }

    setError('');
    setInvoiceExtraLines((prev) => [
      ...prev,
      { id: Date.now(), label, amount },
    ]);
    setNewExtraLabel('');
    setNewExtraAmount('');
  };

  const handleRemoveExtraLine = (lineId) => {
    setInvoiceExtraLines((prev) => prev.filter((l) => l.id !== lineId));
  };

  const handleChangeExtraLineAmount = (lineId, value) => {
    if (value === '') {
      setInvoiceExtraLines((prev) => prev.map((l) => (l.id === lineId ? { ...l, amount: 0 } : l)));
      return;
    }
    const amount = Number(value);
    if (!Number.isFinite(amount) || amount < 0) return;
    setInvoiceExtraLines((prev) => prev.map((l) => (l.id === lineId ? { ...l, amount } : l)));
  };

  const handleOpenInvoicePreview = () => {
    setMessage('');
    setError('');
    if (!invoiceForm.event_id) {
      setError("Sélectionne d'abord un événement.");
      return;
    }
    setInvoicePreviewOpen(true);
  };

  const selectedEventTitle = useMemo(() => {
    const ev = events.find((e) => String(e.id) === String(invoiceForm.event_id));
    return ev?.title || `Événement #${invoiceForm.event_id}`;
  }, [events, invoiceForm.event_id]);

  const handleCreatePayment = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (!paymentForm.invoice_id || !paymentForm.amount) {
      return setError('Facture et montant sont obligatoires.');
    }

    setSavingPayment(true);
    try {
      const res = await fetch(`${BASE}/api/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({
          invoice_id: Number(paymentForm.invoice_id),
          amount: Number(paymentForm.amount),
          method: paymentForm.method,
          paid_at: new Date().toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur création paiement.');

      setMessage('Paiement enregistré avec succès.');
      setPaymentForm({ invoice_id: '', amount: '', method: 'virement' });
      await loadData();
    } catch (err) {
      setError(err.message || 'Erreur création paiement.');
    } finally {
      setSavingPayment(false);
    }
  };

  const handleValidateDraftInvoice = async (invoiceId) => {
    setMessage('');
    setError('');
    try {
      const res = await fetch(`${BASE}/api/invoices/${invoiceId}/validate`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token()}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur lors de la validation de la facture.');
      setMessage('Facture validée avec succès.');
      await loadData();
    } catch (err) {
      setError(err.message || 'Erreur lors de la validation.');
    }
  };

  const handlePrintInvoice = (inv) => {
    const invoiceLines = Array.isArray(inv.lines) ? inv.lines : [];

    const serviceRowsHtml = invoiceLines
      .filter((line) => line.source_type === 'service')
      .map(
        (line) => `
          <tr>
            <td>${line.label || 'Service'}</td>
            <td style="text-align:right;">${money(line.line_total ?? line.unit_price)}</td>
          </tr>
        `
      )
      .join('');

    const extraRowsHtml = invoiceLines
      .filter((line) => line.source_type === 'extra')
      .map(
        (line) => `
          <tr>
            <td>${line.label || 'Autres frais'}</td>
            <td style="text-align:right;">${money(line.line_total ?? line.unit_price)}</td>
          </tr>
        `
      )
      .join('');

    const linesSectionHtml =
      serviceRowsHtml || extraRowsHtml
        ? `
          <h2 style="margin: 22px 0 10px 0; font-size: 18px;">Lignes de facture</h2>
          <table style="width:100%; border-collapse: collapse;">
            <thead>
              <tr>
                <th style="text-align:left; border-bottom:1px solid #e5e7eb; padding:8px 6px;">Libellé</th>
                <th style="text-align:right; border-bottom:1px solid #e5e7eb; padding:8px 6px;">Montant</th>
              </tr>
            </thead>
            <tbody>
              ${serviceRowsHtml}
              ${extraRowsHtml}
            </tbody>
          </table>
        `
        : `
          <h2 style="margin: 22px 0 10px 0; font-size: 18px;">Lignes de facture</h2>
          <p style="color:#6b7280;">Aucune ligne détaillée disponible pour cette facture.</p>
        `;

    const content = `
      <html>
        <head>
          <title>Facture #${inv.id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
            h1 { margin: 0 0 8px 0; }
            .muted { color: #6b7280; margin-bottom: 18px; }
            .grid { display: grid; grid-template-columns: 180px 1fr; gap: 8px 16px; }
            .label { font-weight: 700; }
            .box { margin-top: 18px; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; }
            table td { padding: 8px 6px; border-bottom: 1px solid #f1f5f9; }
          </style>
        </head>
        <body>
          <h1>Facture #${inv.id}</h1>
          <div class="muted">Hôtel La Promenade - Gestion d'événements</div>
          <div class="grid">
            <div class="label">Événement</div><div>${inv.event_title || `Événement #${inv.event_id}`}</div>
            <div class="label">Date facture</div><div>${formatDate(inv.issued_date)}</div>
            <div class="label">Total facture</div><div>${money(inv.total)}</div>
            <div class="label">Montant payé</div><div>${money(inv.paid_total)}</div>
            <div class="label">Reste dû</div><div>${money(inv.due)}</div>
            <div class="label">État</div><div>${statusLabel[inv.computedStatus] || inv.computedStatus}</div>
          </div>
          ${linesSectionHtml}
          <div class="box">Document généré depuis le module Comptabilité.</div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) return;
    printWindow.document.open();
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <section className="compta">
      <header className="compta-header">
        <div>
          <h1 className="compta-title">Comptabilité</h1>
          <p className="compta-subtitle">Facturation des événements et suivi des paiements liés aux services.</p>
        </div>
        
      </header>

      {error && <div className="compta-alert compta-alert--error">⚠️ {error}</div>}
      {message && <div className="compta-alert compta-alert--ok">✅ {message}</div>}

      <div className="compta-kpis">
        <article className="compta-kpi">
          <span>Total facturé</span>
          <strong>{money(kpis.totalFacture)}</strong>
        </article>
        <article className="compta-kpi">
          <span>Total payé</span>
          <strong>{money(kpis.totalPaye)}</strong>
        </article>
        <article className="compta-kpi">
          <span>Reste à encaisser</span>
          <strong>{money(kpis.reste)}</strong>
        </article>
        <article className="compta-kpi">
          <span>Factures non soldées</span>
          <strong>{kpis.impayees}</strong>
        </article>
      </div>

      <div className="compta-grid">
        <form className="compta-card compta-form" onSubmit={(e) => e.preventDefault()}>
          <h2>Créer une facture</h2>
          <label>
            Événement *
            <select
              value={invoiceForm.event_id}
              onChange={(e) => handleSelectInvoiceEvent(e.target.value)}
              required
            >
              <option value="">— Sélectionner —</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </select>
          </label>

          <div className="compta-lines-box">
            <div className="compta-lines-head">
              <strong>Lignes de facture (services)</strong>
              <span>{selectedInvoiceServices.length} ligne(s)</span>
            </div>
            {!invoiceForm.event_id ? (
              <div className="compta-empty">Sélectionne un événement pour charger les services.</div>
            ) : selectedInvoiceServices.length === 0 ? (
              <div className="compta-empty">Aucun service sélectionné pour cette facture.</div>
            ) : (
              <div className="compta-lines-list">
                {selectedInvoiceServices.map((svc) => (
                  <div className="compta-line-item" key={svc.id}>
                    <span className="compta-line-name">{svc.name}</span>
                    <span className="compta-line-price">{money(svc.price)}</span>
                    <button
                      className="compta-btn compta-btn--line-remove"
                      type="button"
                      onClick={() => handleRemoveInvoiceLine(svc.id)}
                    >
                      Supprimer
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="compta-lines-box">
            <div className="compta-lines-head">
              <strong>Autres frais</strong>
              <span>{invoiceExtraLines.length} ligne(s)</span>
            </div>

            <div className="compta-extra-add">
              <input
                type="text"
                placeholder="Libellé (ex: Transport externe)"
                value={newExtraLabel}
                onChange={(e) => setNewExtraLabel(e.target.value)}
              />
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Montant"
                value={newExtraAmount}
                onChange={(e) => setNewExtraAmount(e.target.value)}
              />
              <button className="compta-btn" type="button" onClick={handleAddExtraLine}>
                + Ajouter
              </button>
            </div>

            {invoiceExtraLines.length === 0 ? (
              <div className="compta-empty">Aucun frais supplémentaire.</div>
            ) : (
              <div className="compta-lines-list">
                {invoiceExtraLines.map((line) => (
                  <div className="compta-line-item" key={line.id}>
                    <span className="compta-line-name">{line.label}</span>
                    <span className="compta-line-price">{money(line.amount)}</span>
                    <button
                      className="compta-btn compta-btn--line-remove"
                      type="button"
                      onClick={() => handleRemoveExtraLine(line.id)}
                    >
                      Supprimer
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <label>
            Total calculé
            <input type="text" value={money(selectedInvoiceTotal)} readOnly />
          </label>
          <label>
            Statut initial (optionnel)
            <select
              value={invoiceForm.status}
              onChange={(e) => setInvoiceForm((f) => ({ ...f, status: e.target.value }))}
            >
              <option value="unpaid">Impayée</option>
              <option value="partial">Partielle</option>
              <option value="paid">Payée</option>
            </select>
          </label>
          <div className="compta-form-actions">
            <button className="compta-btn compta-btn--secondary" type="button" onClick={handleOpenInvoicePreview}>
              Afficher facture
            </button>
            <button className="compta-btn compta-btn--secondary" type="button" onClick={() => handleCreateOrValidateInvoice('draft')} disabled={savingInvoice}>
              {savingInvoice ? 'Création...' : 'Créer facture'}
            </button>
            <button className="compta-btn" type="button" onClick={() => handleCreateOrValidateInvoice('validate')} disabled={savingInvoice}>
              {savingInvoice ? 'Validation...' : 'Valider'}
            </button>
          </div>
        </form>

        <form className="compta-card compta-form" onSubmit={handleCreatePayment}>
          <h2>Enregistrer un paiement</h2>
          <label>
            Facture *
            <select
              value={paymentForm.invoice_id}
              onChange={(e) => setPaymentForm((f) => ({ ...f, invoice_id: e.target.value }))}
              required
            >
              <option value="">— Sélectionner —</option>
              {validatedInvoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  #{inv.id} · {inv.event_title || `Événement #${inv.event_id}`} · {money(inv.total)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Montant *
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={paymentForm.amount}
              onChange={(e) => setPaymentForm((f) => ({ ...f, amount: e.target.value }))}
              required
            />
          </label>
          <label>
            Reste à payer
            <input type="text" value={money(remainingToPay)} readOnly />
          </label>
          <label>
            Méthode
            <select
              value={paymentForm.method}
              onChange={(e) => setPaymentForm((f) => ({ ...f, method: e.target.value }))}
            >
              <option value="virement">Virement</option>
              <option value="especes">Espèces</option>
              <option value="carte">Carte</option>
              <option value="cheque">Chèque</option>
            </select>
          </label>
          <button className="compta-btn" type="submit" disabled={savingPayment}>
            {savingPayment ? 'Enregistrement...' : 'Enregistrer le paiement'}
          </button>
        </form>
      </div>

      <div className="compta-card">
        <div className="compta-filters">
          <h2>Factures par événement</h2>
          <div className="compta-filters-controls">
            <select value={eventFilter} onChange={(e) => setEventFilter(e.target.value)}>
              <option value="all">Tous les événements</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">Tous les statuts</option>
              <option value="draft">Brouillon</option>
              <option value="unpaid">Impayées</option>
              <option value="partial">Partielles</option>
              <option value="paid">Payées</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="compta-empty">Chargement des factures...</div>
        ) : filteredInvoices.length === 0 ? (
          <div className="compta-empty">Aucune facture trouvée.</div>
        ) : (
          <div className="compta-table">
            <div className="compta-row compta-row--head">
              <span>ID</span>
              <span>Événement</span>
              <span>Services</span>
              <span>Total facture</span>
              <span>Payé</span>
              <span>Reste dû</span>
              <span>État</span>
              <span>Date</span>
              <span>Action</span>
            </div>
            {filteredInvoices.map((inv) => (
              <div className="compta-row" key={inv.id}>
                <span>#{inv.id}</span>
                <span>{inv.event_title || `Événement #${inv.event_id}`}</span>
                <span>
                  {Array.isArray(inv.lines) && inv.lines.length > 0
                    ? money(inv.lines.reduce((acc, l) => acc + Number(l.line_total ?? l.unit_price ?? 0), 0))
                    : money(servicesByEvent.get(Number(inv.event_id)) || inv.services_total || 0)}
                </span>
                <span>{money(inv.total)}</span>
                <span>{money(inv.paid_total)}</span>
                <span>{money(inv.due)}</span>
                <span>
                  <span className={`compta-badge compta-badge--${inv.computedStatus}`}>
                    {statusLabel[inv.computedStatus] || inv.computedStatus}
                  </span>
                </span>
                <span>{formatDate(inv.issued_date)}</span>
                <span className="compta-action-buttons">
                  {inv.status === 'draft' && (
                    <button
                      className="compta-btn compta-btn--secondary"
                      type="button"
                      onClick={() => handleValidateDraftInvoice(inv.id)}
                    >
                      Valider
                    </button>
                  )}
                  <button className="compta-btn compta-btn--print" type="button" onClick={() => handlePrintInvoice(inv)}>
                    Imprimer
                  </button>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="compta-card">
        <h2>Paiements récents</h2>
        {loading ? (
          <div className="compta-empty">Chargement des paiements...</div>
        ) : visiblePayments.length === 0 ? (
          <div className="compta-empty">Aucun paiement trouvé.</div>
        ) : (
          <div className="compta-table">
            <div className="compta-row compta-row--head">
              <span>ID</span>
              <span>Facture</span>
              <span>Événement</span>
              <span>Montant</span>
              <span>Méthode</span>
              <span>Date paiement</span>
            </div>
            {visiblePayments.map((p) => (
              <div className="compta-row" key={p.id}>
                <span>#{p.id}</span>
                <span>#{p.invoice_id}</span>
                <span>{p.event_title || `Événement #${p.event_id}`}</span>
                <span>{money(p.amount)}</span>
                <span>{p.method || '—'}</span>
                <span>{formatDate(p.paid_at)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {invoicePreviewOpen && (
        <div className="compta-modal-backdrop" onClick={() => setInvoicePreviewOpen(false)}>
          <div className="compta-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Aperçu de la facture</h3>
            <p className="compta-modal-subtitle">{selectedEventTitle}</p>

            <div className="compta-lines-list">
              {selectedInvoiceServices.length === 0 ? (
                <div className="compta-empty">Aucune ligne dans cette facture.</div>
              ) : (
                selectedInvoiceServices.map((svc) => (
                  <div className="compta-line-item" key={svc.id}>
                    <span className="compta-line-name">{svc.name}</span>
                    <input
                      className="compta-line-price-input"
                      type="number"
                      min="0"
                      step="0.01"
                      value={Number(svc.price || 0)}
                      onChange={(e) => handleChangeServicePrice(svc.id, e.target.value)}
                    />
                    <button
                      className="compta-btn compta-btn--line-remove"
                      type="button"
                      onClick={() => handleRemoveInvoiceLine(svc.id)}
                    >
                      Supprimer
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="compta-lines-list">
              {invoiceExtraLines.length > 0 && (
                <>
                  {invoiceExtraLines.map((line) => (
                    <div className="compta-line-item" key={line.id}>
                      <span className="compta-line-name">{line.label}</span>
                      <input
                        className="compta-line-price-input"
                        type="number"
                        min="0"
                        step="0.01"
                        value={Number(line.amount || 0)}
                        onChange={(e) => handleChangeExtraLineAmount(line.id, e.target.value)}
                      />
                      <button
                        className="compta-btn compta-btn--line-remove"
                        type="button"
                        onClick={() => handleRemoveExtraLine(line.id)}
                      >
                        Supprimer
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>

            <div className="compta-modal-total">
              Total facture: <strong>{money(selectedInvoiceTotal)}</strong>
            </div>

            <div className="compta-form-actions">
              <button className="compta-btn compta-btn--secondary" type="button" onClick={() => setInvoicePreviewOpen(false)}>
                Fermer
              </button>
              <button className="compta-btn" type="button" onClick={() => handleCreateOrValidateInvoice('validate')} disabled={savingInvoice}>
                {savingInvoice ? 'Validation...' : 'Valider la facture'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}