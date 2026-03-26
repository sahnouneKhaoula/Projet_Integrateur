import express from 'express';
import { getStats } from '../controllers/statsController.js';
import { verifierToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', verifierToken, getStats); // Stats du Dashboard (utilisateur connecté requis)

export default router;
