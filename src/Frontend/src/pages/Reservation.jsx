import { useCallback, useEffect, useMemo, useState } from 'react';

const BASE = 'http://localhost:3002';
const token = () => localStorage.getItem('token');
const RESA_EVENT_EDIT_KEY = 'reservation_event_to_edit';
const RESA_EVENT_VIEW_KEY = 'reservation_event_to_view';

const statutLabel = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  cancelled: 'Annulée',
  completed: 'Terminée',
};

const fmtDateHeure = (value) =>
  new Date(value).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export default function Reservation() {
  const [lignes, setLignes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [recherche, setRecherche] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('actives');

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur('');
    try {
      const headers = { Authorization: `Bearer ${token()}` };
      const [resReservations, resEvents, resSalles] = await Promise.all([
        fetch(`${BASE}/api/reservations`, { headers }),
        fetch(`${BASE}/api/events`, { headers }),
        fetch(`${BASE}/api/salles`, { headers }),
      ]);

      const [reservationsData, eventsData, sallesData] = await Promise.all([
        resReservations.json(),
        resEvents.json(),
        resSalles.json(),
      ]);

      if (!resReservations.ok) {
        throw new Error(reservationsData.message || 'Erreur chargement des reservations.');
      }
      if (!resEvents.ok || !Array.isArray(eventsData)) {
        throw new Error('Erreur chargement des evenements.');
      }
      if (!resSalles.ok || !Array.isArray(sallesData)) {
        throw new Error('Erreur chargement des salles.');
      }

      const eventsMap = new Map(eventsData.map((e) => [Number(e.id), e]));
      const sallesMap = new Map(sallesData.map((s) => [Number(s.id), s]));

      const enrichies = reservationsData.map((r) => {
        const event = eventsMap.get(Number(r.event_id));
        const salle = sallesMap.get(Number(r.room_id));
        return {
          id: r.id,
          eventId: r.event_id,
          client: event?.title || `Evenement #${r.event_id ?? '-'}`,
          contact: event?.organizer_name || 'Non renseigne',
          espace: salle?.name || `Salle #${r.room_id ?? '-'}`,
          debut: r.reserved_from,
          fin: r.reserved_to,
          invites: event?.nb_guests || event?.expected_guests || 0,
          statut: (r.status || 'pending').toLowerCase(),
        };
      });

      setLignes(enrichies);
    } catch (err) {
      setErreur(err.message || 'Erreur de chargement.');
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    charger();
  }, [charger]);

  const reservations = useMemo(() => {
    const term = recherche.trim().toLowerCase();

    return lignes.filter((r) => {
      const matchTerm =
        term.length === 0 ||
        r.client.toLowerCase().includes(term) ||
        r.contact.toLowerCase().includes(term) ||
        r.espace.toLowerCase().includes(term) ||
        String(r.id).includes(term);

      const matchStatut =
        filtreStatut === 'tous' ||
        (filtreStatut === 'actives' && r.statut !== 'cancelled') ||
        r.statut === filtreStatut;
      return matchTerm && matchStatut;
    });
  }, [lignes, recherche, filtreStatut]);

  const stats = useMemo(() => {
    const total = lignes.length;
    const confirmees = lignes.filter((r) => r.statut === 'confirmed').length;
    const invites = lignes
      .filter((r) => r.statut !== 'cancelled' && r.statut !== 'completed')
      .reduce((acc, r) => acc + Number(r.invites || 0), 0);
    return { total, confirmees, invites };
  }, [lignes]);

  const ouvrirEvenement = (eventId, mode = 'view') => {
    if (!eventId) return;
    if (mode === 'edit') {
      localStorage.setItem(RESA_EVENT_EDIT_KEY, String(eventId));
      localStorage.removeItem(RESA_EVENT_VIEW_KEY);
    } else {
      localStorage.setItem(RESA_EVENT_VIEW_KEY, String(eventId));
      localStorage.removeItem(RESA_EVENT_EDIT_KEY);
    }
    window.dispatchEvent(new Event('open-events-tab'));
  };

  return (
    <section className="resa">
      <header className="resa-header">
        <div>
          <h1 className="resa-titre">Réservations</h1>
          <p className="resa-sous-titre">
            Vue opérationnelle des réservations de salles avec suivi rapide des statuts.
          </p>
        </div>
        <button className="resa-btn-primaire" type="button" onClick={charger}>
          Actualiser
        </button>
      </header>

      <div className="resa-kpis">
        <article className="resa-kpi">
          <span className="resa-kpi-label">Total réservations</span>
          <strong className="resa-kpi-valeur">{stats.total}</strong>
        </article>
        <article className="resa-kpi">
          <span className="resa-kpi-label">Confirmées</span>
          <strong className="resa-kpi-valeur">{stats.confirmees}</strong>
        </article>
        <article className="resa-kpi">
          <span className="resa-kpi-label">Invités prévus</span>
          <strong className="resa-kpi-valeur">{stats.invites}</strong>
        </article>
      </div>

      <div className="resa-barre">
        <input
          className="resa-recherche"
          type="text"
          placeholder="Rechercher: client, contact, salle ou #ID"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
        />
        <select
          className="resa-select"
          value={filtreStatut}
          onChange={(e) => setFiltreStatut(e.target.value)}
        >
          <option value="actives">Actives (sans annulées)</option>
          <option value="tous">Tous les statuts</option>
          <option value="confirmed">Confirmée</option>
          <option value="completed">Terminée</option>
          <option value="cancelled">Annulée</option>
        </select>
      </div>

      <div className="resa-table-wrap">
        <div className="resa-table-head">
          <span>ID</span>
          <span>Client</span>
          <span>Contact</span>
          <span>Espace</span>
          <span>Début</span>
          <span>Fin</span>
          <span>Invités</span>
          <span>Statut</span>
          <span>Actions</span>
        </div>

        {chargement ? (
          <div className="resa-empty">
            <p>Chargement des réservations...</p>
          </div>
        ) : erreur ? (
          <div className="resa-empty">
            <p>{erreur}</p>
          </div>
        ) : reservations.length === 0 ? (
          <div className="resa-empty">
            <p>Aucune réservation ne correspond aux filtres.</p>
          </div>
        ) : (
          reservations.map((r) => (
            <div className="resa-table-ligne" key={r.id}>
              <span className="resa-id">#{r.id}</span>
              <span className="resa-principal">{r.client}</span>
              <span>{r.contact}</span>
              <span>{r.espace}</span>
              <span>{fmtDateHeure(r.debut)}</span>
              <span>{fmtDateHeure(r.fin)}</span>
              <span>{r.invites}</span>
              <span>
                <span className={`resa-badge resa-badge--${r.statut}`}>
                  {statutLabel[r.statut] || r.statut}
                </span>
              </span>
              <span className="resa-actions">
                <button
                  type="button"
                  className="resa-action resa-action--voir"
                  title="Voir l'événement"
                  onClick={() => ouvrirEvenement(r.eventId, 'view')}
                >
                  Voir
                </button>
                <button
                  type="button"
                  className="resa-action resa-action--edit"
                  title="Modifier l'événement"
                  onClick={() => ouvrirEvenement(r.eventId, 'edit')}
                >
                  Edit
                </button>
              </span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
