import { poolPromise } from '../db/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Authentification (Login)
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const pool = await poolPromise;
        // Jointure avec Roles pour récupérer directement le nom du rôle
        const result = await pool.request()
            .input('email', email)
            .query(`
                SELECT u.*, r.name as role_name 
                FROM Users u
                JOIN Roles r ON u.role_id = r.id
                WHERE u.email = @email
            `);

        if (result.recordset.length === 0) {
            return res.status(401).json({ message: "Email ou mot de passe incorrect." });
        }

        const user = result.recordset[0];

        // Vérification si le compte est actif
        if (!user.is_active) {
            return res.status(403).json({ message: "Ce compte a été désactivé." });
        }

        // Vérification du mot de passe
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ message: "Email ou mot de passe incorrect." });
        }

        // Mise à jour de last_login (Optionnel, mais utile)
        await pool.request()
            .input('id', user.id)
            .query('UPDATE Users SET last_login = SYSUTCDATETIME() WHERE id = @id');

        // Création du Token JWT
        // Assure-toi d'avoir un JWT_SECRET dans ton fichier .env !
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role_name },
            process.env.JWT_SECRET || 'clef_secrete_super_securisee_temporaire',
            { expiresIn: '24h' }
        );

        // On ne renvoie pas le mot de passe hashé au frontend
        delete user.password_hash;

        res.status(200).json({
            message: "Connexion réussie",
            token,
            user: { ...user, role: user.role_name } // On s'assure que le frontend a bien un champ "role"
        });

    } catch (error) {
        console.error("Erreur de login:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

// Récupérer tous les utilisateurs
export const getAllUsers = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT id, username, email, first_name, last_name, phone, role_id, is_active, created_at FROM Users');
        res.status(200).json(result.recordset);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

// Créer un utilisateur
export const createUser = async (req, res) => {
    const { username, email, password, first_name, last_name, phone, role_id } = req.body;
    try {
        const pool = await poolPromise;
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        await pool.request()
            .input('username', username)
            .input('email', email)
            .input('password_hash', password_hash)
            .input('first_name', first_name)
            .input('last_name', last_name)
            .input('phone', phone)
            .input('role_id', role_id)
            .query(`INSERT INTO Users (username, email, password_hash, first_name, last_name, phone, role_id) 
                    VALUES (@username, @email, @password_hash, @first_name, @last_name, @phone, @role_id)`);
        res.status(201).json({ message: "Utilisateur créé avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la création", error: error.message });
    }
};
