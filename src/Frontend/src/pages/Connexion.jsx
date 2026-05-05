import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Bouton } from '../components/Bouton'
import { apiUrl } from '../config/apiBase'

const IcoMail = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m2 7 10 7 10-7" />
  </svg>
)
const IcoLock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)
const IcoEye = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)
const IcoEyeOff = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
)

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
      const response = await fetch(apiUrl('/api/users/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password: motDePasse })
      })

      const text = await response.text()
      let data = {}
      try {
        data = text ? JSON.parse(text) : {}
      } catch {
        data = { message: text || 'Réponse serveur invalide.' }
      }

      if (!response.ok) {
        throw new Error(data.message || 'Identifiants invalides.')
      }

      const utilisateur = { ...data.user, token: data.token }
      localStorage.setItem('utilisateur', JSON.stringify(utilisateur))
      localStorage.setItem('token', data.token)

      if (seSouvenir) {
        localStorage.setItem('seSouvenir', 'true')
      }

      setChargement(false)

      if (['admin', 'comptabilite', 'organisateur', 'coordonnateur'].includes(utilisateur.role)) {
        navigate('/dashboard')
      } else {
        navigate('/')
      }
    } catch (err) {
      const msg = String(err?.message || '')
      if (err instanceof TypeError || msg === 'Failed to fetch' || msg.includes('NetworkError')) {
        setErreur(
          "Connexion impossible au serveur. Vérifiez que l'API est démarrée (npm run dev dans le dossier Backend, port 3002) et que vous accédez au site via le serveur Vite (port 3000)."
        )
      } else {
        setErreur(msg || 'Une erreur est survenue.')
      }
      setChargement(false)
    }
  }

  return (
    <div className="page-connexion">
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
          <div className="page-connexion-securite" aria-hidden />
        </div>
      </div>

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
              <div className="page-connexion-erreur page-connexion-erreur--utilisateur" role="alert">
                <p>{erreur}</p>
              </div>
            )}

            <form onSubmit={soumettre} className="page-connexion-champs">
              <div className="champ">
                <label>Email professionnel</label>
                <div className="champ-input-wrap">
                  <span className="champ-icone">
                    <IcoMail />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre.email@lapromenade.ca"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="champ">
                <label>Mot de passe</label>
                <div className="champ-input-wrap">
                  <span className="champ-icone">
                    <IcoLock />
                  </span>
                  <input
                    type={afficherMotDePasse ? 'text' : 'password'}
                    value={motDePasse}
                    onChange={(e) => setMotDePasse(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setAfficherMotDePasse(!afficherMotDePasse)}
                    className="champ-toggle-password"
                    aria-label={afficherMotDePasse ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {afficherMotDePasse ? <IcoEyeOff /> : <IcoEye />}
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
