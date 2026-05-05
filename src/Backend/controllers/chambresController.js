/**
 * chambresController.js — hébergements (chambres & suites), table dbo.Chambres.
 */
import { getPool } from '../db/db.js'
import { creerNotification } from './notificationsController.js'

function normaliserImagesJson(valeur) {
  if (valeur == null || valeur === '') return null
  if (Array.isArray(valeur)) {
    const urls = valeur.filter((u) => typeof u === 'string' && u.trim())
    return urls.length ? JSON.stringify(urls) : null
  }
  if (typeof valeur === 'string') {
    const t = valeur.trim()
    if (!t) return null
    try {
      const p = JSON.parse(t)
      if (Array.isArray(p) && p.length) return JSON.stringify(p.filter(Boolean))
    } catch {
      return JSON.stringify([t])
    }
  }
  return null
}

function normaliserEquipmentsJson(valeur) {
  if (valeur == null || valeur === '') return null
  if (Array.isArray(valeur)) {
    const arr = valeur.filter((x) => typeof x === 'string' && x.trim())
    return arr.length ? JSON.stringify(arr) : null
  }
  if (typeof valeur === 'string') {
    try {
      const p = JSON.parse(valeur)
      if (Array.isArray(p) && p.length) return JSON.stringify(p.filter(Boolean))
    } catch {
      return null
    }
  }
  return null
}

function dedupliquerChambresParNom(rows) {
  const byKey = new Map()
  for (const r of rows) {
    const key = String(r.name ?? '')
      .trim()
      .toLowerCase()
    if (!key) continue
    const prev = byKey.get(key)
    if (!prev || r.id < prev.id) {
      byKey.set(key, r)
    }
  }
  return [...byKey.values()].sort((a, b) => {
    if (a.featured !== b.featured) return (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
    return b.id - a.id
  })
}

export const getAllChambres = async (req, res) => {
  try {
    const pool = await getPool()
    if (!pool) return res.status(503).json({ message: 'Base de données indisponible.' })
    const result = await pool.request().query(`
            SELECT id, name, category, description, price_per_night, size_m2, capacity,
                   vue_label, image_url, images_json, featured, equipments_json, created_at
            FROM dbo.Chambres
            ORDER BY featured DESC, id DESC
        `)
    const unique = dedupliquerChambresParNom(result.recordset)
    res.status(200).json(unique)
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

export const getChambreById = async (req, res) => {
  const raw = req.params.id
  const id = parseInt(raw, 10)
  if (!Number.isFinite(id) || id < 1) {
    return res.status(400).json({ message: 'Identifiant de chambre invalide.' })
  }
  try {
    const pool = await getPool()
    if (!pool) return res.status(503).json({ message: 'Base de données indisponible.' })
    const result = await pool.request().input('id', id).query(`
            SELECT id, name, category, description, price_per_night, size_m2, capacity,
                   vue_label, image_url, images_json, featured, equipments_json, created_at
            FROM dbo.Chambres
            WHERE id = @id
        `)
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Chambre introuvable.' })
    }
    res.status(200).json(result.recordset[0])
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

export const reserverChambre = async (req, res) => {
  const chambreId = parseInt(req.params.id, 10)
  if (!Number.isFinite(chambreId) || chambreId < 1) {
    return res.status(400).json({ message: 'Identifiant de chambre invalide.' })
  }

  const { check_in, check_out, guests, services, nom, email, telephone, notes } = req.body

  if (!check_in || !check_out || !nom || !email) {
    return res.status(400).json({
      message: 'Champs obligatoires : check_in, check_out, nom, email.',
    })
  }

  try {
    const pool = await getPool()
    if (!pool) return res.status(503).json({ message: 'Base de données indisponible.' })

    const chambreRes = await pool
      .request()
      .input('id', chambreId)
      .query('SELECT id, name, price_per_night FROM dbo.Chambres WHERE id = @id')

    if (chambreRes.recordset.length === 0) {
      return res.status(404).json({ message: 'Chambre introuvable.' })
    }

    const chambre = chambreRes.recordset[0]

    const admins = await pool.request().query(`
            SELECT u.id FROM Users u
            JOIN Roles r ON u.role_id = r.id
            WHERE r.name = 'admin' AND u.is_active = 1
        `)

    const servicestxt =
      Array.isArray(services) && services.length ? `\nServices demandés : ${services.join(', ')}.` : ''
    const messageNotif =
      `Nouvelle demande de réservation pour « ${chambre.name} » :\n` +
      `Client : ${nom} (${email}${telephone ? ', ' + telephone : ''})\n` +
      `Arrivée : ${check_in} → Départ : ${check_out}\n` +
      `Voyageurs : ${guests || 1}${servicestxt}${notes ? '\nNotes : ' + notes : ''}`

    for (const admin of admins.recordset) {
      await creerNotification(
        admin.id,
        'chambre_reservation',
        `Demande de réservation — ${chambre.name}`,
        messageNotif,
        null
      )
    }

    res.status(201).json({
      message: `Votre demande pour « ${chambre.name} » a bien été enregistrée. Notre équipe vous contactera à ${email} pour confirmer la disponibilité.`,
    })
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la demande de réservation', error: error.message })
  }
}

export const createChambre = async (req, res) => {
  const {
    name,
    category,
    description,
    price_per_night,
    size_m2,
    capacity,
    vue_label,
    image_url,
    images_json,
    featured,
    equipments_json,
  } = req.body

  if (!name || !category || price_per_night == null || size_m2 == null || capacity == null) {
    return res.status(400).json({
      message: 'Champs obligatoires : name, category, price_per_night, size_m2, capacity.',
    })
  }

  try {
    const pool = await getPool()
    if (!pool) return res.status(503).json({ message: 'Base de données indisponible.' })
    const imgJson = normaliserImagesJson(images_json)
    const eqJson = normaliserEquipmentsJson(equipments_json)
    const img =
      image_url && String(image_url).trim()
        ? String(image_url).trim()
        : imgJson
          ? (() => {
              try {
                const arr = JSON.parse(imgJson)
                return Array.isArray(arr) && arr[0] ? String(arr[0]) : null
              } catch {
                return null
              }
            })()
          : null

    await pool
      .request()
      .input('name', name)
      .input('category', category)
      .input('description', description || null)
      .input('price_per_night', parseFloat(price_per_night))
      .input('size_m2', parseInt(size_m2, 10))
      .input('capacity', parseInt(capacity, 10))
      .input('vue_label', vue_label || null)
      .input('image_url', img)
      .input('images_json', imgJson)
      .input('featured', featured ? 1 : 0)
      .input('equipments_json', eqJson)
      .query(`INSERT INTO dbo.Chambres (
                name, category, description, price_per_night, size_m2, capacity,
                vue_label, image_url, images_json, featured, equipments_json
            ) VALUES (
                @name, @category, @description, @price_per_night, @size_m2, @capacity,
                @vue_label, @image_url, @images_json, @featured, @equipments_json
            )`)

    res.status(201).json({ message: 'Chambre créée avec succès' })
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création', error: error.message })
  }
}
