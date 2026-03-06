import express from 'express';
import { getAllInvoices, createInvoice } from '../controllers/invoicesController.js';

const router = express.Router();

router.get('/', getAllInvoices);
router.post('/', createInvoice);

export default router;
