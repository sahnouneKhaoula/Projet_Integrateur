/**
 * Routes /api/chambres — catalogue hébergements (lecture publique).
 */
import express from 'express'
import { getAllChambres, getChambreById, createChambre, reserverChambre } from '../controllers/chambresController.js'
import { verifierToken, verifierAdmin } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', getAllChambres)
router.get('/:id', getChambreById)

router.post('/:id/reserver', verifierToken, reserverChambre)

router.post('/', verifierToken, verifierAdmin, createChambre)

export default router
