/**
 * Catalogue local + API — même logique que smart projet (ids catalogue décalés, repli si API vide).
 */

/** Préfixe d'id pour les fiches « code » (évite les collisions avec /api/chambres). */
export const CHAMBRES_CODE_ID_OFFSET = 50000

export const ONGLETS_CHAMBRES = [
  { id: 'all', label: 'Toutes', emoji: '✨' },
  { id: 'chambre', label: 'Chambres', emoji: '🛏️' },
  { id: 'suite', label: 'Suites', emoji: '👑' },
]

const CATALOGUE_BRUT = [
  {
    id: 1,
    nom: 'Chambre Deluxe',
    categorie: 'chambre',
    description: 'Élégance contemporaine avec tout le confort moderne, baignée de lumière naturelle.',
    prix: 450,
    taille: 45,
    capacite: 2,
    vue: 'Jardin',
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
    equipements: ['Wi-Fi', 'Minibar', 'Climatisation', 'TV 55"'],
    featured: false,
  },
  {
    id: 2,
    nom: 'Suite Prestige',
    categorie: 'suite',
    description: 'Espace généreux avec salon séparé et vue imprenable sur la ville.',
    prix: 850,
    taille: 80,
    capacite: 3,
    vue: 'Ville',
    image: 'https://images.unsplash.com/photo-1759223198981-661cadbbff36?w=800&q=80',
    equipements: ['Salon privé', 'Balcon', 'Nespresso', 'Baignoire spa'],
    featured: true,
  },
  {
    id: 3,
    nom: 'Suite Royale',
    categorie: 'suite',
    description: 'Luxe absolu avec service de majordome personnalisé et terrasse privée.',
    prix: 1500,
    taille: 150,
    capacite: 4,
    vue: 'Panoramique',
    image: 'https://images.unsplash.com/photo-1694485190402-3ed8f6e85350?w=800&q=80',
    equipements: ['2 chambres', 'Terrasse', 'Bar personnel', 'Majordome'],
    featured: true,
  },
  {
    id: 4,
    nom: 'Chambre Supérieure',
    categorie: 'chambre',
    description: 'Confort raffiné dans un cadre intimiste, idéal pour un séjour romantique.',
    prix: 350,
    taille: 35,
    capacite: 2,
    vue: 'Cour',
    image: 'https://images.unsplash.com/photo-1723108263618-5364ae353220?w=800&q=80',
    equipements: ['Literie premium', 'Douche pluie', 'Coffre-fort', 'Peignoir'],
    featured: false,
  },
  {
    id: 5,
    nom: 'Penthouse',
    categorie: 'suite',
    description: "L'excellence à son paroxysme avec rooftop privé et vue panoramique.",
    prix: 3500,
    taille: 300,
    capacite: 6,
    vue: 'Panoramique',
    image: 'https://images.unsplash.com/photo-1723119832675-0031e0f0408c?w=800&q=80',
    equipements: ['3 chambres', 'Rooftop 200m²', 'Jacuzzi', 'Chef à domicile'],
    featured: true,
  },
  {
    id: 6,
    nom: 'Chambre Executive',
    categorie: 'chambre',
    description: "Parfait pour les voyageurs d'affaires exigeants, avec espace bureau dédié.",
    prix: 550,
    taille: 50,
    capacite: 2,
    vue: 'Ville',
    image: 'https://images.unsplash.com/photo-1663659504863-43dd69a5fda2?w=800&q=80',
    equipements: ['Bureau', 'Lounge accès', 'Check-in privé', 'Presse quotidienne'],
    featured: false,
  },
]

function parseJsonArray(raw) {
  if (!raw) return []
  try {
    const p = typeof raw === 'string' ? JSON.parse(raw) : raw
    return Array.isArray(p) ? p.filter(Boolean) : []
  } catch {
    return []
  }
}

/** Lignes catalogue avec id unique (côte API). */
export function chambresCatalogueCodeAvecIdsUniques() {
  return CATALOGUE_BRUT.map((c) => ({
    ...c,
    id: CHAMBRES_CODE_ID_OFFSET + c.id,
    images: [c.image],
  }))
}

