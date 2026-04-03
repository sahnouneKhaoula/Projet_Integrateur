import express from 'express';
import { getAllSalles, createSalle, getSallesStats } from '../controllers/sallesController.js';

const router = express.Router();

router.get('/', getAllSalles);
router.get('/stats', getSallesStats);
router.post('/', createSalle);

export default router;