import { Link } from 'react-router-dom'
import { Bouton } from '../components/Bouton'

export function PageMonEspace() {
  return (
    <div style={{ padding: '2rem', maxWidth: '48rem', margin: '0 auto' }}>
      <h1>Mon espace</h1>
      <p>Espace client à compléter (réservations, préférences).</p>
      <Link to="/">
        <Bouton variant="secondaire">Accueil</Bouton>
      </Link>
    </div>
  )
}
