import { poolPromise } from '../db/db.js';

// Récupérer toutes les réservations
export const getAllReservations = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Reservations');
        res.status(200).json(result.recordset);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

// Créer une réservation
export const createReservation = async (req, res) => {
    const { event_id, room_id, reserved_from, reserved_to, status } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('event_id', event_id)
            .input('room_id', room_id)
            .input('reserved_from', reserved_from)
            .input('reserved_to', reserved_to)
            .input('status', status || 'pending')
            .query(`INSERT INTO Reservations (event_id, room_id, reserved_from, reserved_to, status) 
                    VALUES (@event_id, @room_id, @reserved_from, @reserved_to, @status)`);
        res.status(201).json({ message: "Réservation créée avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la création", error: error.message });
    }
};
