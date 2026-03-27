/**
 * Application « back-office » (route /dashboard) : sidebar, onglets métier (événements, utilisateurs, etc.).
 * Ce n'est pas le site vitrine : les pages publiques sont dans pages/ + routes.jsx sous Layout.
 */
import { useState, useEffect } from 'react'
import './Style/index.css'
import Comptabilite from './components/Comptabilite'
import Dashboard from './components/Dashboard'
import Evenements from './components/Evenements'
import Espaces from './components/Espaces'
import Services from './components/Services'
import Parametres from './components/Parametres'
import GestionUtilisateurs from './components/GestionUtilisateurs'
import GestionRoles from './components/GestionRoles'
import Rapports from './components/Rapports'
import NotificationsBell from './components/NotificationsBell'

// --- Icônes SVG inline (style outline, similaire à la maquette) ---
const icons = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  events: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      <circle cx="12" cy="16" r="1" fill="currentColor" />
    </svg>
  ),
  reservations: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  rooms: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="1" /><path d="M9 3v18" /><path d="M3 9h6" /><path d="M3 15h6" />
    </svg>
  ),
  services: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      <line x1="12" y1="12" x2="12" y2="16" /><line x1="10" y1="14" x2="14" y2="14" />
    </svg>
  ),
  guests: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  invoices: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="13" y2="17" />
    </svg>
  ),
  reports: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  ),
  users: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" /><path d="M16 11h2a2 2 0 0 1 2 2" />
    </svg>
  ),
  roles: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  ),
  settings: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
}

// Structure du menu principal
const menuItems = [
  { id: 'Tableau de bord', label: 'Tableau de bord', icon: 'dashboard' },
  { id: 'Events',         label: 'Événements',      icon: 'events' },
  { id: 'Reservations',   label: 'Réservations',    icon: 'reservations' },
  { id: 'Espaces',        label: 'Salles & Espaces',  icon: 'rooms' },
  { id: 'Services',       label: 'Services',           icon: 'services' },
  { id: 'Guests',         label: 'Invités',           icon: 'guests' },
  { id: 'Comptabilité',   label: 'Comptabilité',     icon: 'invoices' },
  { id: 'Reports',        label: 'Rapports',           icon: 'reports' },
]

const adminItems = [
  { id: 'Utilisateurs', label: 'Utilisateurs',  icon: 'users' },
  { id: 'Roles',        label: 'Rôles',          icon: 'roles' },
]

function App() {
  const [activeTab, setActiveTab] = useState('Tableau de bord')
  const [utilisateur, setUtilisateur] = useState(null)

  useEffect(() => {
    const data = localStorage.getItem('utilisateur');
    if (data) setUtilisateur(JSON.parse(data));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('utilisateur');
    localStorage.removeItem('token');
    localStorage.removeItem('seSouvenir');
    window.location.href = '/';
  }

  const renderTab = (tab) => {
    switch (tab) {
      case 'Tableau de bord': return <Dashboard />
      case 'Events': return <Evenements />
      case 'Espaces': return <Espaces />
      case 'Services': return <Services />
      case 'Comptabilité': return <Comptabilite />
      case 'Parametres': return <Parametres />
      case 'Utilisateurs': return <GestionUtilisateurs />
      case 'Roles': return <GestionRoles />
      case 'Reports': return <Rapports />
      default: return <Dashboard />
    }
  }

  const nomAffiche = utilisateur ? (utilisateur.first_name || utilisateur.email.split('@')[0]) : 'Invité'
  const initiale = nomAffiche[0].toUpperCase()

  return (
    <div className="App">
      <aside className="Sidebar">
        {/* Logo / Branding */}
        <div className="Branding">
          <h1>Hôtel La Promenade</h1>
          <p>Gestion d'événements</p>
        </div>

        {/* Navigation principale */}
        <nav className="Tabs">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={activeTab === item.id ? 'active' : ''}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="tab-icon">{icons[item.icon]}</span>
              <span className="tab-label">{item.label}</span>
            </button>
          ))}

          {/* Section admin uniquement */}
          {utilisateur?.role === 'admin' && (
            <>
              <div className="tab-separator" />
              {adminItems.map(item => (
                <button
                  key={item.id}
                  className={activeTab === item.id ? 'active' : ''}
                  onClick={() => setActiveTab(item.id)}
                >
                  <span className="tab-icon">{icons[item.icon]}</span>
                  <span className="tab-label">{item.label}</span>
                </button>
              ))}
            </>
          )}
        </nav>

        {/* Paramètres + Profil en bas */}
        <div className="SidebarBottom">
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 0.5rem 0.5rem' }}>
            <NotificationsBell />
          </div>
          <button
            className={`tab-settings ${activeTab === 'Parametres' ? 'active' : ''}`}
            onClick={() => setActiveTab('Parametres')}
          >
            <span className="tab-icon">{icons.settings}</span>
            <span className="tab-label">Paramètres</span>
          </button>

          <div className="Profile">
            <div className="ProfilePicture">{initiale}</div>
            <div className="ProfileInfo">
              <div className="ProfileName">{nomAffiche}</div>
              <div className="ProfileDescription">{utilisateur?.role || ''}</div>
            </div>
            <button className="ProfileButton" onClick={handleLogout} title="Se déconnecter">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        {renderTab(activeTab)}
      </main>
    </div>
  )
}

export default App
