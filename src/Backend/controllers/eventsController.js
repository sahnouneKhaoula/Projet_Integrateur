import { poolPromise } from '../db/db.js';

// Récupérer tous les événements
export const getAllEvents = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Events');
        res.status(200).json(result.recordset);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

// Créer un événement
export const createEvent = async (req, res) => {
    const { title, description, organizer_id, start_date, end_date, room_id, status } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('title', title)
            .input('description', description)
            .input('organizer_id', organizer_id)
            .input('start_date', start_date)
            .input('end_date', end_date)
            .input('room_id', room_id)
            .input('status', status || 'planned')
            .query(`INSERT INTO Events (title, description, organizer_id, start_date, end_date, room_id, status) 
                    VALUES (@title, @description, @organizer_id, @start_date, @end_date, @room_id, @status)`);
        res.status(201).json({ message: "Événement créé avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la création", error: error.message });
    }
};
