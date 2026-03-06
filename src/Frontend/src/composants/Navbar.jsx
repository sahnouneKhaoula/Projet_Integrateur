import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Bouton } from './Bouton'

// Barre de navigation avec menu mobile
export function Navbar() {
  const [menuOuvert, setMenuOuvert] = useState(false)
  const emplacement = useLocation()

  const estActif = (chemin) => emplacement.pathname === chemin

  const liens = [
    { path: '/', label: 'Accueil' },
    { path: '/chambres', label: 'Chambres & Suites' },
    { path: '/services', label: 'Services' }
  ]

  return (
    <nav className="navbar">
      <div className="navbar-conteneur">
        <div className="navbar-inner">
          <Link to="/" className="navbar-logo">
            <span className="navbar-logo-icone">LP</span>
            <div>
              <span className="navbar-titre">Hôtel La Promenade</span>
              <span className="navbar-sous-titre">PALACE 5 ÉTOILES</span>
            </div>
          </Link>

          <div className="navbar-liens desktop-only">
            {liens.map((lien) => (
              <Link
                key={lien.path}
                to={lien.path}
                className={estActif(lien.path) ? 'lien actif' : 'lien'}
              >
                {lien.label}
              </Link>
            ))}
          </div>

          <Link to="/connexion" className="navbar-bouton-connexion desktop-only">
            <Bouton variant="primaire" taille="petit">
              Se connecter
            </Bouton>
          </Link>

          <button
            type="button"
            className="bouton-menu-mobile"
            onClick={() => setMenuOuvert(!menuOuvert)}
            aria-label={menuOuvert ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            {menuOuvert ? '✕' : '☰'}
          </button>
        </div>

        {menuOuvert && (
          <div className="navbar-mobile">
            {liens.map((lien) => (
              <Link
                key={lien.path}
                to={lien.path}
                className={estActif(lien.path) ? 'lien actif' : 'lien'}
                onClick={() => setMenuOuvert(false)}
              >
                {lien.label}
              </Link>
            ))}
            <Link to="/connexion" onClick={() => setMenuOuvert(false)}>
              <Bouton variant="primaire" className="bouton-plein">Se connecter</Bouton>
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
