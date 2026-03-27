/**
 * Gestion des rôles (admin, organisateur, client, etc.) — table Roles liée à Users.
 */
import { poolPromise } from '../db/db.js';

// Récupérer tous les rôles avec le compte d'utilisateurs associés
export const getAllRoles = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT r.id, r.name,
                   COUNT(u.id) as nb_utilisateurs
            FROM Roles r
            LEFT JOIN Users u ON u.role_id = r.id
            GROUP BY r.id, r.name
            ORDER BY r.name
        `);
        res.status(200).json(result.recordset);
    } catch (error) {
        console.error("Erreur serveur:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

// Créer un rôle
export const createRole = async (req, res) => {
    const { name } = req.body;
    if (!name || name.trim() === '') {
        return res.status(400).json({ message: "Le nom du rôle est requis." });
    }
    const nomNormalise = name.trim().toLowerCase().replace(/\s+/g, '_');
    try {
        const pool = await poolPromise;
        // Vérifier si le rôle existe déjà
        const check = await pool.request()
            .input('name', nomNormalise)
            .query('SELECT id FROM Roles WHERE name = @name');
        if (check.recordset.length > 0) {
            return res.status(400).json({ message: `Le rôle "${nomNormalise}" existe déjà.` });
        }
        await pool.request()
            .input('name', nomNormalise)
            .query('INSERT INTO Roles (name) VALUES (@name)');
        res.status(201).json({ message: `Rôle "${nomNormalise}" créé avec succès.` });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la création", error: error.message });
    }
};

// Supprimer un rôle (seulement s'il n'a aucun utilisateur)
export const deleteRole = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await poolPromise;
        // Vérifier qu'aucun utilisateur n'a ce rôle
        const check = await pool.request()
            .input('id', id)
            .query('SELECT COUNT(*) as nb FROM Users WHERE role_id = @id');
        if (check.recordset[0].nb > 0) {
            return res.status(400).json({ message: "Impossible de supprimer : des utilisateurs ont ce rôle." });
        }
        await pool.request()
            .input('id', id)
            .query('DELETE FROM Roles WHERE id = @id');
        res.status(200).json({ message: "Rôle supprimé avec succès." });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression", error: error.message });
    }
};

