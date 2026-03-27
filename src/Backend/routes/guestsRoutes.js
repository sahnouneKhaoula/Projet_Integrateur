/**
 * Routes /api/guests — invités (guests) associés aux événements.
 */
import express from 'express';
import { getAllGuests, createGuest } from '../controllers/guestsController.js';

const router = express.Router();

router.get('/', getAllGuests);
router.post('/', createGuest);

export default router;
