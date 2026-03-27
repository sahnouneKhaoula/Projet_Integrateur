/**
 * Page d'accueil du site vitrine : hero, suites, expériences, témoignages (contenu statique + images Unsplash).
 */
import { Link } from 'react-router-dom'
import { Bouton } from '../components/Bouton'
import { Carte, CarteTitre, CarteDescription, CarteContenu } from '../components/Carte'
import { ImageAvecRepli } from '../components/ImageAvecRepli'

// URLs photos fiables (Unsplash)
const PHOTOS = {
  hero: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1920&q=80',
  lobby: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80',
  suite1: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
  suite2: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80',
  suite3: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800&q=80',
  spa: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&q=80',
  restaurant: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80',
  evenements: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1000&q=80',
  conciergerie: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&q=80',
  salleReception: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1000&q=80'
}

// Page d'accueil : hero, suites, expériences, événements, témoignages, CTA
export function PageAccueil() {
  const suites = [
    {
      id: 1,
      nom: 'Suite Prestige',
      description: 'Élégance raffinée avec vue panoramique',
      prix: 'À partir de 850$',
      image: PHOTOS.suite1,
      caracteristiques: ['80m²', 'Balcon privé', 'Salle de bain marbre']
    },
    {
      id: 2,
      nom: 'Suite Royale',
      description: 'Luxe absolu et service personnalisé',
      prix: 'À partir de 1 500$',
      image: PHOTOS.suite2,
      caracteristiques: ['150m²', 'Terrasse privée', 'Service majordome']
    },
    {
      id: 3,
      nom: 'Penthouse',
      description: "L'excellence à son paroxysme",
      prix: 'Sur demande',
      image: PHOTOS.suite3,
      caracteristiques: ['300m²', 'Rooftop privé', 'Vue 360°']
    }
  ]

  const experiences = [
    { titre: "Gastronomie d'Excellence", description: "Restaurant étoilé Michelin par le Chef Guillaume Marchand.", image: PHOTOS.restaurant },
    { titre: 'Spa & Bien-être', description: 'Un sanctuaire de 2000m² dédié à votre relaxation.', image: PHOTOS.spa },
    { titre: 'Événements Privés', description: "Salles de réception pour mariages, galas et séminaires d'exception.", image: PHOTOS.evenements },
    { titre: 'Conciergerie 24/7', description: 'Service personnalisé pour exaucer vos moindres désirs.', image: PHOTOS.conciergerie }
  ]

  const temoignages = [
    { nom: 'Khaouala Sahnoune', role: 'Architecte et analyste de données', commentaire: "Une expérience inoubliable. Le service est impeccable et l'attention aux détails exceptionnelle.", note: 5 },
    { nom: 'Gabriel Labrosse', role: 'Backend Developer', commentaire: 'Le summum du luxe à Gatineau. Chaque instant passé ici est un moment de pur raffinement.', note: 5 },
    { nom: 'Hocine Abdallah', role: 'Frontend Developer', commentaire: "Un hôtel qui allie tradition et modernité avec une élégance rare. Absolument remarquable.", note: 5 }
  ]

  return (
    <div className="page-accueil">
      {/* Hero avec photo */}
      <section className="hero">
        <div className="hero-image-wrap">
          <ImageAvecRepli src={PHOTOS.hero} alt="Hôtel La Promenade - Lobby" className="hero-image-img" />
        </div>
        <div className="hero-overlay" />
        <div className="hero-contenu">
          <span className="hero-badge">★ Palace 5 Étoiles</span>
          <h1 className="hero-titre">
            L'Art de l'Hospitalité<br />
            <span className="hero-titre-accent">Redéfini</span>
          </h1>
          <p className="hero-sous-titre">
            Découvrez un refuge d'exception au cœur de Paris, où chaque détail
            est pensé pour créer une expérience inoubliable.
          </p>
          <div className="hero-boutons">
            <Link to="/chambres">
              <Bouton variant="primaire" taille="grand">
                Découvrir nos Suites
              </Bouton>
            </Link>
          </div>
          <div className="hero-usb">
            <span>📍Gatineau, Quebec</span>
            <span>🕐 Service 24/7</span>
            <span>✨ Expérience VIP</span>
          </div>
        </div>
      </section>

      {/* Suites avec photos */}
      <section className="section section-suites">
        <div className="section-titre">
          <h2>Nos Suites d'Exception</h2>
          <p>Chaque suite est un univers de raffinement où confort et élégance se rencontrent.</p>
        </div>
        <div className="grille-suites">
          {suites.map((suite) => (
            <Carte key={suite.id} hover className="carte-suite">
              <div className="carte-suite-image">
                <ImageAvecRepli src={suite.image} alt={suite.nom} className="carte-suite-img" />
                <div className="carte-suite-badges">
                  {suite.caracteristiques.map((car, i) => (
                    <span key={i} className="badge">{car}</span>
                  ))}
                </div>
              </div>
              <div className="carte-suite-body">
                <CarteTitre>{suite.nom}</CarteTitre>
                <CarteDescription>{suite.description}</CarteDescription>
                <CarteContenu>
                  <div className="carte-suite-footer">
                    <span className="prix">{suite.prix}</span>
                  </div>
                </CarteContenu>
              </div>
            </Carte>
          ))}
        </div>
      </section>

      {/* Expériences avec photos */}
      <section className="section section-experiences">
        <div className="section-titre">
          <h2>Expériences Premium</h2>
          <p>Des services exclusifs pour sublimer votre séjour.</p>
        </div>
        <div className="grille-experiences">
          {experiences.map((exp, i) => (
            <Carte key={i} hover className="carte-experience">
              <div className="carte-experience-image">
                <ImageAvecRepli src={exp.image} alt={exp.titre} className="carte-experience-img" />
              </div>
              <CarteContenu>
                <h4>{exp.titre}</h4>
                <p>{exp.description}</p>
              </CarteContenu>
            </Carte>
          ))}
        </div>
      </section>

      {/* Section Événements avec grande photo */}
      <section className="section section-evenements">
        <div className="section-evenements-inner">
          <div className="section-evenements-image">
            <ImageAvecRepli src={PHOTOS.salleReception} alt="Salle de réception - Événements privés" className="section-evenements-img" />
          </div>
          <div className="section-evenements-texte">
            <h2>Événements Privés & Célébrations</h2>
            <p>
              Transformez vos moments précieux en souvenirs inoubliables dans nos salles
              de réception. Mariages, galas, séminaires : notre équipe orchestre chaque détail.
            </p>
            <ul className="liste-avantages">
              <li><span className="puce">★</span> Salles modulables de 10 à 500 personnes</li>
              <li><span className="puce">★</span> Service traiteur premium par notre chef</li>
              <li><span className="puce">★</span> Équipement audiovisuel de pointe</li>
            </ul>
            <Link to="/services">
              <Bouton variant="primaire" taille="grand">Planifier un Événement →</Bouton>
            </Link>
          </div>
        </div>
      </section>

      {/* Témoignages avec avatars */}
      <section className="section section-temoignages">
        <div className="section-titre">
          <h2>Témoignages Clients</h2>
          <p>Ils ont vécu l'expérience La Promenade</p>
        </div>
        <div className="grille-temoignages">
          {temoignages.map((t, i) => (
            <Carte key={i} className="carte-temoignage">
              <CarteContenu>
                <div className="temoignage-avatar">{t.nom.charAt(0)}</div>
                <div className="etoiles">{'★'.repeat(t.note)}</div>
                <p className="citation">"{t.commentaire}"</p>
                <div className="auteur">
                  <strong>{t.nom}</strong>
                  <span>{t.role}</span>
                </div>
              </CarteContenu>
            </Carte>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="section section-cta">
        <h2>Votre Séjour d'Exception</h2>
        <p>Profitez de nos offres exclusives et vivez une expérience inoubliable dans le palace le plus prestigieux de Paris.</p>
        <Link to="/chambres">
          <Bouton variant="primaire" taille="grand">Découvrir nos Suites →</Bouton>
        </Link>
      </section>
    </div>
  )
}
