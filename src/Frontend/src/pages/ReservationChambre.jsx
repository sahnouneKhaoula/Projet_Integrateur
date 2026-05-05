import { Link } from 'react-router-dom'
import { Bouton } from '../components/Bouton'

export function PageReservationChambre() {
  return (
    <div style={{ padding: '2rem', maxWidth: '48rem', margin: '0 auto' }}>
      <h1>Réserver une chambre</h1>
      <p>Parcours de réservation à connecter au backend (brouillon).</p>
      <Link to="/chambres">
        <Bouton variant="primaire">Voir les chambres</Bouton>
      </Link>
    </div>
  )
}
