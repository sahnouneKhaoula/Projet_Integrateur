import { useState, useEffect } from 'react'

const statutConfig = {
  planned:   { label: 'Planifié',   cls: 'statut--en-attente' },
  ongoing:   { label: 'En cours',   cls: 'statut--en-cours'   },
  completed: { label: 'Terminé',    cls: 'statut--confirme'   },
  cancelled: { label: 'Annulé',     cls: 'statut--annule'     },
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('fr-CA', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function Dashboard() {
  const [stats, setStats]                     = useState(null)
  const [evenementsProchains, setEvenementsProchains] = useState([])
  const [evenementsRecents, setEvenementsRecents]     = useState([])
  const [filtreStatut, setFiltreStatut]       = useState('tous')
  const [chargement, setChargement]           = useState(true)
  const [erreur, setErreur]                   = useState('')
  const [utilisateur, setUtilisateur]         = useState(null)

  const token = localStorage.getItem('token')

  useEffect(() => {
    const data = localStorage.getItem('utilisateur')
    if (data) setUtilisateur(JSON.parse(data))
  }, [])

  useEffect(() => {
    const chargerStats = async () => {
      setChargement(true)
      setErreur('')
      try {
        const res = await fetch('http://localhost:3001/api/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (!res.ok) throw new Error('Impossible de charger les statistiques.')
        const data = await res.json()
        setStats(data.stats)
        setEvenementsProchains(data.evenements_prochains || [])
        setEvenementsRecents(data.evenements_recents || [])
      } catch (err) {
        setErreur(err.message)
      } finally {
        setChargement(false)
      }
    }
    chargerStats()
  }, [])

  // Filtrer les événements récents par statut
  const evenementsFiltres = filtreStatut === 'tous'
    ? evenementsRecents
    : evenementsRecents.filter(e => e.status === filtreStatut)

  const nomAffiche = utilisateur?.first_name || utilisateur?.email?.split('@')[0] || 'Invité'

  const aujourdhui = new Date().toLocaleDateString('fr-CA', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  return (
    <div className="dashboard">

      {/* En-tête */}
      <div className="dashboard-header">
        <div className="dashboard-header-texte">
          <span className="dashboard-salutation">Bonjour, {nomAffiche} 👋</span>
          <h1 className="dashboard-titre">Tableau de bord</h1>
          <p className="dashboard-date">{aujourdhui} · Hôtel La Promenade</p>
        </div>
        <div className="dashboard-header-actions">
          <button className="bouton bouton--secondaire bouton--petit">📄 Rapport</button>
          <button className="bouton bouton--primaire bouton--petit">+ Événement</button>
        </div>
      </div>

      {/* Erreur */}
      {erreur && (
        <div style={{ padding: '1rem', background: 'rgba(239,83,80,0.1)', color: '#ef5350', borderRadius: '8px', marginBottom: '1.5rem' }}>
          ⚠️ {erreur}
        </div>
      )}

      {/* Cartes de stats */}
      {chargement ? (
        <div style={{ color: 'var(--mute-texte)', padding: '2rem', textAlign: 'center' }}>Chargement des données…</div>
      ) : (
        <>
          <div className="dashboard-stats">
            <div className="stat-carte">
              <div className="stat-icone">🎉</div>
              <div className="stat-corps">
                <span className="stat-label">Événements ce mois</span>
                <span className="stat-valeur">{stats?.nb_events_ce_mois ?? '—'}</span>
              </div>
              <span className="stat-delta stat-delta--positif">↑ Total : {stats?.nb_events_total ?? '—'}</span>
            </div>

            <div className="stat-carte">
              <div className="stat-icone">👥</div>
              <div className="stat-corps">
                <span className="stat-label">Clients inscrits</span>
                <span className="stat-valeur">{stats?.nb_clients ?? '—'}</span>
              </div>
              <span className="stat-delta stat-delta--positif">↑ Staff : {stats?.nb_staff ?? '—'}</span>
            </div>

            <div className="stat-carte">
              <div className="stat-icone">🗓️</div>
              <div className="stat-corps">
                <span className="stat-label">Réservations</span>
                <span className="stat-valeur">{stats?.nb_reservations ?? '—'}</span>
              </div>
              <span className="stat-delta stat-delta--positif">↑ Actives</span>
            </div>

            <div className="stat-carte">
              <div className="stat-icone">🏛️</div>
              <div className="stat-corps">
                <span className="stat-label">Salles disponibles</span>
                <span className="stat-valeur">{stats?.nb_salles ?? '—'}</span>
              </div>
              <span className="stat-delta stat-delta--positif">→ Espaces</span>
            </div>
          </div>

          {/* Corps principal */}
          <div className="dashboard-corps">

            {/* Colonne gauche : Événements récents */}
            <div className="dashboard-col-principale">
              <div className="dashboard-section-header">
                <h2 className="dashboard-section-titre">Événements récents</h2>
                <div className="dashboard-filtres">
                  {[['tous', 'Tous'], ['planned', 'Planifiés'], ['ongoing', 'En cours'], ['completed', 'Terminés'], ['cancelled', 'Annulés']].map(([val, lbl]) => (
                    <button
                      key={val}
                      className={`filtre-btn ${filtreStatut === val ? 'filtre-btn--actif' : ''}`}
                      onClick={() => setFiltreStatut(val)}
                    >{lbl}</button>
                  ))}
                </div>
              </div>

              <div className="reservations-table">
                <div className="table-header">
                  <span>#</span>
                  <span>Titre</span>
                  <span>Organisateur</span>
                  <span>Salle</span>
                  <span>Date début</span>
                  <span>Statut</span>
                </div>

                {evenementsFiltres.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--mute-texte)' }}>
                    Aucun événement trouvé.
                  </div>
                ) : evenementsFiltres.map((ev) => (
                  <div className="table-ligne" key={ev.id}>
                    <span className="table-id">#{ev.id}</span>
                    <span className="table-client">{ev.title}</span>
                    <span className="table-chambre">{ev.organisateur || '—'}</span>
                    <span className="table-periode">{ev.salle_nom || '—'}</span>
                    <span className="table-montant">{formatDate(ev.start_date)}</span>
                    <span className={`statut-badge ${statutConfig[ev.status]?.cls || ''}`}>
                      {statutConfig[ev.status]?.label || ev.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Colonne droite : Événements à venir */}
            <div className="dashboard-col-secondaire">
              <div className="dashboard-widget">
                <h3 className="widget-titre">Prochains événements</h3>
                <div className="evenements-liste">
                  {evenementsProchains.length === 0 ? (
                    <p style={{ color: 'var(--mute-texte)', fontSize: '0.875rem', padding: '1rem 0' }}>
                      Aucun événement à venir.
                    </p>
                  ) : evenementsProchains.map((ev) => (
                    <div className="evenement-item" key={ev.id}>
                      <div className="evenement-date-badge">
                        {new Date(ev.start_date).toLocaleDateString('fr-CA', { day: '2-digit', month: 'short' })}
                      </div>
                      <div className="evenement-info">
                        <span className="evenement-nom">{ev.title}</span>
                        <span className="evenement-meta">
                          {ev.salle_nom || 'Salle TBD'} · {ev.nb_invites} invité{ev.nb_invites !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Résumé rapide */}
              <div className="dashboard-widget">
                <h3 className="widget-titre">Résumé</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingTop: '0.5rem' }}>
                  {[
                    { label: 'Total événements', val: stats?.nb_events_total },
                    { label: 'Ce mois-ci', val: stats?.nb_events_ce_mois },
                    { label: 'Réservations', val: stats?.nb_reservations },
                    { label: 'Clients', val: stats?.nb_clients },
                    { label: 'Membres Staff', val: stats?.nb_staff },
                    { label: 'Salles', val: stats?.nb_salles },
                  ].map(({ label, val }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
                      <span style={{ color: 'var(--mute-texte)' }}>{label}</span>
                      <span style={{ fontWeight: 700, color: 'var(--primaire)' }}>{val ?? '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  )
}
