import express from 'express';
import {
    getAllEvents, getEventById,
    createEvent, updateEvent, deleteEvent,
    updateEventStatus, confirmerEvent
} from '../controllers/eventsController.js';
import { verifierToken, verifierAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/',               verifierToken, getAllEvents);
router.get('/:id',            verifierToken, getEventById);
router.post('/',              verifierToken, createEvent);
router.put('/:id',            verifierToken, verifierAdmin, updateEvent);
router.delete('/:id',         verifierToken, verifierAdmin, deleteEvent);
router.patch('/:id/statut',   verifierToken, verifierAdmin, updateEventStatus);
router.patch('/:id/confirmer',verifierToken, verifierAdmin, confirmerEvent);

export default router;