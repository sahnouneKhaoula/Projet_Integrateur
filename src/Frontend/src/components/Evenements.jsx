import { useState, useEffect, useCallback } from 'react';
import '../Style/Evenements.css';

const BASE = 'http://localhost:3002';
const token = () => localStorage.getItem('token');
const RESA_EVENT_EDIT_KEY = 'reservation_event_to_edit';
const RESA_EVENT_VIEW_KEY = 'reservation_event_to_view';
const utilisateurLocal = () => {
    try { return JSON.parse(localStorage.getItem('utilisateur') || '{}'); } catch { return {}; }
};

// ─── Config statuts ────────────────────────────────────────────────
const STATUTS = {
    brouillon: { label: 'Brouillon',  cls: 'ev-badge--brouillon', emoji: '📝' },
    planned:   { label: 'Planifié',  cls: 'ev-badge--planned',   emoji: '📋' },
    ongoing:   { label: 'En cours',  cls: 'ev-badge--ongoing',   emoji: '▶️' },
    completed: { label: 'Terminé',   cls: 'ev-badge--completed', emoji: '✅' },
    cancelled: { label: 'Annulé',    cls: 'ev-badge--cancelled', emoji: '❌' },
    archived:  { label: 'Archivé',   cls: 'ev-badge--archived',  emoji: '📦' },
};

