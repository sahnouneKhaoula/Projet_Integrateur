import { poolPromise } from '../db/db.js';

// Récupérer toutes les salles
export const getAllSalles = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Salles');
        res.status(200).json(result.recordset);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

// Créer une salle
export const createSalle = async (req, res) => {
    const { name, capacity, location } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('name', name)
            .input('capacity', capacity)
            .input('location', location)
            .query('INSERT INTO Salles (name, capacity, location) VALUES (@name, @capacity, @location)');
        res.status(201).json({ message: "Salle créée avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la création", error: error.message });
    }
};
