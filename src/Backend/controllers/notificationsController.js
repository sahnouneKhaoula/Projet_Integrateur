import { poolPromise } from '../db/db.js';

// ─── Créer une notification (usage interne) ──────────────────────
export const creerNotification = async (user_id, type, title, message, event_id = null) => {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('user_id',  parseInt(user_id))
            .input('type',     type)
            .input('title',    title)
            .input('message',  message)
            .input('event_id', event_id ? parseInt(event_id) : null)
            .query(`INSERT INTO Notifications (user_id, type, title, message, event_id)
                    VALUES (@user_id, @type, @title, @message, @event_id)`);
    } catch (err) {
        console.error('Erreur création notification:', err.message);
    }
};

// ─── GET — mes notifications ──────────────────────────────────────
// GET /api/notifications
export const getMesNotifications = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('user_id', req.utilisateur.id)
            .query(`SELECT TOP 30 * FROM Notifications
                    WHERE user_id = @user_id
                    ORDER BY created_at DESC`);
        res.status(200).json(result.recordset);
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
};

// ─── Nb de non-lues ───────────────────────────────────────────────
// GET /api/notifications/non-lues
export const getNbNonLues = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('user_id', req.utilisateur.id)
            .query(`SELECT COUNT(*) as nb FROM Notifications
                    WHERE user_id = @user_id AND is_read = 0`);
        res.status(200).json({ nb: result.recordset[0].nb });
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
};

// ─── Marquer comme lues ───────────────────────────────────────────
// PATCH /api/notifications/lire-tout
export const marquerToutLu = async (req, res) => {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('user_id', req.utilisateur.id)
            .query(`UPDATE Notifications SET is_read = 1
                    WHERE user_id = @user_id AND is_read = 0`);
        res.status(200).json({ message: 'Toutes les notifications marquées comme lues.' });
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
};

// ─── Marquer une seule comme lue ─────────────────────────────────
// PATCH /api/notifications/:id/lire
export const marquerUniLu = async (req, res) => {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id',      parseInt(req.params.id))
            .input('user_id', req.utilisateur.id)
            .query(`UPDATE Notifications SET is_read = 1
                    WHERE id = @id AND user_id = @user_id`);
        res.status(200).json({ message: 'Notification lue.' });
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
};
