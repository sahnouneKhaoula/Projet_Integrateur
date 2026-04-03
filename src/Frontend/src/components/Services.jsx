import { useState, useEffect, useCallback } from 'react';
import '../Style/pages/Services.css';

const BASE = 'http://localhost:3002';
const token = () => localStorage.getItem('token');
const utilisateurLocal = () => {
    try { return JSON.parse(localStorage.getItem('utilisateur') || '{}'); } catch { return {}; }
};

// ─── Config statuts ────────────────────────────────────────────────────────────
const STATUTS_SVC = {
    'DEMANDÉ':                 { label: 'Demandé',              cls: 'svc-badge--demande',    emoji: '📋' },
    'EN_ATTENTE_D_AJUSTEMENT': { label: 'Attente ajustement',   cls: 'svc-badge--ajustement', emoji: '⏳' },
    'VALIDÉ':                  { label: 'Validé',               cls: 'svc-badge--valide',     emoji: '✅' },
    'PROGRAMMÉ':               { label: 'Programmé',            cls: 'svc-badge--programme',  emoji: '📅' },
};

const fmt = (d) => d ? new Date(d).toLocaleDateString('fr-CA', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

function BadgeStatut({ statut }) {
    const s = STATUTS_SVC[statut] || { label: statut, cls: '', emoji: '?' };
    return <span className={`svc-badge ${s.cls}`}>{s.emoji} {s.label}</span>;
}

// ─── Vue Organisateur : soumettre une demande de service ───────────────────────
function FormulaireDemandeService({ eventId, eventTitre, onFermer, onSauvegarde }) {
    const [lignes, setLignes] = useState([
        { name: '', description: '', quantite: 1, date_souhaitee: '', price: '' }
    ]);
    const [chargement, setChargement] = useState(false);
    const [erreur, setErreur] = useState('');

    const ajouterLigne = () =>
        setLignes(l => [...l, { name: '', description: '', quantite: 1, date_souhaitee: '', price: '' }]);

    const supprimerLigne = (i) =>
        setLignes(l => l.filter((_, idx) => idx !== i));

    const changerLigne = (i, champ, val) =>
        setLignes(l => l.map((ligne, idx) => idx === i ? { ...ligne, [champ]: val } : ligne));

    const soumettre = async () => {
        if (lignes.some(l => !l.name.trim())) {
            setErreur('Le nom est obligatoire pour chaque service.'); return;
        }
        setErreur('');
        setChargement(true);
        try {
            const payload = lignes.map(l => ({
                name: l.name.trim(),
                description: l.description.trim() || undefined,
                quantite: parseInt(l.quantite) || 1,
                date_souhaitee: l.date_souhaitee || undefined,
                price: parseFloat(l.price) || 0,
            }));

            const res = await fetch(`${BASE}/api/events/${eventId}/services`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            onSauvegarde(`✅ ${data.service_ids.length} demande(s) soumise(s) avec succès.`);
        } catch (err) {
            setErreur(err.message);
        } finally {
            setChargement(false);
        }
    };

    return (
        <div className="svc-overlay" onClick={onFermer}>
            <div className="svc-modal svc-modal--large" onClick={e => e.stopPropagation()}>
                <button className="svc-modal-fermer" onClick={onFermer}>✕</button>
                <h2 className="svc-modal-titre">📋 Soumettre des demandes de services</h2>
                {eventTitre && <p className="svc-modal-sous-titre">Pour : <strong>{eventTitre}</strong></p>}

                {erreur && <div className="svc-alerte svc-alerte--erreur">⚠️ {erreur}</div>}

                <div className="svc-demande-liste">
                    {lignes.map((ligne, i) => (
                        <div key={i} className="svc-demande-ligne">
                            <div className="svc-demande-ligne-entete">
                                <span className="svc-demande-nb">Service #{i + 1}</span>
                                {lignes.length > 1 && (
                                    <button className="svc-btn-icon svc-btn-supprimer" onClick={() => supprimerLigne(i)} title="Supprimer">✕</button>
                                )}
                            </div>

                            <div className="svc-form-grille-2">
                                <div className="svc-form-champ">
                                    <label>Nom du service *</label>
                                    <input
                                        value={ligne.name}
                                        onChange={e => changerLigne(i, 'name', e.target.value)}
                                        placeholder="Ex: Traiteur, Décoration florale…"
                                    />
                                </div>
                                <div className="svc-form-champ">
                                    <label>Quantité</label>
                                    <input
                                        type="number" min="1"
                                        value={ligne.quantite}
                                        onChange={e => changerLigne(i, 'quantite', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="svc-form-champ">
                                <label>Description / précisions</label>
                                <textarea
                                    rows={2}
                                    value={ligne.description}
                                    onChange={e => changerLigne(i, 'description', e.target.value)}
                                    placeholder="Détails, allergies, style, couleurs…"
                                />
                            </div>

                            <div className="svc-form-grille-2">
                                <div className="svc-form-champ">
                                    <label>Date souhaitée</label>
                                    <input
                                        type="datetime-local"
                                        value={ligne.date_souhaitee}
                                        onChange={e => changerLigne(i, 'date_souhaitee', e.target.value)}
                                    />
                                </div>
                                <div className="svc-form-champ">
                                    <label>Budget estimé ($)</label>
                                    <input
                                        type="number" min="0" step="0.01"
                                        value={ligne.price}
                                        onChange={e => changerLigne(i, 'price', e.target.value)}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <button className="svc-btn-ajouter-ligne" onClick={ajouterLigne}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Ajouter un service
                </button>

                <div className="svc-form-actions">
                    <button className="svc-btn-secondaire" onClick={onFermer}>Annuler</button>
                    <button className="svc-btn-primaire" onClick={soumettre} disabled={chargement}>
                        {chargement ? '⏳ Envoi en cours…' : '📤 Soumettre les demandes'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Vue Coordinateur : traiter une demande ────────────────────────────────────
function ModalTraitement({ demande, onFermer, onTraitement }) {
    const [action, setAction] = useState('');
    const [notes, setNotes] = useState('');
    const [chargement, setChargement] = useState(false);
    const [erreur, setErreur] = useState('');

    const traiter = async () => {
        if (!action) { setErreur('Choisissez une action.'); return; }
        setErreur('');
        setChargement(true);
        try {
            const res = await fetch(`${BASE}/api/services/${demande.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
                body: JSON.stringify({ action, notes }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            onTraitement(`✅ ${data.message}`);
        } catch (err) {
            setErreur(err.message);
        } finally {
            setChargement(false);
        }
    };

    return (
        <div className="svc-overlay" onClick={onFermer}>
            <div className="svc-modal" onClick={e => e.stopPropagation()}>
                <button className="svc-modal-fermer" onClick={onFermer}>✕</button>
                <h2 className="svc-modal-titre">🔧 Traiter la demande</h2>

                <div className="svc-traitement-infos">
                    <div className="svc-detail-ligne"><span>Service</span><strong>{demande.name}</strong></div>
                    <div className="svc-detail-ligne"><span>Événement</span><strong>{demande.event_title}</strong></div>
                    <div className="svc-detail-ligne"><span>Organisateur</span><strong>{demande.organizer_name}</strong></div>
                    {demande.description && <div className="svc-detail-ligne"><span>Précisions</span><strong>{demande.description}</strong></div>}
                    <div className="svc-detail-ligne"><span>Quantité</span><strong>{demande.quantite}</strong></div>
                    {demande.date_souhaitee && <div className="svc-detail-ligne"><span>Date souhaitée</span><strong>{fmt(demande.date_souhaitee)}</strong></div>}
                    <div className="svc-detail-ligne"><span>Budget</span><strong>{parseFloat(demande.price || 0).toFixed(2)} $</strong></div>
                    <div className="svc-detail-ligne"><span>Statut actuel</span><BadgeStatut statut={demande.statut} /></div>
                </div>

                {erreur && <div className="svc-alerte svc-alerte--erreur">⚠️ {erreur}</div>}

                <div className="svc-action-choix">
                    <button
                        className={`svc-action-btn svc-action-btn--valider ${action === 'valider' ? 'actif' : ''}`}
                        onClick={() => setAction('valider')}
                    >
                        <span className="svc-action-icone">✅</span>
                        <div>
                            <strong>Valider & Programmer</strong>
                            <small>Statut : VALIDÉ → PROGRAMMÉ. L'organisateur sera notifié.</small>
                        </div>
                    </button>

                    <button
                        className={`svc-action-btn svc-action-btn--ajuster ${action === 'ajuster' ? 'actif' : ''}`}
                        onClick={() => setAction('ajuster')}
                    >
                        <span className="svc-action-icone">⏳</span>
                        <div>
                            <strong>Demander un ajustement</strong>
                            <small>Statut : EN_ATTENTE_D_AJUSTEMENT. L'organisateur sera notifié.</small>
                        </div>
                    </button>
                </div>

                {action === 'ajuster' && (
                    <div className="svc-form-champ" style={{ marginTop: '1rem' }}>
                        <label>Notes pour l'organisateur</label>
                        <textarea
                            rows={3}
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="Précisez ce qui manque ou doit être ajusté…"
                        />
                    </div>
                )}

                <div className="svc-form-actions">
                    <button className="svc-btn-secondaire" onClick={onFermer}>Annuler</button>
                    <button className="svc-btn-primaire" onClick={traiter} disabled={!action || chargement}>
                        {chargement ? '⏳ Traitement…' : 'Confirmer'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Composant principal ───────────────────────────────────────────────────────
export default function Services() {
    const user = utilisateurLocal();
    const role = user?.role;
    const isAdmin = role === 'admin';
    const isOrganisateur = role === 'organisateur';
    const isCoord = isAdmin || role === 'coordonnateur' || role === 'coordinateur';

    // Vue coordinateur : demandes à traiter
    const [demandes, setDemandes] = useState([]);
    // Vue tous : tous les services
    const [tousServices, setTousServices] = useState([]);
    // État UI
    const [onglet, setOnglet] = useState(isCoord ? 'a-traiter' : 'mes-demandes');
    const [chargement, setChargement] = useState(false);
    const [message, setMessage] = useState('');
    const [recherche, setRecherche] = useState('');
    const [filtreStatut, setFiltreStatut] = useState('tous');
    const [modalDemande, setModalDemande] = useState(false);   // formulaire soumission
    const [modalTraitement, setModalTraitement] = useState(null); // traiter une demande
    const [evenements, setEvenements] = useState([]);
    const [eventChoisi, setEventChoisi] = useState('');

    const flash = (msg) => { setMessage(msg); setTimeout(() => setMessage(''), 5000); };

    // Charger la liste des événements pour l'organisateur
    useEffect(() => {
        if (!isOrganisateur && !isAdmin) return;
        fetch(`${BASE}/api/events`, { headers: { Authorization: `Bearer ${token()}` } })
            .then(r => r.json())
            .then(d => setEvenements(Array.isArray(d) ? d : []))
            .catch(() => {});
    }, []);

    const chargerDemandes = useCallback(async () => {
        if (!isCoord) return;
        setChargement(true);
        try {
            const res = await fetch(`${BASE}/api/services/a-traiter`, { headers: { Authorization: `Bearer ${token()}` } });
            const d = await res.json();
            setDemandes(Array.isArray(d) ? d : []);
        } catch { setDemandes([]); }
        finally { setChargement(false); }
    }, [isCoord]);

    const chargerTous = useCallback(async () => {
        setChargement(true);
        try {
            const res = await fetch(`${BASE}/api/services`, { headers: { Authorization: `Bearer ${token()}` } });
            const d = await res.json();
            setTousServices(Array.isArray(d) ? d : []);
        } catch { setTousServices([]); }
        finally { setChargement(false); }
    }, []);

    useEffect(() => {
        if (onglet === 'a-traiter') chargerDemandes();
        else chargerTous();
    }, [onglet, chargerDemandes, chargerTous]);

    // Filtrage
    const filtrerServices = (liste) => liste
        .filter(s => filtreStatut === 'tous' || s.statut === filtreStatut)
        .filter(s =>
            s.name?.toLowerCase().includes(recherche.toLowerCase()) ||
            s.event_title?.toLowerCase().includes(recherche.toLowerCase()) ||
            s.organizer_name?.toLowerCase().includes(recherche.toLowerCase())
        );

    const demandesFiltrees   = filtrerServices(demandes);
    const servicesFiltres     = filtrerServices(tousServices);
    const liste = onglet === 'a-traiter' ? demandesFiltrees : servicesFiltres;

    // Compteurs par statut (pour les pills)
    const source = onglet === 'a-traiter' ? demandes : tousServices;
    const comptes = Object.keys(STATUTS_SVC).reduce((acc, k) => {
        acc[k] = source.filter(s => s.statut === k).length;
        return acc;
    }, {});

    return (
        <div className="svc-page">
            {/* ─── En-tête ─────────────────────────────── */}
            <div className="svc-header">
                <div>
                    <h1 className="svc-titre">Coordination des services</h1>
                    <p className="svc-sous-titre">Gestion et suivi des demandes de services événementiels</p>
                </div>

                {(isOrganisateur || isAdmin) && (
                    <button className="svc-btn-primaire" onClick={() => setModalDemande(true)}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Soumettre une demande
                    </button>
                )}
            </div>

            {/* ─── Onglets ─────────────────────────────── */}
            <div className="svc-onglets">
                {isCoord && (
                    <button
                        className={`svc-onglet ${onglet === 'a-traiter' ? 'actif' : ''}`}
                        onClick={() => setOnglet('a-traiter')}
                    >
                        ⚙️ À traiter
                        {demandes.length > 0 && <span className="svc-badge-count">{demandes.length}</span>}
                    </button>
                )}
                <button
                    className={`svc-onglet ${onglet === 'mes-demandes' ? 'actif' : ''}`}
                    onClick={() => setOnglet('mes-demandes')}
                >
                    📋 Tous les services
                </button>
            </div>

            {/* ─── Filtres statut ────────────────────── */}
            <div className="svc-pills">
                <button
                    className={`svc-pill ${filtreStatut === 'tous' ? 'actif' : ''}`}
                    onClick={() => setFiltreStatut('tous')}
                >
                    Tous <span className="svc-pill-nb">{source.length}</span>
                </button>
                {Object.entries(STATUTS_SVC).map(([k, v]) => (
                    comptes[k] > 0 && (
                        <button
                            key={k}
                            className={`svc-pill ${filtreStatut === k ? 'actif' : ''}`}
                            onClick={() => setFiltreStatut(filtreStatut === k ? 'tous' : k)}
                        >
                            {v.emoji} {v.label} <span className="svc-pill-nb">{comptes[k]}</span>
                        </button>
                    )
                ))}
            </div>

            {/* ─── Barre de recherche ────────────────── */}
            <div className="svc-barre">
                <div className="svc-recherche-wrap">
                    <svg className="svc-recherche-icone" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input
                        className="svc-recherche"
                        placeholder="Rechercher un service, événement, organisateur…"
                        value={recherche}
                        onChange={e => setRecherche(e.target.value)}
                    />
                    {recherche && <button className="svc-recherche-clear" onClick={() => setRecherche('')}>✕</button>}
                </div>
            </div>

            {/* ─── Flash message ─────────────────────── */}
            {message && <div className="svc-flash">{message}</div>}

            {/* ─── Contenu ───────────────────────────── */}
            {chargement ? (
                <div className="svc-chargement">
                    <div className="svc-spinner" />
                    <p>Chargement…</p>
                </div>
            ) : liste.length === 0 ? (
                <div className="svc-vide">
                    <span className="svc-vide-icone">🛎️</span>
                    <p>{onglet === 'a-traiter' ? 'Aucune demande en attente de traitement.' : 'Aucun service trouvé.'}</p>
                    {isOrganisateur && onglet !== 'a-traiter' && (
                        <button className="svc-btn-primaire" onClick={() => setModalDemande(true)}>
                            Soumettre une première demande
                        </button>
                    )}
                </div>
            ) : (
                <div className="svc-table-wrap">
                    <div className="svc-table-head">
                        <span>Service</span>
                        <span>Événement</span>
                        <span>Organisateur</span>
                        <span>Qté</span>
                        <span>Date souhaitée</span>
                        <span>Prix</span>
                        <span>Statut</span>
                        {isCoord && onglet === 'a-traiter' && <span>Action</span>}
                    </div>

                    {liste.map(svc => (
                        <div key={svc.id} className="svc-table-ligne">
                            <span className="svc-table-nom">
                                <strong>{svc.name}</strong>
                                {svc.description && <small className="svc-table-desc">{svc.description}</small>}
                            </span>
                            <span>{svc.event_title || '—'}</span>
                            <span>{svc.organizer_name || '—'}</span>
                            <span>{svc.quantite || 1}</span>
                            <span>{svc.date_souhaitee ? fmt(svc.date_souhaitee) : '—'}</span>
                            <span>{parseFloat(svc.price || 0).toFixed(2)} $</span>
                            <span><BadgeStatut statut={svc.statut} /></span>
                            {isCoord && onglet === 'a-traiter' && (
                                <span>
                                    <button
                                        className="svc-btn-traiter"
                                        onClick={() => setModalTraitement(svc)}
                                    >
                                        ⚙️ Traiter
                                    </button>
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* ─── Modals ────────────────────────────── */}
            {modalDemande && (
                <FormulaireDemandeService
                    eventId={eventChoisi || (evenements[0]?.id)}
                    eventTitre={evenements.find(e => String(e.id) === String(eventChoisi))?.title || evenements[0]?.title}
                    onFermer={() => setModalDemande(false)}
                    onSauvegarde={(msg) => {
                        setModalDemande(false);
                        flash(msg);
                        chargerTous();
                        if (isCoord) chargerDemandes();
                    }}
                >
                    {/* Sélecteur d'événement intégré dans l'overlay */}
                    {evenements.length > 1 && (
                        <div className="svc-form-champ" style={{ marginBottom: '1rem' }}>
                            <label>Événement concerné *</label>
                            <select value={eventChoisi} onChange={e => setEventChoisi(e.target.value)}>
                                {evenements.map(ev => (
                                    <option key={ev.id} value={ev.id}>{ev.title}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </FormulaireDemandeService>
            )}

            {modalTraitement && (
                <ModalTraitement
                    demande={modalTraitement}
                    onFermer={() => setModalTraitement(null)}
                    onTraitement={(msg) => {
                        setModalTraitement(null);
                        flash(msg);
                        chargerDemandes();
                        chargerTous();
                    }}
                />
            )}
        </div>
    );
}