const fmt = (d) => d ? new Date(d).toLocaleDateString('fr-CA', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtDT = (d) => d ? new Date(d).toLocaleString('fr-CA', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
const duree = (d1, d2) => {
    if (!d1 || !d2) return '';
    const h = Math.round((new Date(d2) - new Date(d1)) / 3_600_000);
    if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}j`;
};

// ─── Badge statut ──────────────────────────────────────────────────
function BadgeStatut({ status }) {
    const s = STATUTS[status] || { label: status, cls: '', emoji: '?' };
    return <span className={`ev-badge ${s.cls}`}>{s.emoji} {s.label}</span>;
}

// ─── Carte événement ───────────────────────────────────────────────
function CarteEvenement({ ev, onVoir, onEditer, onSupprimer, onStatut, onConfirmer, isAdmin }) {
    const invitesAffiches = ev.expected_guests ?? ev.nb_guests ?? 0;
    return (
        <div className="ev-carte" onClick={() => onVoir(ev.id)}>
            <div className="ev-carte-haut">
                <div className="ev-carte-date">
                    <span className="ev-carte-jour">{new Date(ev.start_date).getDate()}</span>
                    <span className="ev-carte-mois">{new Date(ev.start_date).toLocaleDateString('fr-CA', { month: 'short' })}</span>
                </div>
                <div className="ev-carte-meta">
                    <BadgeStatut status={ev.status} />
                    <span className="ev-carte-duree">{duree(ev.start_date, ev.end_date)}</span>
                </div>
            </div>

            <h3 className="ev-carte-titre">{ev.title}</h3>

            <div className="ev-carte-infos">
                {ev.room_name && (
                    <span className="ev-carte-info-item">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                        {ev.room_name}
                    </span>
                )}
                <span className="ev-carte-info-item">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                    {ev.organizer_name || '—'}
                </span>
                <span className="ev-carte-info-item">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    {invitesAffiches} invité{invitesAffiches !== 1 ? 's' : ''}
                </span>
            </div>

            {isAdmin && (
                <div className="ev-carte-actions" onClick={e => e.stopPropagation()}>
                    {ev.status === 'brouillon' && (
                        <button className="ev-btn-action ev-btn-action--confirmer" onClick={() => onConfirmer(ev.id, ev.title)} title="Confirmer l'événement">✅</button>
                    )}
                    {ev.status === 'planned' && (
                        <button className="ev-btn-action ev-btn-action--go" onClick={() => onStatut(ev.id, 'ongoing')} title="Démarrer">▶</button>
                    )}
                    {ev.status === 'ongoing' && (
                        <button className="ev-btn-action ev-btn-action--done" onClick={() => onStatut(ev.id, 'completed')} title="Terminer">✓</button>
                    )}
                    {ev.status === 'completed' && (
                        <button
                            className="ev-btn-action ev-btn-action--archive"
                            onClick={() => onStatut(ev.id, 'archived')}
                            title="Archiver l'événement"
                        >
                            📦
                        </button>
                    )}
                    {ev.status !== 'cancelled' && (
                        <button
                            className="ev-btn-action ev-btn-action--cancel"
                            onClick={() => onStatut(ev.id, 'cancelled')}
                            title="Annuler l'événement"
                        >
                            ❌
                        </button>
                    )}
                    <button className="ev-btn-action ev-btn-action--edit" onClick={() => onEditer(ev)} title="Modifier">✏️</button>
                    <button className="ev-btn-action ev-btn-action--del" onClick={() => onSupprimer(ev.id, ev.title)} title="Supprimer">🗑️</button>
                </div>
            )}
        </div>
    );
}

// ─── Modal détail ──────────────────────────────────────────────────
function ModalDetail({ eventId, onFermer, onEditer, isAdmin, canManageGuests }) {
    const [detail, setDetail] = useState(null);
    const [chargement, setChargement] = useState(true);
    const [guestForm, setGuestForm] = useState({ full_name: '', email: '', phone: '' });
    const [guestSaving, setGuestSaving] = useState(false);
    const [guestErreur, setGuestErreur] = useState('');

    const chargerDetail = useCallback(() => {
        setChargement(true);
        fetch(`${BASE}/api/events/${eventId}`, { headers: { Authorization: `Bearer ${token()}` } })
            .then(r => r.json())
            .then(d => { setDetail(d); setChargement(false); })
            .catch(() => setChargement(false));
    }, [eventId]);

    useEffect(() => {
        chargerDetail();
    }, [chargerDetail]);

    const ajouterInvite = async (e) => {
        e.preventDefault();
        setGuestErreur('');
        if (!guestForm.full_name.trim()) {
            setGuestErreur('Le nom complet est obligatoire.');
            return;
        }

        setGuestSaving(true);
        try {
            const res = await fetch(`${BASE}/api/guests`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token()}`,
                },
                body: JSON.stringify({
                    event_id: eventId,
                    full_name: guestForm.full_name.trim(),
                    email: guestForm.email.trim() || null,
                    phone: guestForm.phone.trim() || null,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Erreur lors de l'ajout de l'invité.");

            setGuestForm({ full_name: '', email: '', phone: '' });
            await chargerDetail();
        } catch (err) {
            setGuestErreur(err.message || 'Erreur inconnue.');
        } finally {
            setGuestSaving(false);
        }
    };

    return (
        <div className="ev-overlay" onClick={onFermer}>
            <div className="ev-modal ev-modal--large" onClick={e => e.stopPropagation()}>
                <button className="ev-modal-fermer" onClick={onFermer}>✕</button>
                {chargement ? (
                    <div className="ev-modal-loading">Chargement…</div>
                ) : !detail?.event ? (
                    <div className="ev-modal-loading">Événement introuvable.</div>
                ) : (
                    <>
                        <div className="ev-detail-entete">
                            <div>
                                <BadgeStatut status={detail.event.status} />
                                <h2 className="ev-detail-titre">{detail.event.title}</h2>
                                {detail.event.description && (
                                    <p className="ev-detail-desc">{detail.event.description}</p>
                                )}
                            </div>
                            {isAdmin && (
                                <button className="ev-btn-primaire" onClick={() => { onFermer(); onEditer(detail.event); }}>
                                    ✏️ Modifier
                                </button>
                            )}
                        </div>

                        <div className="ev-detail-grille">
                            <div className="ev-detail-bloc">
                                <h4 className="ev-detail-bloc-titre">📅 Dates & Lieu</h4>
                                <div className="ev-detail-ligne"><span>Début</span><strong>{fmtDT(detail.event.start_date)}</strong></div>
                                <div className="ev-detail-ligne"><span>Fin</span><strong>{fmtDT(detail.event.end_date)}</strong></div>
                                <div className="ev-detail-ligne"><span>Durée</span><strong>{duree(detail.event.start_date, detail.event.end_date)}</strong></div>
                                {detail.event.room_name && <>
                                    <div className="ev-detail-ligne"><span>Salle</span><strong>{detail.event.room_name}</strong></div>
                                    <div className="ev-detail-ligne"><span>Capacité</span><strong>{detail.event.room_capacity} pers.</strong></div>
                                    {detail.event.room_location && <div className="ev-detail-ligne"><span>Emplacement</span><strong>{detail.event.room_location}</strong></div>}
                                </>}
                            </div>

                            <div className="ev-detail-bloc">
                                <h4 className="ev-detail-bloc-titre">👤 Organisateur</h4>
                                <div className="ev-detail-ligne"><span>Nom</span><strong>{detail.event.organizer_name || '—'}</strong></div>
                                <div className="ev-detail-ligne"><span>Email</span><strong>{detail.event.organizer_email || '—'}</strong></div>
                                <div className="ev-detail-ligne"><span>Créé le</span><strong>{fmt(detail.event.created_at)}</strong></div>
                            </div>
                        </div>

                        {/* Invités */}
                        <div className="ev-detail-section">
                            <h4 className="ev-detail-bloc-titre">👥 Invités ({detail.guests.length})</h4>
                            {canManageGuests && (
                                <form className="ev-guest-form" onSubmit={ajouterInvite}>
                                    {guestErreur && <div className="ev-form-erreur">{guestErreur}</div>}
                                    <div className="ev-guest-form-grid">
                                        <input
                                            type="text"
                                            placeholder="Nom complet *"
                                            value={guestForm.full_name}
                                            onChange={(e) => setGuestForm(f => ({ ...f, full_name: e.target.value }))}
                                            required
                                        />
                                        <input
                                            type="email"
                                            placeholder="Email"
                                            value={guestForm.email}
                                            onChange={(e) => setGuestForm(f => ({ ...f, email: e.target.value }))}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Téléphone"
                                            value={guestForm.phone}
                                            onChange={(e) => setGuestForm(f => ({ ...f, phone: e.target.value }))}
                                        />
                                        <button type="submit" className="ev-btn-primaire" disabled={guestSaving}>
                                            {guestSaving ? 'Ajout...' : '+ Ajouter invité'}
                                        </button>
                                    </div>
                                </form>
                            )}
                            {detail.guests.length === 0 ? (
                                <p className="ev-detail-vide">Aucun invité enregistré.</p>
                            ) : (
                                <div className="ev-detail-table">
                                    <div className="ev-detail-table-head">
                                        <span>Nom</span><span>Email</span><span>Téléphone</span>
                                    </div>
                                    {detail.guests.map(g => (
                                        <div key={g.id} className="ev-detail-table-ligne">
                                            <span>{g.full_name}</span>
                                            <span>{g.email || '—'}</span>
                                            <span>{g.phone || '—'}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Services */}
                        <div className="ev-detail-section">
                            <h4 className="ev-detail-bloc-titre">🧳 Services ({detail.services.length})</h4>
                            {detail.services.length === 0 ? (
                                <p className="ev-detail-vide">Aucun service associé.</p>
                            ) : (
                                <div className="ev-detail-table">
                                    <div className="ev-detail-table-head">
                                        <span>Service</span><span>Prix</span>
                                    </div>
                                    {detail.services.map(sv => (
                                        <div key={sv.id} className="ev-detail-table-ligne">
                                            <span>{sv.name}</span>
                                            <span>{parseFloat(sv.price).toFixed(2)} $</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

// ─── Modal formulaire ──────────────────────────────────────────────
function ModalFormulaire({ evenement, onFermer, onSauvegarde }) {
    const isEdit = !!evenement?.id;
    const toInput = (d) => d ? new Date(d).toISOString().slice(0, 16) : '';

    const [form, setForm] = useState({
        title:        evenement?.title        || '',
        description:  evenement?.description  || '',
        organizer_id: evenement?.organizer_id || '',
        start_date:   toInput(evenement?.start_date),
        end_date:     toInput(evenement?.end_date),
        room_id:      evenement?.room_id      || '',
        expected_guests: evenement?.expected_guests || '',
        status:       evenement?.status       || 'planned',
    });

    const [organisateurs, setOrganisateurs] = useState([]);
    const [salles, setSalles] = useState([]);
    const [chargement, setChargement] = useState(false);
    const [erreur, setErreur] = useState('');

    useEffect(() => {
        Promise.all([
            fetch(`${BASE}/api/users`, { headers: { Authorization: `Bearer ${token()}` } }).then(r => r.json()),
            fetch(`${BASE}/api/salles`, { headers: { Authorization: `Bearer ${token()}` } }).then(r => r.json()),
        ]).then(([users, sls]) => {
            setOrganisateurs(Array.isArray(users) ? users : []);
            setSalles(Array.isArray(sls) ? sls : []);
        }).catch(() => {});

        if (!isEdit) {
            const u = utilisateurLocal();
            if (u?.id) setForm(f => ({ ...f, organizer_id: u.id }));
        }
    }, []);

    const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const soumettre = async e => {
        e.preventDefault();
        setErreur('');
        if (!form.title || !form.start_date || !form.end_date || !form.organizer_id) {
            setErreur('Titre, organisateur et dates sont obligatoires.'); return;
        }

        const debut = new Date(form.start_date);
        const fin   = new Date(form.end_date);
        const maintenant = new Date();

        // Cette règle ne s'applique qu'à la création:
        // en modification, un événement peut naturellement avoir commencé.
        if (!isEdit && debut < new Date(maintenant.toDateString())) {
            setErreur('La date de début ne peut pas être dans le passé.'); return;
        }
        if (fin <= debut) {
            setErreur('La date de fin doit être après la date de début.'); return;
        }
        if (form.expected_guests) {
            const guests = parseInt(form.expected_guests, 10);
            if (Number.isNaN(guests) || guests <= 0) {
                setErreur('Le nombre d\'invités doit être un nombre positif.'); return;
            }
            if (form.room_id) {
                const salle = salles.find(s => String(s.id) === String(form.room_id));
                if (salle && guests > salle.capacity) {
                    setErreur(`Le nombre d'invités (${guests}) dépasse la capacité de la salle (${salle.capacity}).`); return;
                }
            }
        }

        setChargement(true);
        try {
            const method = isEdit ? 'PUT' : 'POST';
            const url    = isEdit ? `${BASE}/api/events/${evenement.id}` : `${BASE}/api/events`;
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
                body: JSON.stringify({ ...form, room_id: form.room_id || null }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            onSauvegarde();
        } catch (err) {
            setErreur(err.message);
        } finally {
            setChargement(false);
        }
    };

    return (
        <div className="ev-overlay" onClick={onFermer}>
            <div className="ev-modal" onClick={e => e.stopPropagation()}>
                <button className="ev-modal-fermer" onClick={onFermer}>✕</button>
                <h2 className="ev-modal-titre">{isEdit ? '✏️ Modifier l\'événement' : '➕ Nouvel événement'}</h2>

                {erreur && <div className="ev-form-erreur">⚠️ {erreur}</div>}

                <form onSubmit={soumettre} className="ev-form">
                    <div className="ev-form-champ">
                        <label>Titre *</label>
                        <input name="title" value={form.title} onChange={handleChange} placeholder="Ex: Gala de charité 2026" required />
                    </div>

                    <div className="ev-form-champ">
                        <label>Description</label>
                        <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Description de l'événement…" />
                    </div>

                    <div className="ev-form-grille-2">
                        <div className="ev-form-champ">
                            <label>Date & heure de début *</label>
                            <input type="datetime-local" name="start_date" value={form.start_date} onChange={handleChange} required />
                        </div>
                        <div className="ev-form-champ">
                            <label>Date & heure de fin *</label>
                            <input type="datetime-local" name="end_date" value={form.end_date} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="ev-form-champ">
                        <label>Nombre estimé d'invités</label>
                        <input
                            type="number"
                            min="1"
                            name="expected_guests"
                            value={form.expected_guests}
                            onChange={handleChange}
                            placeholder="Ex: 120"
                        />
                        <small className="ev-form-aide">Ne peut pas dépasser la capacité de la salle sélectionnée.</small>
                    </div>

                    <div className="ev-form-grille-2">
                        <div className="ev-form-champ">
                            <label>Organisateur *</label>
                            <select name="organizer_id" value={form.organizer_id} onChange={handleChange} required>
                                <option value="">— Sélectionner —</option>
                                {organisateurs.map(u => (
                                    <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="ev-form-champ">
                            <label>Salle</label>
                            <select name="room_id" value={form.room_id} onChange={handleChange}>
                                <option value="">— Aucune salle —</option>
                                {salles.map(s => (
                                    <option key={s.id} value={s.id}>{s.name} ({s.capacity} pers.)</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {isEdit && (
                        <div className="ev-form-champ">
                            <label>Statut</label>
                            <select name="status" value={form.status} onChange={handleChange}>
                                {Object.entries(STATUTS).map(([k, v]) => (
                                    <option key={k} value={k}>{v.emoji} {v.label}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="ev-form-actions">
                        <button type="button" className="ev-btn-secondaire" onClick={onFermer}>Annuler</button>
                        <button type="submit" className="ev-btn-primaire" disabled={chargement}>
                            {chargement ? '⏳ Enregistrement…' : isEdit ? '✅ Enregistrer' : '➕ Créer l\'événement'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Composant principal ───────────────────────────────────────────
export default function Evenements() {
    const [evenements, setEvenements] = useState([]);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState('');
    const [recherche, setRecherche] = useState('');
    const [filtreStatut, setFiltreStatut] = useState('tous');
    const [vue, setVue] = useState('grille'); // 'grille' | 'liste'
    const [modalDetail, setModalDetail] = useState(null);
    const [modalForm, setModalForm] = useState(null); // null | {} | {event}
    const [message, setMessage] = useState('');

    const user = utilisateurLocal();
    const role = user?.role;
    const isAdmin = role === 'admin';
    const canCreateEvent = ['admin', 'organisateur', 'coordonnateur'].includes(role);
    const canManageGuests = ['admin', 'organisateur', 'coordonnateur'].includes(role);

    const charger = useCallback(async () => {
        setChargement(true);
        setErreur('');
        try {
            const res = await fetch(`${BASE}/api/events`, { headers: { Authorization: `Bearer ${token()}` } });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setEvenements(data);
        } catch (err) {
            setErreur(err.message);
        } finally {
            setChargement(false);
        }
    }, []);

    useEffect(() => { charger(); }, [charger]);

    useEffect(() => {
        if (!evenements.length) return;
        const eventIdToView = Number(localStorage.getItem(RESA_EVENT_VIEW_KEY));
        const eventIdToEdit = Number(localStorage.getItem(RESA_EVENT_EDIT_KEY));
        if (!eventIdToEdit && !eventIdToView) return;

        const targetId = eventIdToEdit || eventIdToView;
        const cible = evenements.find((e) => Number(e.id) === targetId);
        if (cible) {
            if (eventIdToEdit) {
                setModalForm(cible);
            } else {
                setModalDetail(cible.id);
            }
            localStorage.removeItem(RESA_EVENT_EDIT_KEY);
            localStorage.removeItem(RESA_EVENT_VIEW_KEY);
        }
    }, [evenements]);

    const supprimerEvenement = async (id, titre) => {
        if (!window.confirm(`Supprimer l'événement "${titre}" et toutes ses données ?`)) return;
        try {
            const res = await fetch(`${BASE}/api/events/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token()}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setMessage('✅ Événement supprimé.');
            charger();
        } catch (err) {
            setMessage(`⚠️ ${err.message}`);
        } finally {
            setTimeout(() => setMessage(''), 4000);
        }
    };

    const changerStatut = async (id, status) => {
        try {
            const res = await fetch(`${BASE}/api/events/${id}/statut`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
                body: JSON.stringify({ status })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setMessage(`✅ ${data.message}`);
            charger();
        } catch (err) {
            setMessage(`⚠️ ${err.message}`);
        } finally {
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const confirmerEvenement = async (id, titre) => {
        if (!window.confirm(`Confirmer et planifier l'événement « ${titre} » ?`)) return;
        try {
            const res = await fetch(`${BASE}/api/events/${id}/confirmer`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setMessage(`✅ ${data.message}`);
            charger();
        } catch (err) {
            setMessage(`⚠️ ${err.message}`);
        } finally {
            setTimeout(() => setMessage(''), 4000);
        }
    };

    // Filtrage
    const filtres = evenements
        .filter(e => filtreStatut === 'tous' || e.status === filtreStatut)
        .filter(e =>
            e.title?.toLowerCase().includes(recherche.toLowerCase()) ||
            e.organizer_name?.toLowerCase().includes(recherche.toLowerCase()) ||
            e.room_name?.toLowerCase().includes(recherche.toLowerCase())
        );

    // Compteurs par statut
    const comptes = Object.keys(STATUTS).reduce((acc, k) => {
        acc[k] = evenements.filter(e => e.status === k).length;
        return acc;
    }, {});

    return (
        <div className="evenements">
            {/* En-tête */}
            <div className="ev-header">
                <div>
                    <h1 className="ev-titre">Événements</h1>
                    <p className="ev-sous-titre">{evenements.length} événement{evenements.length !== 1 ? 's' : ''} au total</p>
                </div>
                {canCreateEvent && (
                    <button className="ev-btn-primaire" onClick={() => setModalForm({})}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Nouvel événement
                    </button>
                )}
            </div>

            {/* Cartes de stats rapides */}
            <div className="ev-stats-bande">
                {Object.entries(STATUTS).map(([k, v]) => (
                    <button
                        key={k}
                        className={`ev-stat-pill ${filtreStatut === k ? 'ev-stat-pill--actif' : ''}`}
                        onClick={() => setFiltreStatut(filtreStatut === k ? 'tous' : k)}
                    >
                        {v.emoji} {v.label} <span className="ev-stat-nb">{comptes[k]}</span>
                    </button>
                ))}
            </div>

            {/* Message flash */}
            {message && <div className="ev-flash">{message}</div>}
            {erreur   && <div className="ev-flash ev-flash--erreur">⚠️ {erreur}</div>}

            {/* Barre de recherche + vue */}
            <div className="ev-barre">
                <div className="ev-recherche-wrap">
                    <svg className="ev-recherche-icone" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input
                        className="ev-recherche"
                        placeholder="Rechercher un événement, organisateur, salle…"
                        value={recherche}
                        onChange={e => setRecherche(e.target.value)}
                    />
                    {recherche && <button className="ev-recherche-clear" onClick={() => setRecherche('')}>✕</button>}
                </div>

                <div className="ev-vue-toggle">
                    <button className={vue === 'grille' ? 'actif' : ''} onClick={() => setVue('grille')} title="Vue grille">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                    </button>
                    <button className={vue === 'liste' ? 'actif' : ''} onClick={() => setVue('liste')} title="Vue liste">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                    </button>
                </div>
            </div>

            {/* Contenu */}
            {chargement ? (
                <div className="ev-chargement">
                    <div className="ev-spinner" />
                    <p>Chargement des événements…</p>
                </div>
            ) : filtres.length === 0 ? (
                <div className="ev-vide">
                    <span className="ev-vide-icone">🎉</span>
                    <p>Aucun événement{recherche ? ' correspondant à votre recherche' : ''} trouvé.</p>
                    {isAdmin && !recherche && (
                        <button className="ev-btn-primaire" onClick={() => setModalForm({})}>Créer le premier événement</button>
                    )}
                </div>
            ) : vue === 'grille' ? (
                <div className="ev-grille">
                    {filtres.map(ev => (
                        <CarteEvenement
                            key={ev.id} ev={ev}
                            onVoir={setModalDetail}
                            onEditer={e => setModalForm(e)}
                            onSupprimer={supprimerEvenement}
                            onStatut={changerStatut}
                            onConfirmer={confirmerEvenement}
                            isAdmin={isAdmin}
                        />
                    ))}
                </div>
            ) : (
                <div className="ev-table-wrap">
                    <div className="ev-table-head">
                        <span>#</span><span>Titre</span><span>Salle</span><span>Organisateur</span>
                        <span>Début</span><span>Fin</span><span>Invités</span><span>Statut</span>
                        {isAdmin && <span>Actions</span>}
                    </div>
                    {filtres.map(ev => {
                        const invitesAffiches = ev.expected_guests ?? ev.nb_guests ?? 0;
                        return (
                        <div key={ev.id} className="ev-table-ligne" onClick={() => setModalDetail(ev.id)}>
                            <span className="ev-table-id">#{ev.id}</span>
                            <span className="ev-table-principal">{ev.title}</span>
                            <span>{ev.room_name || '—'}</span>
                            <span>{ev.organizer_name || '—'}</span>
                            <span>{fmt(ev.start_date)}</span>
                            <span>{fmt(ev.end_date)}</span>
                            <span>{invitesAffiches}</span>
                            <span><BadgeStatut status={ev.status} /></span>
                            {isAdmin && (
                                <span onClick={e => e.stopPropagation()} className="ev-table-actions">
                                    <button className="ev-btn-action ev-btn-action--edit" onClick={() => setModalForm(ev)}>✏️</button>
                                    <button className="ev-btn-action ev-btn-action--del" onClick={() => supprimerEvenement(ev.id, ev.title)}>🗑️</button>
                                </span>
                            )}
                        </div>
                        );
                    })}
                </div>
            )}

            {/* Modals */}
            {modalDetail && (
                <ModalDetail
                    eventId={modalDetail}
                    onFermer={() => setModalDetail(null)}
                    onEditer={e => { setModalDetail(null); setModalForm(e); }}
                    isAdmin={isAdmin}
                    canManageGuests={canManageGuests}
                />
            )}

            {modalForm !== null && (
                <ModalFormulaire
                    evenement={modalForm}
                    onFermer={() => setModalForm(null)}
                    onSauvegarde={() => {
                        setModalForm(null);
                        setMessage('✅ Événement enregistré avec succès !');
                        charger();
                        setTimeout(() => setMessage(''), 4000);
                    }}
                />
            )}
        </div>
    );
}
