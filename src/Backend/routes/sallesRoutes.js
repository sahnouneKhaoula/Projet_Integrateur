import express from 'express';
import { getAllSalles, createSalle } from '../controllers/sallesController.js';

const router = express.Router();

router.get('/', getAllSalles);
router.post('/', createSalle);

export default router;
