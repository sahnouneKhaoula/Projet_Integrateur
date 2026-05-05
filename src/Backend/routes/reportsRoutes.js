/**
 * Rapports API — squelette pour /api/reports (dashboard).
 * Étendre avec exports CSV/PDF ou agrégations si besoin.
 */
import express from 'express'
import { verifierToken, verifierAdmin } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', verifierToken, verifierAdmin, (_req, res) => {
  res.status(200).json([])
})

router.get('/:id', verifierToken, verifierAdmin, (_req, res) => {
  res.status(501).json({ message: 'Rapport par événement non encore implémenté côté serveur.' })
})

export default router
