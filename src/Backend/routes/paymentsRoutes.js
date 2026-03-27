/**
 * Routes /api/payments — paiements.
 */
import express from 'express';
import { getAllPayments, createPayment } from '../controllers/paymentsController.js';

const router = express.Router();

router.get('/', getAllPayments);
router.post('/', createPayment);

export default router;
