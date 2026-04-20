import { Link } from 'react-router-dom'

// Pied de page avec liens et contact
export function PiedDePage() {
  return (
    <footer className="pied-de-page">
      <div className="pied-de-page-conteneur">
        <div className="pied-de-page-grille">
          <div className="pied-colonne">
            <h3>Hôtel La Promenade</h3>
            <p>
              Un palace d'exception où luxe, raffinement et service personnalisé
              se conjuguent pour créer une expérience inoubliable.
            </p>
          </div>
          <div className="pied-colonne">
            <h4>Navigation</h4>
            <ul>
              <li><Link to="/chambres">Chambres & Suites</Link></li>
              <li><Link to="/services">Services</Link></li>
            </ul>
          </div>
          <div className="pied-colonne">
            <h4>Services</h4>
            <ul className="liste-texte">
              <li>Spa & Bien-être</li>
              <li>Restaurant Gastronomique</li>
              <li>Conciergerie 24/7</li>
              <li>Événements Privés</li>
            </ul>
          </div>
          <div className="pied-colonne">
            <h4>Contact</h4>
            <p className="contact-ligne">📍 123 Avenue Gatineau, K9H 1G7 Quebec</p>
            <p className="contact-ligne">📞 +1 613 23 45 67 89</p>
            <p className="contact-ligne">✉️ contact@lapromenade.fr</p>
          </div>
        </div>
        <div className="pied-bas">
          <p>© {new Date().getFullYear()} Hôtel La Promenade. Tous droits réservés.</p>
          <div className="pied-liens">
            <a href="#mentions">Mentions légales</a>
            <a href="#confidentialite">Confidentialité</a>
            <a href="#cgv">CGV</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
