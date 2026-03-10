import express from 'express';
import { getAllUsers, createUser, loginUser, registerUser } from '../controllers/usersController.js';

const router = express.Router();

router.get('/', getAllUsers);
router.post('/', createUser); // Pour la création interne globale (nécessite role_id)
router.post('/login', loginUser);
router.post('/register', registerUser); // Pour l'inscription publique (rôle Client verrouillé)

export default router;
