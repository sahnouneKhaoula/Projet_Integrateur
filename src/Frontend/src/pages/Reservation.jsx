import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bouton } from '../composants/Bouton'

// Page Réservation : formulaire dates, type de chambre, contact
export function PageReservation() {
  const [arrivee, setArrivee] = useState('')
  const [depart, setDepart] = useState('')
  const [typeChambre, setTypeChambre] = useState('')
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [telephone, setTelephone] = useState('')

  const typesChambre = [
    { value: '', label: 'Choisir un type' },
    { value: 'deluxe', label: 'Chambre Deluxe' },
    { value: 'prestige', label: 'Suite Prestige' },
    { value: 'royale', label: 'Suite Royale' },
    { value: 'penthouse', label: 'Penthouse' }
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: envoi au backend
  }

  return (
    <div className="page-reservation">
      <section className="page-en-tete">
        <h1>Réserver votre séjour</h1>
        <p>Choisissez vos dates et votre hébergement pour une expérience inoubliable au palace La Promenade.</p>
      </section>

      <section className="section formulaire-reservation">
        <form onSubmit={handleSubmit} className="form-reservation">
          <div className="form-grille">
            <div className="champ">
              <label htmlFor="arrivee">Date d'arrivée</label>
              <input
                id="arrivee"
                type="date"
                value={arrivee}
                onChange={(e) => setArrivee(e.target.value)}
                required
              />
            </div>
            <div className="champ">
              <label htmlFor="depart">Date de départ</label>
              <input
                id="depart"
                type="date"
                value={depart}
                onChange={(e) => setDepart(e.target.value)}
                required
              />
            </div>
            <div className="champ champ-plein">
              <label htmlFor="typeChambre">Type de chambre / suite</label>
              <select
                id="typeChambre"
                value={typeChambre}
                onChange={(e) => setTypeChambre(e.target.value)}
                required
              >
                {typesChambre.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="champ">
              <label htmlFor="nom">Nom complet</label>
              <input
                id="nom"
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Jean Dupont"
                required
              />
            </div>
            <div className="champ">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jean@exemple.fr"
                required
              />
            </div>
            <div className="champ">
              <label htmlFor="telephone">Téléphone</label>
              <input
                id="telephone"
                type="tel"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                placeholder="+33 6 12 34 56 78"
              />
            </div>
          </div>
          <div className="form-actions">
            <Bouton type="submit" variant="primaire" taille="grand">
              Envoyer ma demande de réservation
            </Bouton>
          </div>
        </form>
      </section>

      <section className="section-cta">
        <h2>Besoin d'aide ?</h2>
        <p>Notre conciergerie est disponible 24/7 pour personnaliser votre séjour.</p>
        <Link to="/services">
          <Bouton variant="secondaire">Découvrir nos services</Bouton>
        </Link>
      </section>
    </div>
  )
}
