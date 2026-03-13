import React, { useState, useEffect } from 'react'


const statsData = [
  { label: 'Revenus ce mois', valeur: '48 320 $', delta: '+12%', positif: true, icone: '💰' },
  { label: 'Réservations actives', valeur: '34', delta: '+5', positif: true, icone: '🗓️' },
  { label: "Taux d'occupation", valeur: '78 %', delta: '+3%', positif: true, icone: '🏨' },
  { label: 'Événements ce mois', valeur: '9', delta: '-2', positif: false, icone: '🎉' },
]

const reservationsRecentes = [
  { id: 'RES-1042', client: 'Marie Tremblay', chambre: 'Suite Royale', arrivee: '28 fév', depart: '2 mars', statut: 'confirmee', montant: '1 240 $' },
  { id: 'RES-1041', client: 'Jean-Pierre Gagnon', chambre: 'Chambre Deluxe', arrivee: '27 fév', depart: '1 mars', statut: 'en_cours', montant: '520 $' },
  { id: 'RES-1040', client: 'Sophie Bouchard', chambre: 'Suite Junior', arrivee: '1 mars', depart: '4 mars', statut: 'confirmee', montant: '870 $' },
  { id: 'RES-1039', client: 'Marc Lavoie', chambre: 'Chambre Standard', arrivee: '3 mars', depart: '5 mars', statut: 'en_attente', montant: '320 $' },
  { id: 'RES-1038', client: 'Isabelle Roy', chambre: 'Suite Prestige', arrivee: '5 mars', depart: '8 mars', statut: 'confirmee', montant: '1 890 $' },
]

const evenementsProchains = [
  { nom: 'Banquet de mariage Tremblay', date: '1 mars', salle: 'Grande Salle', invites: 120 },
  { nom: 'Conférence Tech Mtl 2026', date: '5 mars', salle: 'Salle Bellevue', invites: 80 },
  { nom: 'Gala de charité annuel', date: '12 mars', salle: 'Terrasse Sud', invites: 200 },
]

const barData = [60, 80, 45, 90, 70, 85, 78]
const barLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const maxBar = Math.max(...barData)

const statutConfig = {
  confirmee: { label: 'Confirmée', cls: 'statut--confirmee' },
  en_cours: { label: 'En cours', cls: 'statut--en-cours' },
  en_attente: { label: 'En attente', cls: 'statut--en-attente' },
}

export default function Dashboard() {
  const [activeFilter, setActiveFilter] = useState('tous')
  const [utilisateur, setUtilisateur] = useState(null)

  useEffect(() => {
    const data = localStorage.getItem('utilisateur');
    if (data) {
      setUtilisateur(JSON.parse(data));
    }
  }, []);

  const reservationsFiltrees = activeFilter === 'tous'
    ? reservationsRecentes
    : reservationsRecentes.filter(r => r.statut === activeFilter)

  return (
    <div className="dashboard">

      {/* En-tête */}
      <div className="dashboard-header">
        <div className="dashboard-header-texte">
          <span className="dashboard-salutation">
            Bonjour, {utilisateur ? utilisateur.first_name || utilisateur.email.split('@')[0] : 'Invité'} 👋
          </span>
          <h1 className="dashboard-titre">Tableau de bord</h1>
          <p className="dashboard-date">Jeudi 27 février 2026 · Hôtel de la Promenade</p>
        </div>
        <div className="dashboard-header-actions">
          <button className="bouton bouton--secondaire bouton--petit">📄 Rapport</button>
          <button className="bouton bouton--primaire bouton--petit">+ Réservation</button>
        </div>
      </div>

      {/* Cartes de stats */}
      <div className="dashboard-stats">
        {statsData.map((stat, i) => (
          <div className="stat-carte" key={i}>
            <div className="stat-icone">{stat.icone}</div>
            <div className="stat-corps">
              <span className="stat-label">{stat.label}</span>
              <span className="stat-valeur">{stat.valeur}</span>
            </div>
            <span className={`stat-delta ${stat.positif ? 'stat-delta--positif' : 'stat-delta--negatif'}`}>
              {stat.positif ? '↑' : '↓'} {stat.delta}
            </span>
          </div>
        ))}
      </div>

      {/* Corps principal */}
      <div className="dashboard-corps">

        {/* Colonne gauche : Réservations */}
        <div className="dashboard-col-principale">

          <div className="dashboard-section-header">
            <h2 className="dashboard-section-titre">Réservations récentes</h2>
            <div className="dashboard-filtres">
              {[['tous', 'Toutes'], ['confirmee', 'Confirmées'], ['en_cours', 'En cours'], ['en_attente', 'En attente']].map(([val, lbl]) => (
                <button
                  key={val}
                  className={`filtre-btn ${activeFilter === val ? 'filtre-btn--actif' : ''}`}
                  onClick={() => setActiveFilter(val)}
                >{lbl}</button>
              ))}
            </div>
          </div>

          <div className="reservations-table">
            <div className="table-header">
              <span>ID</span>
              <span>Client</span>
              <span>Chambre</span>
              <span>Période</span>
              <span>Montant</span>
              <span>Statut</span>
            </div>
            {reservationsFiltrees.map((r) => (
              <div className="table-ligne" key={r.id}>
                <span className="table-id">{r.id}</span>
                <span className="table-client">{r.client}</span>
                <span className="table-chambre">{r.chambre}</span>
                <span className="table-periode">{r.arrivee} → {r.depart}</span>
                <span className="table-montant">{r.montant}</span>
                <span className={`statut-badge ${statutConfig[r.statut].cls}`}>
                  {statutConfig[r.statut].label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Colonne droite */}
        <div className="dashboard-col-secondaire">

          {/* Occupation hebdomadaire */}
          <div className="dashboard-widget">
            <h3 className="widget-titre">Occupation cette semaine</h3>
            <div className="barchart">
              {barData.map((val, i) => (
                <div className="bar-groupe" key={i}>
                  <div className="bar-wrap">
                    <div
                      className="bar"
                      style={{ height: `${(val / maxBar) * 100}%` }}
                      title={`${val}%`}
                    />
                  </div>
                  <span className="bar-label">{barLabels[i]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Événements prochains */}
          <div className="dashboard-widget">
            <h3 className="widget-titre">Événements à venir</h3>
            <div className="evenements-liste">
              {evenementsProchains.map((ev, i) => (
                <div className="evenement-item" key={i}>
                  <div className="evenement-date-badge">{ev.date}</div>
                  <div className="evenement-info">
                    <span className="evenement-nom">{ev.nom}</span>
                    <span className="evenement-meta">{ev.salle} · {ev.invites} invités</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
