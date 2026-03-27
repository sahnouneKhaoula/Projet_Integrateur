/** Invités associés à un événement (liste, ajout). */
import { poolPromise } from '../db/db.js';

// Récupérer tous les invités
export const getAllGuests = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Guests');
        res.status(200).json(result.recordset);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

// Ajouter un invité
export const createGuest = async (req, res) => {
    const { event_id, full_name, email, phone } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('event_id', event_id)
            .input('full_name', full_name)
            .input('email', email)
            .input('phone', phone)
            .query(`INSERT INTO Guests (event_id, full_name, email, phone) 
                    VALUES (@event_id, @full_name, @email, @phone)`);
        res.status(201).json({ message: "Invité créé avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la création", error: error.message });
    }
};
