import express from 'express';
import { getAllRoles, createRole, deleteRole } from '../controllers/rolesController.js';
import { verifierToken, verifierAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', verifierToken, getAllRoles);                        // Lecture des rôles (connecté)
router.post('/', verifierToken, verifierAdmin, createRole);         // Création (admin uniquement)
router.delete('/:id', verifierToken, verifierAdmin, deleteRole);    // Suppression (admin uniquement)

export default router;

