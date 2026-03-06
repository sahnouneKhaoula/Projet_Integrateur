import { poolPromise } from '../db/db.js';

// Récupérer tous les rôles
export const getAllRoles = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Roles');
        res.status(200).json(result.recordset);
    } catch (error) {
        console.error("Erreur serveur:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

// Créer un rôle
export const createRole = async (req, res) => {
    const { name } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('name', name)
            .query('INSERT INTO Roles (name) VALUES (@name)');
        res.status(201).json({ message: "Rôle créé avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la création", error: error.message });
    }
};
