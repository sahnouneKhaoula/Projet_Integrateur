import { poolPromise } from '../db/db.js';

// Récupérer tous les services
export const getAllServices = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Services');
        res.status(200).json(result.recordset);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

// Ajouter un service
export const createService = async (req, res) => {
    const { event_id, name, price } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('event_id', event_id)
            .input('name', name)
            .input('price', price || 0)
            .query(`INSERT INTO Services (event_id, name, price) 
                    VALUES (@event_id, @name, @price)`);
        res.status(201).json({ message: "Service créé avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la création", error: error.message });
    }
};
