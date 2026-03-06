import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Bouton } from './Bouton'

// Barre de navigation avec menu mobile
export function Navbar() {
  const [menuOuvert, setMenuOuvert] = useState(false)
  const [utilisateur, setUtilisateur] = useState(null)
  const emplacement = useLocation()

  useEffect(() => {
    const data = localStorage.getItem('utilisateur');
    if (data) {
      setUtilisateur(JSON.parse(data));
    }
  }, []);

  const boutonDeconnexion = () => {
    localStorage.removeItem('utilisateur');
    localStorage.removeItem('token');
    localStorage.removeItem('seSouvenir');
    // Rafraîchir la page après déconnexion
    window.location.reload();
  };

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

          <div className="navbar-bouton-connexion desktop-only">
            {utilisateur ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ fontWeight: 500 }}>
                  Bonjour, {utilisateur.first_name || utilisateur.email.split('@')[0]}
                </span>
                <Bouton variant="secondaire" taille="petit" onClick={boutonDeconnexion}>
                  Se déconnecter
                </Bouton>
              </div>
            ) : (
              <Link to="/connexion">
                <Bouton variant="primaire" taille="petit">
                  Se connecter
                </Bouton>
              </Link>
            )}
          </div>

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
            {utilisateur ? (
              <Bouton
                variant="secondaire"
                className="bouton-plein"
                onClick={() => { boutonDeconnexion(); setMenuOuvert(false); }}
              >
                Se déconnecter
              </Bouton>
            ) : (
              <Link to="/connexion" onClick={() => setMenuOuvert(false)}>
                <Bouton variant="primaire" className="bouton-plein">Se connecter</Bouton>
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
