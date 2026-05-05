/**
 * Détail salle — même structure que Luxury Hotel Booking `EventDetail.tsx`
 * (galerie grande + miniatures, carte infos, équipements, services optionnels, encart devis).
 */
import { useState, useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ImageAvecRepli } from '../components/ImageAvecRepli'
import { enrichirSallesPourEvenements } from '../data/sallesEvenements'
import { apiUrl } from '../config/apiBase'

function idDepuisParams(id) {
  const n = Number.parseInt(String(id), 10)
  return Number.isFinite(n) ? n : NaN
}

function IconChevronLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function IconMaximize() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
    </svg>
  )
}

function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
      <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const SERVICES_OPTIONNELS = [
  { titre: 'Traiteur gastronomique', sous: 'Menu sur mesure' },
  { titre: 'Boissons premium', sous: 'Bar & cocktails' },
  { titre: 'Décoration', sous: 'Fleurs & design' },
  { titre: 'Animation', sous: 'DJ & musique live' },
  { titre: 'Photographie', sous: 'Professionnel' },
  { titre: 'Parking VIP', sous: 'Voiturier disponible' },
]

export function PageSalleEvenementDetail() {
  const { id } = useParams()
  const idNum = idDepuisParams(id)
  const [sallesApi, setSallesApi] = useState([])
  const [chargement, setChargement] = useState(true)

  useEffect(() => {
    fetch(apiUrl('/api/salles'))
      .then(async (r) => {
        if (!r.ok) throw new Error('api')
        return r.json()
      })
      .then((data) => setSallesApi(Array.isArray(data) ? data : []))
      .catch(() => setSallesApi([]))
      .finally(() => setChargement(false))
  }, [])

  const salle = useMemo(() => {
    const liste = enrichirSallesPourEvenements(sallesApi)
    return liste.find((s) => Number(s.id) === idNum) || null
  }, [sallesApi, idNum])

  const [indexImage, setIndexImage] = useState(0)

  useEffect(() => {
    setIndexImage(0)
  }, [id, salle])

  if (chargement) {
    return (
      <div className="salle-detail-luxury-chargement">
        <div className="evenements-chargement" role="status" aria-live="polite">
          <span className="evenements-chargement-label">Chargement de la salle</span>
          <div className="evenements-chargement-bar" aria-hidden />
        </div>
      </div>
    )
  }

  if (!salle || Number.isNaN(idNum)) {
    return (
      <div className="salle-detail-luxury-vide">
        <h2>Salle non trouvée</h2>
        <Link to="/evenements" className="bouton bouton--primaire bouton--normal">
          Retour aux événements
        </Link>
      </div>
    )
  }

  const imagesBrutes = salle.images && salle.images.length ? salle.images : [salle.image]
  const images = imagesBrutes
  const amenities = Array.isArray(salle.amenities) ? salle.amenities : []

  return (
    <div className="salle-detail-luxury">
      <div className="salle-detail-luxury-retour-bar">
        <div className="salle-detail-luxury-inner">
          <Link to="/evenements" className="salle-detail-luxury-back">
            <IconChevronLeft />
            <span>Retour aux événements</span>
          </Link>
        </div>
      </div>

      <div className="salle-detail-luxury-inner salle-detail-luxury-pad">
        <div className="salle-detail-luxury-gallery">
          <div className="salle-detail-luxury-hero">
            <ImageAvecRepli
              src={images[indexImage]}
              alt={salle.nom}
              className="salle-detail-img-principale"
            />
          </div>
          <div className="salle-detail-luxury-thumbs">
            {images.map((src, i) => (
              <button
                key={`${src}-${i}`}
                type="button"
                className={`salle-detail-luxury-thumb ${i === indexImage ? 'salle-detail-luxury-thumb--actif' : ''}`}
                onClick={() => setIndexImage(i)}
                aria-label={`Photo ${i + 1}`}
              >
                <ImageAvecRepli src={src} alt="" />
              </button>
            ))}
          </div>
        </div>

        <div className="salle-detail-luxury-main">
          <div>
            <div className="salle-detail-luxury-card">
              <div className="salle-detail-luxury-badge">{salle.category}</div>
              <h1 className="salle-detail-luxury-titre">{salle.nom}</h1>

              <div className="salle-detail-luxury-stats">
                <div className="salle-detail-luxury-stat">
                  <IconUsers />
                  <p className="sdl-label">Capacité assise</p>
                  <p className="sdl-val">{salle.capacitySeated}</p>
                </div>
                <div className="salle-detail-luxury-stat">
                  <IconUsers />
                  <p className="sdl-label">Capacité debout</p>
                  <p className="sdl-val">{salle.capacityStanding}</p>
                </div>
                <div className="salle-detail-luxury-stat">
                  <IconMaximize />
                  <p className="sdl-label">Surface</p>
                  <p className="sdl-val">{salle.size} m²</p>
                </div>
                <div className="salle-detail-luxury-stat">
                  <IconCalendar />
                  <p className="sdl-label">À partir de</p>
                  <p className="sdl-val">{salle.price} $</p>
                </div>
              </div>

              <h3 className="salle-detail-luxury-section-title">Description</h3>
              <p className="salle-detail-luxury-desc">{salle.description}</p>

              <h3 className="salle-detail-luxury-section-title">Types d&apos;événements</h3>
              <div className="salle-detail-luxury-tags">
                {salle.types.map((type) => (
                  <span key={type} className="salle-detail-luxury-tag">
                    {type}
                  </span>
                ))}
              </div>

              <h3 className="salle-detail-luxury-section-title">Équipements &amp; services</h3>
              <div className="salle-detail-luxury-amenities">
                {amenities.map((amenity) => (
                  <div key={amenity} className="salle-detail-luxury-amenity">
                    <div className="salle-detail-luxury-amenity-icon">
                      <IconCheck />
                    </div>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>

              <div className="salle-detail-luxury-options">
                <h3 className="salle-detail-luxury-section-title" style={{ marginBottom: 0 }}>
                  Services optionnels disponibles
                </h3>
                <div className="salle-detail-luxury-options-grid">
                  {SERVICES_OPTIONNELS.map((item) => (
                    <div key={item.titre} className="salle-detail-luxury-opt-item">
                      <IconCheck />
                      <div>
                        <strong>{item.titre}</strong>
                        <span>{item.sous}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <aside className="salle-detail-luxury-sidebar">
            <div className="salle-detail-luxury-book">
              <h3>Demander un devis</h3>
              <div className="salle-detail-luxury-book-pricebox">
                <p className="sdl-small">
                  <strong>Prix indicatif</strong>
                </p>
                <p className="salle-detail-luxury-book-amount">{salle.price} $</p>
                <p className="salle-detail-luxury-book-note">Location de salle • Prix sur devis selon services</p>
              </div>
              <div className="salle-detail-luxury-book-list">
                <p>
                  <IconCheck />
                  Devis personnalisé sous 24h
                </p>
                <p>
                  <IconCheck />
                  Visite de la salle offerte
                </p>
                <p>
                  <IconCheck />
                  Conseiller dédié à votre événement
                </p>
              </div>
              <Link
                to={`/demande-evenement?salle=${salle.id}`}
                className="bouton bouton--primaire bouton--normal bouton-plein"
              >
                Demander un devis
              </Link>
              <p className="salle-detail-luxury-book-foot">Sans engagement • Réponse rapide garantie</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
