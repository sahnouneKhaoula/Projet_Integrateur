import { Link } from 'react-router-dom'
import { Bouton } from '../components/Bouton'

export function PageDemandeEvenement() {
  return (
    <div className="demande-evenement-page demande-evenement-wizard" style={{ padding: '2rem', maxWidth: '40rem', margin: '0 auto' }}>
      <h1>Demande d&apos;événement</h1>
      <p>Formulaire complet à brancher sur l&apos;API (brouillon).</p>
      <Link to="/evenements">
        <Bouton variant="secondaire">Retour</Bouton>
      </Link>
    </div>
  )
}
