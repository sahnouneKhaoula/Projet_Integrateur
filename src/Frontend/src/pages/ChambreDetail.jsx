/**
 * Détail chambre / suite — présentation type « Luxury Hotel Booking Platform » (clair, galerie + réservation).
 */
import { useState, useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ImageAvecRepli } from '../components/ImageAvecRepli'
import { getChambreById, chambreDepuisApi, CHAMBRES_CODE_ID_OFFSET } from '../data/chambresSource'
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

function IconMapPin() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
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

function IconCheckSmall() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
      <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function libelleCategorie(c) {
  if (!c) return 'Hébergement'
  const s = String(c).toLowerCase()
  if (s === 'suite') return 'Suite'
  if (s === 'chambre') return 'Chambre'
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function calculerNuits(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0
  const start = new Date(checkIn)
  const end = new Date(checkOut)
  if (end <= start) return 0
  const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  return diff
}

export function PageChambreDetail() {
  const { id } = useParams()
  const idNum = idDepuisParams(id)

  const [chambre, setChambre] = useState(null)
  const [chargement, setChargement] = useState(true)

  const [indexImage, setIndexImage] = useState(0)
  const [modalOuvert, setModalOuvert] = useState(false)
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [voyageurs, setVoyageurs] = useState(2)

  useEffect(() => {
    if (Number.isNaN(idNum)) {
      setChambre(null)
      setChargement(false)
      return
    }
    if (idNum >= CHAMBRES_CODE_ID_OFFSET) {
      setChambre(getChambreById(idNum))
      setChargement(false)
      return
    }
    let annule = false
    setChargement(true)
    fetch(apiUrl(`/api/chambres/${idNum}`))
      .then(async (r) => {
        if (r.status === 404) return null
        if (!r.ok) throw new Error('api')
        return r.json()
      })
      .then((row) => {
        if (annule) return
        const mapped = row ? chambreDepuisApi(row) : null
        setChambre(mapped || getChambreById(idNum))
      })
      .catch(() => {
        if (!annule) setChambre(getChambreById(idNum))
      })
      .finally(() => {
        if (!annule) setChargement(false)
      })
    return () => {
      annule = true
    }
  }, [idNum, id])

  const imagesBrutes = useMemo(() => {
    if (!chambre) return []
    if (chambre.images && chambre.images.length) return chambre.images
    return [chambre.image]
  }, [chambre])

  useEffect(() => {
    setIndexImage(0)
  }, [id, chambre])

  useEffect(() => {
    if (!chambre) return
    const cap = Math.max(1, Number(chambre.capacite) || 1)
    setVoyageurs((v) => Math.min(v, cap))
  }, [chambre])

  useEffect(() => {
    if (!modalOuvert) return
    const onKey = (e) => {
      if (e.key === 'Escape') setModalOuvert(false)
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [modalOuvert])

  const nuits = calculerNuits(checkIn, checkOut)
  const prixNuit = chambre ? Number(chambre.prix) || 0 : 0
  const sousTotal = nuits * prixNuit
  const taxesSejour = Math.round(sousTotal * 0.05)
  const totalEstime = sousTotal + taxesSejour
  const reservationValide = checkIn && checkOut && nuits > 0

  const lienReservation = useMemo(() => {
    if (!chambre || !reservationValide) return ''
    const q = new URLSearchParams({
      chambre: String(idNum),
      checkin: checkIn,
      checkout: checkOut,
      guests: String(voyageurs),
    })
    return `/reservation-chambre?${q.toString()}`
  }, [chambre, reservationValide, idNum, checkIn, checkOut, voyageurs])

  if (chargement) {
    return (
      <div className="chambre-luxe-chargement-wrap">
        <div className="evenements-chargement" role="status" aria-live="polite">
          <span className="evenements-chargement-label">Chargement de la chambre</span>
          <div className="evenements-chargement-bar" aria-hidden />
        </div>
      </div>
    )
  }

  if (!chambre || Number.isNaN(idNum)) {
    return (
      <div className="chambre-luxe-vide-wrap">
        <h2>Chambre non trouvée</h2>
        <Link to="/chambres" className="bouton bouton--primaire bouton--normal">
          Retour aux chambres
        </Link>
      </div>
    )
  }

  const imageSrc = imagesBrutes[indexImage] || chambre.image
  const capMax = Math.max(1, Number(chambre.capacite) || 1)

  return (
    <div className="page-chambre-detail-luxe">
      <div className="chambre-luxe-retour-bar">
        <div className="chambre-luxe-inner">
          <Link to="/chambres" className="chambre-luxe-back">
            <IconChevronLeft />
            <span>Retour aux chambres</span>
          </Link>
        </div>
      </div>

      <div className="chambre-luxe-inner chambre-luxe-pad">
        <div className="chambre-luxe-gallery-grid">
          <button
            type="button"
            className="chambre-luxe-hero-wrap"
            onClick={() => setModalOuvert(true)}
            aria-label="Agrandir la photo"
          >
            <ImageAvecRepli src={imageSrc} alt={chambre.nom} />
            <span className="chambre-luxe-hero-zoom">Agrandir</span>
          </button>

          <div className="chambre-luxe-thumbs-grid">
            {imagesBrutes.map((src, i) => (
              <button
                key={`${src}-${i}`}
                type="button"
                className={`chambre-luxe-thumb-btn ${i === indexImage ? 'chambre-luxe-thumb-btn--actif' : ''}`}
                onClick={() => setIndexImage(i)}
                aria-label={`Photo ${i + 1}`}
              >
                <ImageAvecRepli src={src} alt="" />
              </button>
            ))}
          </div>
        </div>

        <div className="chambre-luxe-columns">
          <div>
            <div className="chambre-luxe-white-card">
              <div className="chambre-luxe-card-header">
                <div>
                  <span className="chambre-luxe-badge-pill">{libelleCategorie(chambre.categorie)}</span>
                  <h1 className="chambre-luxe-h1">{chambre.nom}</h1>
                  <div className="chambre-luxe-meta-row">
                    <span>
                      <IconUsers />
                      {chambre.capacite} personne{chambre.capacite > 1 ? 's' : ''}
                    </span>
                    <span>
                      <IconMaximize />
                      {chambre.taille} m²
                    </span>
                    <span>
                      <IconMapPin />
                      Vue {chambre.vue || '—'}
                    </span>
                  </div>
                </div>
                <div className="chambre-luxe-price-block">
                  <p className="chambre-luxe-price-num">{prixNuit.toLocaleString('fr-CA')} $</p>
                  <p className="chambre-luxe-price-sub">par nuit</p>
                </div>
              </div>

              <hr className="chambre-luxe-divider" />

              <h3 className="chambre-luxe-section-title">Description</h3>
              <p className="chambre-luxe-desc">{chambre.description}</p>

              <hr className="chambre-luxe-divider" />

              <h3 className="chambre-luxe-section-title">Équipements</h3>
              <div className="chambre-luxe-amenities-grid">
                {(chambre.equipements || []).map((eq) => (
                  <div key={eq} className="chambre-luxe-amenity-row">
                    <span className="chambre-luxe-amenity-check">
                      <IconCheckSmall />
                    </span>
                    <span>{eq}</span>
                  </div>
                ))}
              </div>

              <hr className="chambre-luxe-divider" />

              <h3 className="chambre-luxe-section-title">Informations importantes</h3>
              <div className="chambre-luxe-info-list">
                <div className="chambre-luxe-info-item">
                  <IconCalendar />
                  <div>
                    <strong>Check-in / Check-out</strong>
                    <span>Arrivée : 15h00 • Départ : 12h00</span>
                  </div>
                </div>
                <div className="chambre-luxe-info-item">
                  <IconCheckSmall />
                  <div>
                    <strong>Annulation gratuite</strong>
                    <span>Jusqu&apos;à 48 h avant l&apos;arrivée</span>
                  </div>
                </div>
                <div className="chambre-luxe-info-item">
                  <IconCheckSmall />
                  <div>
                    <strong>Petit-déjeuner</strong>
                    <span>Buffet inclus de 7h00 à 11h00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <aside>
            <div className="chambre-luxe-book-card">
              <h3>Réserver cette chambre</h3>

              <div className="chambre-luxe-field">
                <label htmlFor="ch-detail-arrivee" className="chambre-luxe-field-label">
                  <IconCalendar />
                  Arrivée
                </label>
                <input
                  id="ch-detail-arrivee"
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                />
              </div>
              <div className="chambre-luxe-field">
                <label htmlFor="ch-detail-depart" className="chambre-luxe-field-label">
                  <IconCalendar />
                  Départ
                </label>
                <input
                  id="ch-detail-depart"
                  type="date"
                  value={checkOut}
                  min={checkIn || undefined}
                  onChange={(e) => setCheckOut(e.target.value)}
                />
              </div>
              <div className="chambre-luxe-field">
                <label htmlFor="ch-detail-voyageurs" className="chambre-luxe-field-label">
                  <IconUsers />
                  Personnes
                </label>
                <select
                  id="ch-detail-voyageurs"
                  value={voyageurs}
                  onChange={(e) => setVoyageurs(Number(e.target.value))}
                >
                  {Array.from({ length: capMax }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n} personne{n > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {nuits > 0 && (
                <div className="chambre-luxe-recap">
                  <div className="chambre-luxe-recap-row">
                    <span>
                      {prixNuit.toLocaleString('fr-CA')} $ × {nuits} nuit{nuits > 1 ? 's' : ''}
                    </span>
                    <span>{sousTotal.toLocaleString('fr-CA')} $</span>
                  </div>
                  <div className="chambre-luxe-recap-row">
                    <span>Taxes de séjour (estim.)</span>
                    <span>{taxesSejour.toLocaleString('fr-CA')} $</span>
                  </div>
                  <div className="chambre-luxe-recap-total">
                    <span>Total</span>
                    <span>{totalEstime.toLocaleString('fr-CA')} $</span>
                  </div>
                </div>
              )}

              {reservationValide ? (
                <Link to={lienReservation} className="chambre-luxe-book-cta chambre-luxe-book-cta--primary">
                  Continuer la réservation
                </Link>
              ) : (
                <button
                  type="button"
                  className="chambre-luxe-book-cta chambre-luxe-book-cta--primary"
                  disabled
                >
                  Continuer la réservation
                </button>
              )}

              <p className="chambre-luxe-book-foot">Aucun paiement en ligne — demande de séjour via nos services.</p>
            </div>
          </aside>
        </div>
      </div>

      {modalOuvert && (
        <div
          className="chambre-luxe-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Photo agrandie"
          onClick={() => setModalOuvert(false)}
        >
          <button
            type="button"
            className="chambre-luxe-modal-close"
            onClick={() => setModalOuvert(false)}
            aria-label="Fermer"
          >
            ×
          </button>
          <div className="chambre-luxe-modal-inner" onClick={(e) => e.stopPropagation()}>
            <ImageAvecRepli src={imageSrc} alt={chambre.nom} />
          </div>
        </div>
      )}
    </div>
  )
}
