import express from 'express';
import {
    getAllServices,
    chargerDemandes,
    traiterDemande,
    creerDemandesServices,
    getServicesByEvent
} from '../controllers/servicesController.js';
import { verifierToken, verifierAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET  /api/services              → tous les services
router.get('/',            verifierToken, getAllServices);

// GET  /api/services/a-traiter    → demandes à traiter (coordinateur/admin)
router.get('/a-traiter',   verifierToken, verifierAdmin, chargerDemandes);

// POST /api/services/event/:id    → soumettre des demandes pour un événement
router.post('/event/:id',  verifierToken, creerDemandesServices);

// GET  /api/services/event/:id    → services d'un événement précis
router.get('/event/:id',   verifierToken, getServicesByEvent);

// PUT  /api/services/:id          → traiter une demande (valider/rejeter)
router.put('/:id',         verifierToken, verifierAdmin, traiterDemande);

export default router;