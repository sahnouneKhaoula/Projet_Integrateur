/**
 * Routes /api/import et /api/export (même routeur monté deux fois dans server.js).
 * Import CSV/Excel (admin), export de données, téléchargement de modèles CSV.
 */
import express from 'express';
import {
    importEvents, importSalles, importGuests,
    exportEvents, exportUsers, exportSalles, exportGuests,
    templateEvents, templateSalles, templateGuests,
} from '../controllers/importExportController.js';
import { verifierToken, verifierAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- IMPORT (Admin uniquement) ---
router.post('/events',  verifierToken, verifierAdmin, importEvents);
router.post('/salles',  verifierToken, verifierAdmin, importSalles);
router.post('/guests',  verifierToken, verifierAdmin, importGuests);

// --- EXPORT (Staff connecté) ---
router.get('/events',   verifierToken, exportEvents);
router.get('/users',    verifierToken, exportUsers);
router.get('/salles',   verifierToken, exportSalles);
router.get('/guests',   verifierToken, exportGuests);

// --- TEMPLATES CSV (téléchargeables pour guider l'import) ---
router.get('/template/events',  verifierToken, templateEvents);
router.get('/template/salles',  verifierToken, templateSalles);
router.get('/template/guests',  verifierToken, templateGuests);

export default router;