function normalizeApiRow(row) {
  if (!row || typeof row !== 'object') return null
  const id = Number(row.id ?? row.chambre_id ?? row.room_id)
  if (!Number.isFinite(id)) return null
  const prix = Number(row.prix ?? row.price_per_night ?? row.prix_nuit ?? 0)
  const taille = Number(row.taille ?? row.size_m2 ?? row.superficie ?? 0)
  const capacite = Number(row.capacite ?? row.capacity ?? row.capacité ?? 2)
  const categorieRaw = String(row.categorie ?? row.type ?? row.category ?? 'chambre').toLowerCase()
  const categorie = categorieRaw.includes('suite') ? 'suite' : 'chambre'
  let images = []
  if (Array.isArray(row.images)) images = row.images.filter(Boolean)
  else images = parseJsonArray(row.images_json)
  const imageUrl = String(row.image ?? row.image_url ?? '').trim()
  const image = imageUrl || images[0] || CATALOGUE_BRUT[0].image
  if (!images.length && image) images = [image]

  let equipements = []
  if (Array.isArray(row.equipements)) equipements = row.equipements
  else if (typeof row.equipements === 'string') {
    equipements = row.equipements.split(',').map((s) => s.trim()).filter(Boolean)
  } else {
    equipements = parseJsonArray(row.equipments_json)
  }

  return {
    id,
    nom: String(row.nom ?? row.name ?? row.titre ?? `Chambre ${id}`),
    categorie,
    description: String(row.description ?? ''),
    prix: Number.isFinite(prix) ? prix : 0,
    taille: Number.isFinite(taille) ? taille : 35,
    capacite: Number.isFinite(capacite) ? capacite : 2,
    vue: String(row.vue ?? row.view ?? row.vue_label ?? 'Ville').replace(/^\w/, (c) => c.toUpperCase()),
    image,
    images: images.length ? images : [image],
    equipements,
    featured: Boolean(row.featured ?? row.mise_en_avant),
  }
}

/** Mappe une ligne API « anglaise » (schéma type smart projet). */
function chambreDepuisApiAnglais(row) {
  let images = parseJsonArray(row.images_json)
  let equipements = parseJsonArray(row.equipments_json)
  const imageUrl = row.image_url && String(row.image_url).trim()
  const image = imageUrl || images[0] || ''
  if (!images.length && image) images = [image]
  const featured = row.featured === true || row.featured === 1
  const categorie = String(row.category ?? '')
    .trim()
    .toLowerCase()

  return {
    id: row.id,
    nom: row.name,
    categorie,
    description: row.description || '',
    prix: Number(row.price_per_night) || 0,
    taille: row.size_m2,
    capacite: row.capacity,
    vue: row.vue_label || '',
    image,
    images: images.length ? images : [image],
    equipements,
    featured,
  }
}

/** Mappe une ligne API vers le format pages Chambres / détail. */
export function chambreDepuisApi(row) {
  if (!row) return null
  const likelyEnglish = row.name != null && row.nom == null && row.id != null
  if (likelyEnglish) return chambreDepuisApiAnglais(row)
  return normalizeApiRow(row)
}

/**
 * Si l'API renvoie au moins une chambre : uniquement la base.
 * Sinon repli sur le catalogue code (ids décalés).
 */
export function fusionnerChambresApiEtCatalogue(apiMapped) {
  const fromApi = Array.isArray(apiMapped) ? apiMapped.filter(Boolean) : []
  if (fromApi.length > 0) return fromApi
  return chambresCatalogueCodeAvecIdsUniques()
}

export function estChambreCatalogueCode(chambre) {
  return chambre && Number(chambre.id) >= CHAMBRES_CODE_ID_OFFSET
}

export function getChambreById(id) {
  const n = Number.parseInt(String(id), 10)
  if (!Number.isFinite(n)) return null
  if (n >= CHAMBRES_CODE_ID_OFFSET) {
    const localId = n - CHAMBRES_CODE_ID_OFFSET
    const c = CATALOGUE_BRUT.find((x) => x.id === localId)
    if (!c) return null
    return { ...c, id: n, images: [c.image] }
  }
  const direct = CATALOGUE_BRUT.find((x) => x.id === n)
  return direct ? { ...direct, images: [direct.image] } : null
}
