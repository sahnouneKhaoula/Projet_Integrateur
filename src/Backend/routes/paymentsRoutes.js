import express from 'express';
import { getAllPayments, createPayment } from '../controllers/paymentsController.js';
import { verifierToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', verifierToken, getAllPayments);
router.post('/', verifierToken, createPayment);

export default router;
