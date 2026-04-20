import express from 'express';
import { getAllReservations, createReservation } from '../controllers/reservationsController.js';

const router = express.Router();

router.get('/', getAllReservations);
router.post('/', createReservation);

export default router;
