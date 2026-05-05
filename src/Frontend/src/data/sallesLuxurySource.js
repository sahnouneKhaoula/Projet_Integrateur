/**
 * Même catalogue de salles que le projet « Luxury Hotel Booking » (events.ts),
 * en JavaScript pur — utilisé pour l’affichage et fusionné avec l’API quand les noms correspondent.
 *
 * Données alignées sur eventVenues[] (id stable 1–4 pour URL /evenements/1 … si mode démo sans API).
 */
export const SALLES_LUXURY_REFERENCE = [
  {
    id: 1,
    nom: 'Grand Ballroom',
    category: 'Premium',
    capacitySeated: 300,
    capacityStanding: 500,
    size: 450,
    price: 5000,
    types: ['Mariage', 'Gala', 'Anniversaire'],
    image:
      'https://images.unsplash.com/photo-1640672246932-2f21e569d797?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    images: [
      'https://images.unsplash.com/photo-1640672246932-2f21e569d797?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      'https://images.unsplash.com/photo-1720540244592-b4124532b318?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ],
    description:
      "Notre salle de bal la plus prestigieuse offre 450m² d'espace élégant avec plafonds de 6 mètres, lustres en cristal Baccarat, et scène intégrée. Parfait pour les mariages de luxe et galas.",
    location: 'Aile nord — Premium',
    amenities: [
      'Scène équipée',
      'Sonorisation premium',
      'Éclairage LED',
      'Vidéoprojecteur 4K',
      'WiFi haute vitesse',
      'Climatisation',
      'Vestiaire',
      'Accès direct',
    ],
  },
  {
    id: 2,
    nom: 'Salle Executive',
    category: 'Business',
    capacitySeated: 80,
    capacityStanding: 120,
    size: 120,
    price: 1200,
    types: ['Séminaire', 'Conférence', 'Formation'],
    image:
      'https://images.unsplash.com/photo-1720540244592-b4124532b318?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    images: [
      'https://images.unsplash.com/photo-1720540244592-b4124532b318?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      'https://images.unsplash.com/photo-1640672246932-2f21e569d797?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ],
    description:
      'Salle de 120m² parfaitement équipée pour vos événements professionnels avec écran géant, système de visioconférence, et mobilier modulable. Configuration flexible pour tous types de séminaires.',
    location: 'Business — 2e étage',
    amenities: [
      'Écran 4K 100"',
      'Visioconférence',
      'Micro sans fil',
      'Tableau blanc',
      'WiFi professionnel',
      'Paperboard',
      'Climatisation',
      'Service café',
    ],
  },
  {
    id: 3,
    nom: 'Terrasse & Jardin',
    category: 'Outdoor',
    capacitySeated: 100,
    capacityStanding: 200,
    size: 300,
    price: 2500,
    types: ['Cocktail', 'Soirée privée', 'Anniversaire'],
    image:
      'https://images.unsplash.com/photo-1738407282253-979e31f45785?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    images: [
      'https://images.unsplash.com/photo-1738407282253-979e31f45785?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      'https://images.unsplash.com/photo-1756504473770-2fab6e0df54d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ],
    description:
      'Magnifique terrasse de 300m² avec jardin paysager et vue panoramique sur la ville. Idéale pour cocktails, réceptions en plein air et événements estivaux. Chauffage et couverture disponibles.',
    location: 'Extérieur — vue panoramique',
    amenities: [
      'Vue panoramique',
      'Jardin paysager',
      'Bar extérieur',
      "Éclairage d'ambiance",
      'Chauffage',
      'Couverture amovible',
      'WiFi',
      'Sono extérieure',
    ],
  },
  {
    id: 4,
    nom: 'Petit Salon',
    category: 'Intimate',
    capacitySeated: 30,
    capacityStanding: 50,
    size: 60,
    price: 800,
    types: ['Anniversaire', 'Soirée privée', 'Réunion'],
    image:
      'https://images.unsplash.com/photo-1759223198981-661cadbbff36?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    images: [
      'https://images.unsplash.com/photo-1759223198981-661cadbbff36?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      'https://images.unsplash.com/photo-1720540244592-b4124532b318?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ],
    description:
      'Charmant salon de 60m² au décor raffiné, parfait pour les événements intimes. Ambiance chaleureuse avec cheminée, mobilier de luxe et service personnalisé.',
    location: 'Intimiste — aile sud',
    amenities: [
      'Cheminée',
      'TV écran plat',
      'Sonorisation Bluetooth',
      'Bar privé',
      'WiFi',
      'Climatisation',
      'Éclairage modulable',
    ],
  },
]

const CLES_NOMS = {
  'grand ballroom': 0,
  'salle executive': 1,
  'terrasse & jardin': 2,
  'petit salon': 3,
}

function normaliser(nom) {
  return String(nom || '')
    .trim()
    .toLowerCase()
}

