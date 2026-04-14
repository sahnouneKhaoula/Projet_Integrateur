import express from 'express';
import { getAllInvoices, createInvoice, validateInvoice } from '../controllers/invoicesController.js';
import { verifierToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', verifierToken, getAllInvoices);
router.post('/', verifierToken, createInvoice);
router.patch('/:id/validate', verifierToken, validateInvoice);

export default router;
