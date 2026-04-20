import express from 'express';
import { getAllUsers, createUser, loginUser, registerUser, getRolesStaff } from '../controllers/usersController.js';
import { verifierToken, verifierAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', verifierToken, getAllUsers);                              // Liste users (connecté requis)
router.post('/', verifierToken, verifierAdmin, createUser);              // Création interne (admin seulement)
router.post('/login', loginUser);
router.post('/register', registerUser);                                  // Inscription publique (rôle Client)
router.get('/roles-staff', verifierToken, verifierAdmin, getRolesStaff); // Rôles Staff disponibles pour le formulaire

export default router;