/**
 * Retourne la fiche Luxury correspondant au nom de salle API, ou null.
 * @param {string} nomApi
 */
export function trouverLuxuryParNom(nomApi) {
  const i = CLES_NOMS[normaliser(nomApi)]
  if (i === undefined) return null
  return SALLES_LUXURY_REFERENCE[i]
}

/**
 * URLs issues de la base (`image_url` + `images_json` JSON) ou [] si absent.
 * @param {Record<string, unknown>} s — ligne API Salles
 */
export function urlsPhotosDepuisApi(s) {
  const urls = []
  if (s.images_json != null && String(s.images_json).trim() !== '') {
    try {
      const raw = s.images_json
      const p = typeof raw === 'string' ? JSON.parse(raw) : raw
      if (Array.isArray(p)) urls.push(...p.map(String).filter(Boolean))
    } catch {
      /* ignore */
    }
  }
  if (urls.length === 0 && s.image_url != null && String(s.image_url).trim() !== '') {
    urls.push(String(s.image_url).trim())
  }
  return urls
}

/**
 * Fusionne l’API avec les données Luxury (mêmes noms que le seed).
 * Si l’API est vide → affichage démo avec les 4 salles Luxury (id 1–4).
 * Les photos en base (`image_url`, `images_json`) remplacent les images Luxury si présentes.
 * @param {Array<{ id: number, name: string, capacity: number, location: string | null, image_url?: string, images_json?: string }>} sallesApi
 */
export function enrichirSallesPourEvenements(sallesApi) {
  if (!Array.isArray(sallesApi) || sallesApi.length === 0) {
    return SALLES_LUXURY_REFERENCE.map((s) => ({ ...s }))
  }

  return sallesApi.map((s, index) => {
    const ref = trouverLuxuryParNom(s.name)
    const depuisDb = urlsPhotosDepuisApi(s)
    if (ref) {
      const image = depuisDb[0] || ref.image
      const images = depuisDb.length ? depuisDb : ref.images
      return {
        ...ref,
        id: s.id,
        nom: s.name,
        location: s.location || ref.location,
        capacitySeated: s.capacity,
        capacityStanding: ref.capacityStanding,
        image,
        images,
      }
    }
    return enrichirSalleParDefaut(s, index)
  })
}

/** Fallback si une salle en base n’a pas d’équivalent Luxury */
function enrichirSalleParDefaut(s, index) {
  const capaciteAssise = s.capacity
  const capaciteDebout = Math.min(Math.round(capaciteAssise * 1.6), 800)
  const surface = Math.max(60, capaciteAssise + Math.round(capaciteAssise * 0.4))
  const prixIndicatif = Math.max(600, capaciteAssise * 12)
  const imgs = SALLES_LUXURY_REFERENCE[index % SALLES_LUXURY_REFERENCE.length]
  const depuisDb = urlsPhotosDepuisApi(s)
  const image = depuisDb[0] || imgs.image
  const imagesListe = depuisDb.length ? depuisDb : imgs.images

  let categorie = 'Premium'
  if (s.location && /conférence|business|séminaire/i.test(s.location)) categorie = 'Business'
  else if (s.location && /jardin|terrasse|extérieur/i.test(s.location)) categorie = 'Outdoor'

  const types =
    categorie === 'Business'
      ? ['Séminaire', 'Conférence', 'Formation', 'Réunion']
      : categorie === 'Outdoor'
        ? ['Cocktail', 'Soirée privée', 'Anniversaire', 'Réception']
        : ['Mariage', 'Séminaire', 'Réception', 'Anniversaire', 'Soirée privée']

  return {
    id: s.id,
    nom: s.name,
    capacitySeated: capaciteAssise,
    capacityStanding: capaciteDebout,
    size: surface,
    price: prixIndicatif,
    category: categorie,
    location: s.location || '',
    types,
    image,
    images: imagesListe,
    amenities: imgs.amenities || [
      'WiFi haute vitesse',
      'Climatisation',
      'Éclairage professionnel',
      'Sonorisation',
      'Accès PMR',
      'Service événementiel',
    ],
    description:
      s.location && String(s.location).trim()
        ? `${s.name} — ${s.location}. Espace modulable pour vos réceptions au palace La Promenade.`
        : `La salle ${s.name} accueille vos événements avec le service La Promenade.`,
  }
}

/** Onglets « type d’événement » — pictogrammes + libellés (classe .lp-emoji côté UI). */
export const ONGLETS_TYPES_EVENEMENT = [
  { id: 'all', label: 'Tous', emoji: '✨' },
  { id: 'Mariage', label: 'Mariage', emoji: '💒' },
  { id: 'Gala', label: 'Gala', emoji: '🎭' },
  { id: 'Séminaire', label: 'Séminaire', emoji: '💼' },
  { id: 'Anniversaire', label: 'Anniversaire', emoji: '🎂' },
  { id: 'Soirée privée', label: 'Soirée privée', emoji: '🥂' },
]
