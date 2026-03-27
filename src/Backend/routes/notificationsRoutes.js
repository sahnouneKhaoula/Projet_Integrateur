/**
 * Routes /api/notifications — liste, compteur non lues, marquer lu (utilisateur connecté).
 */
import express from 'express';
import {
    getMesNotifications, getNbNonLues,
    marquerToutLu, marquerUniLu
} from '../controllers/notificationsController.js';
import { verifierToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/',              verifierToken, getMesNotifications); // mes notifs
router.get('/non-lues',      verifierToken, getNbNonLues);        // badge compteur
router.patch('/lire-tout',   verifierToken, marquerToutLu);       // tout lire
router.patch('/:id/lire',    verifierToken, marquerUniLu);        // lire une

export default router;
