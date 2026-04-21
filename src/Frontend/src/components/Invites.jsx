import { useCallback, useEffect, useMemo, useState } from 'react';


const BASE = 'http://localhost:3002';
const token = () => localStorage.getItem('token');
const RESA_EVENT_VIEW_KEY = 'reservation_event_to_view';

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Invites() {
  const [invites, setInvites] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState('');
  const [recherche, setRecherche] = useState('');
  const [filtreEventId, setFiltreEventId] = useState('tous');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formErreur, setFormErreur] = useState('');
  const [modeAjoutEvent, setModeAjoutEvent] = useState(false);
  const [form, setForm] = useState({
    event_id: '',
    full_name: '',
    email: '',
    phone: '',
  });

  const charger = useCallback(async () => {
    setLoading(true);
    setErreur('');
    try {
      const headers = { Authorization: `Bearer ${token()}` };
      const [resGuests, resEvents] = await Promise.all([
        fetch(`${BASE}/api/guests`, { headers }),
        fetch(`${BASE}/api/events`, { headers }),
      ]);

      const [guestsData, eventsData] = await Promise.all([
        resGuests.json(),
        resEvents.json(),
      ]);

      if (!resGuests.ok) throw new Error(guestsData.message || 'Erreur de chargement des invités.');
      if (!resEvents.ok || !Array.isArray(eventsData)) throw new Error('Erreur de chargement des événements.');

      setEvents(eventsData);
      const eventsMap = new Map(eventsData.map((e) => [Number(e.id), e.title]));
      const enrichis = Array.isArray(guestsData)
        ? guestsData.map((g) => ({
            ...g,
            event_title: eventsMap.get(Number(g.event_id)) || `Événement #${g.event_id}`,
          }))
        : [];

      setInvites(enrichis);
    } catch (err) {
      setErreur(err.message || 'Erreur inconnue.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    charger();
  }, [charger]);

  const invitesFiltres = useMemo(() => {
    const term = recherche.trim().toLowerCase();
    return invites.filter((g) => {
      const matchEvent = filtreEventId === 'tous' || String(g.event_id) === String(filtreEventId);
      if (!matchEvent) return false;
      if (!term) return true;
      return (
        String(g.full_name || '').toLowerCase().includes(term) ||
        String(g.email || '').toLowerCase().includes(term) ||
        String(g.phone || '').toLowerCase().includes(term) ||
        String(g.event_title || '').toLowerCase().includes(term) ||
        String(g.id).includes(term)
      );
    });
  }, [invites, recherche, filtreEventId]);

  const ouvrirEvenement = (eventId) => {
    if (!eventId) return;
    localStorage.setItem(RESA_EVENT_VIEW_KEY, String(eventId));
    window.dispatchEvent(new Event('open-events-tab'));
  };

  const ouvrirModal = () => {
    setFormErreur('');
    setModeAjoutEvent(false);
    setForm({ event_id: '', full_name: '', email: '', phone: '' });
    setModalOpen(true);
  };

  const ouvrirModalAjouterEvent = (guest) => {
    setFormErreur('');
    setModeAjoutEvent(true);
    setForm({
      event_id: '',
      full_name: guest.full_name || '',
      email: guest.email || '',
      phone: guest.phone || '',
    });
    setModalOpen(true);
  };

  const ajouterInvite = async (e) => {
    e.preventDefault();
    setFormErreur('');
    if (!form.event_id || !form.full_name.trim()) {
      setFormErreur("L'événement et le nom complet sont obligatoires.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${BASE}/api/guests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({
          event_id: Number(form.event_id),
          full_name: form.full_name.trim(),
          email: form.email.trim() || null,
          phone: form.phone.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur lors de l'ajout de l'invité.");
      setModalOpen(false);
      await charger();
    } catch (err) {
      setFormErreur(err.message || 'Erreur inconnue.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="invites">
      <header className="invites-header">
        <div>
          <h1 className="invites-titre">Invités</h1>
          <p className="invites-sous-titre">Gestion centralisée des invités liés aux événements.</p>
        </div>
        <div className="invites-actions">
          <button className="invites-btn" type="button" onClick={ouvrirModal}>
            + Ajouter invité
          </button>
          <button className="invites-btn invites-btn--secondary" type="button" onClick={charger}>
            Actualiser
          </button>
        </div>
      </header>

      <div className="invites-barre">
        <input
          className="invites-recherche"
          type="text"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Rechercher : nom, email, téléphone, événement..."
        />
        <select
          className="invites-select"
          value={filtreEventId}
          onChange={(e) => setFiltreEventId(e.target.value)}
        >
          <option value="tous">Tous les événements</option>
          {events.map((ev) => (
            <option key={ev.id} value={String(ev.id)}>
              {ev.title}
            </option>
          ))}
        </select>
        <div className="invites-total">{invitesFiltres.length} invité(s)</div>
      </div>

      <div className="invites-table-wrap">
        <div className="invites-table-head">
          <span>ID</span>
          <span>Nom complet</span>
          <span>Email</span>
          <span>Téléphone</span>
          <span>Événement</span>
          <span>Créé le</span>
          <span>Action</span>
        </div>

        {loading ? (
          <div className="invites-empty"><p>Chargement des invités...</p></div>
        ) : erreur ? (
          <div className="invites-empty"><p>{erreur}</p></div>
        ) : invitesFiltres.length === 0 ? (
          <div className="invites-empty"><p>Aucun invité trouvé.</p></div>
        ) : (
          invitesFiltres.map((g) => (
            <div className="invites-table-ligne" key={g.id}>
              <span className="invites-id">#{g.id}</span>
              <span className="invites-principal">{g.full_name || '—'}</span>
              <span>{g.email || '—'}</span>
              <span>{g.phone || '—'}</span>
              <span>{g.event_title || '—'}</span>
              <span>{formatDate(g.created_at)}</span>
              <span>
                <button
                  type="button"
                  className="invites-lien-event"
                  onClick={() => ouvrirEvenement(g.event_id)}
                >
                  Voir événement
                </button>
                <button
                  type="button"
                  className="invites-lien-event"
                  onClick={() => ouvrirModalAjouterEvent(g)}
                >
                  Ajouter événement
                </button>
              </span>
            </div>
          ))
        )}
      </div>

      {modalOpen && (
        <div className="invites-overlay" onClick={() => setModalOpen(false)}>
          <div className="invites-modal" onClick={(e) => e.stopPropagation()}>
            <button className="invites-modal-close" onClick={() => setModalOpen(false)}>✕</button>
            <h2 className="invites-modal-titre">
              {modeAjoutEvent ? "Associer l'invité à un événement" : 'Ajouter un invité'}
            </h2>
            {formErreur && <div className="invites-form-erreur">⚠️ {formErreur}</div>}
            <form className="invites-form" onSubmit={ajouterInvite}>
              <label>
                Événement *
                <select
                  value={form.event_id}
                  onChange={(e) => setForm((f) => ({ ...f, event_id: e.target.value }))}
                  required
                >
                  <option value="">— Sélectionner —</option>
                  {events.map((ev) => (
                    <option key={ev.id} value={String(ev.id)}>
                      {ev.title}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Nom complet *
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                  placeholder="Ex: Ahmed El Amrani"
                  disabled={modeAjoutEvent}
                  required
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="exemple@email.com"
                  disabled={modeAjoutEvent}
                />
              </label>
              <label>
                Téléphone
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+212 6 xx xx xx xx"
                  disabled={modeAjoutEvent}
                />
              </label>
              <div className="invites-form-actions">
                <button type="button" className="invites-btn invites-btn--secondary" onClick={() => setModalOpen(false)}>
                  Annuler
                </button>
                <button type="submit" className="invites-btn" disabled={saving}>
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
