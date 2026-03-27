/**
 * Middlewares d'authentification pour les routes protégées.
 *
 * `verifierToken` : lit le header `Authorization: Bearer <jwt>`, vérifie la signature,
 *                   et attache `req.utilisateur` { id, email, role } pour les handlers suivants.
 * `verifierAdmin` : à placer APRÈS verifierToken ; refuse si le rôle n'est pas "admin".
 */
import jwt from 'jsonwebtoken';

// Middleware : vérifie que l'utilisateur est connecté (JWT valide)
export const verifierToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer <token>"

    if (!token) {
        return res.status(401).json({ message: "Accès refusé. Token manquant." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'clef_secrete_super_securisee_temporaire');
        req.utilisateur = decoded; // { id, email, role }
        next();
    } catch (error) {
        return res.status(403).json({ message: "Token invalide ou expiré." });
    }
};

// Middleware : vérifie que l'utilisateur est bien un Admin
export const verifierAdmin = (req, res, next) => {
    if (!req.utilisateur || req.utilisateur.role !== 'admin') {
        return res.status(403).json({ message: "Accès refusé. Réservé aux administrateurs." });
    }
    next();
};
