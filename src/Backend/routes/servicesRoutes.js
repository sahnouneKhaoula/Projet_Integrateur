import express from 'express';
import { getAllServices, createService } from '../controllers/servicesController.js';
import { verifierToken, verifierAdmin  } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllServices);
router.post('/', createService);

export default router;
