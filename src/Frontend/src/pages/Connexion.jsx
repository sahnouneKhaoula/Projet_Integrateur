import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Bouton } from '../components/Bouton'

// Page de connexion interne (admin, compta, organisateur, coordonnateur)
export function PageConnexion() {
  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [afficherMotDePasse, setAfficherMotDePasse] = useState(false)
  const [seSouvenir, setSeSouvenir] = useState(false)
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(false)

  const navigate = useNavigate()

  const soumettre = async (e) => {
    e.preventDefault()
    setErreur('')
    setChargement(true)

    try {
      const response = await fetch('http://localhost:3002/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password: motDePasse })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Identifiants invalides');
      }

      // Enregistrer la session (localStorage pour persister)
      const utilisateur = data.user;
      localStorage.setItem('utilisateur', JSON.stringify(utilisateur));
      localStorage.setItem('token', data.token); // Si besoin d'autorisations futures

      if (seSouvenir) {
        localStorage.setItem('seSouvenir', 'true')
      }

      setChargement(false)

      // Redirection dynamique selon le rôle
      if (['admin', 'comptabilite', 'organisateur', 'coordonnateur'].includes(utilisateur.role)) {
        // C'est un employé -> Dashboard métier
        navigate('/dashboard')
      } else {
        // C'est un client -> Accueil
        navigate('/')
      }

    } catch (err) {
      setErreur(err.message);
      setChargement(false)
    }
  }

  return (
    <div className="page-connexion">
      {/* Partie gauche - Image (masquée sur mobile) */}
      <div className="page-connexion-visuel">
        <img
          src="https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1080&q=80"
          alt="Hôtel La Promenade"
          className="page-connexion-img"
        />
        <div className="page-connexion-overlay" />
        <div className="page-connexion-visuel-texte">
          <h2>Espace de Gestion</h2>
          <p>Accédez à votre tableau de bord et gérez les opérations de l'hôtel en toute sécurité.</p>
          <div className="page-connexion-securite">

          </div>
        </div>
      </div>

      {/* Partie droite - Formulaire */}
      <div className="page-connexion-formulaire-wrap">
        <div className="page-connexion-formulaire">
          <Link to="/" className="page-connexion-retour">
            ← Retour à l'accueil
          </Link>

          <div className="page-connexion-carte">
            <div className="page-connexion-entete">
              <span className="page-connexion-logo">Hôtel La Promenade</span>
            </div>
            <h1 className="page-connexion-titre">Bienvenue</h1>
            <p className="page-connexion-description">Connectez-vous pour accéder à votre espace</p>

            {erreur && (
              <div className="page-connexion-erreur">
                <p>{erreur}</p>
              </div>
            )}

            <form onSubmit={soumettre} className="page-connexion-champs">
              <div className="champ">
                <label>Email professionnel</label>
                <div className="champ-input-wrap">
                  <span className="champ-icone">✉</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre.email@lapromenade.ca"
                    required
                  />
                </div>
                <p className="champ-aide">

                </p>
              </div>

              <div className="champ">
                <label>Mot de passe</label>
                <div className="champ-input-wrap">
                  <span className="champ-icone">🔒</span>
                  <input
                    type={afficherMotDePasse ? 'text' : 'password'}
                    value={motDePasse}
                    onChange={(e) => setMotDePasse(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setAfficherMotDePasse(!afficherMotDePasse)}
                    className="champ-toggle-password"
                    aria-label={afficherMotDePasse ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {afficherMotDePasse ? '🙈' : '👁'}
                  </button>
                </div>
              </div>

              <div className="page-connexion-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={seSouvenir}
                    onChange={(e) => setSeSouvenir(e.target.checked)}
                  />
                  <span>Se souvenir de moi</span>
                </label>
                <button type="button" className="lien-mot-de-passe-oublie">
                  Mot de passe oublié ?
                </button>
              </div>

              <Bouton
                type="submit"
                variant="primaire"
                taille="grand"
                className="bouton-connexion-plein"
                disabled={chargement}
              >

                {chargement ? 'Connexion...' : 'Se connecter'}

              </Bouton>
            </form>

            <div className="page-connexion-footer">
              <span className="page-connexion-footer-texte">Pas encore de compte ?</span>
              <Link to="/inscription" className="page-connexion-footer-lien">
                Créer un compte client
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
