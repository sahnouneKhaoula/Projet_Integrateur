import { poolPromise } from '../db/db.js';
import { creerNotification } from './notificationsController.js';

// ─── GET ALL — liste complète avec jointures ──────────────────────
export const getAllEvents = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT
                e.id, e.title, e.description, e.status,
                e.start_date, e.end_date, e.created_at,
                u.id          AS organizer_id,
                u.first_name + ' ' + u.last_name AS organizer_name,
                u.email       AS organizer_email,
                s.id          AS room_id,
                s.name        AS room_name,
                s.capacity    AS room_capacity,
                (SELECT COUNT(*) FROM Guests   g WHERE g.event_id = e.id) AS nb_guests,
                (SELECT COUNT(*) FROM Services sv WHERE sv.event_id = e.id) AS nb_services
            FROM Events e
            LEFT JOIN Users  u ON e.organizer_id = u.id
            LEFT JOIN Salles s ON e.room_id      = s.id
            ORDER BY e.start_date DESC
        `);
        res.status(200).json(result.recordset);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

// ─── GET ONE — détail complet ─────────────────────────────────────
export const getEventById = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await poolPromise;

        // Événement
        const evtRes = await pool.request().input('id', parseInt(id)).query(`
            SELECT
                e.id, e.title, e.description, e.status,
                e.start_date, e.end_date, e.created_at,
                u.id          AS organizer_id,
                u.first_name + ' ' + u.last_name AS organizer_name,
                u.email       AS organizer_email,
                s.id          AS room_id,
                s.name        AS room_name,
                s.capacity    AS room_capacity,
                s.location    AS room_location
            FROM Events e
            LEFT JOIN Users  u ON e.organizer_id = u.id
            LEFT JOIN Salles s ON e.room_id      = s.id
            WHERE e.id = @id
        `);
        if (evtRes.recordset.length === 0)
            return res.status(404).json({ message: 'Événement introuvable.' });

        // Invités
        const guestsRes = await pool.request().input('id', parseInt(id))
            .query('SELECT id, full_name, email, phone FROM Guests WHERE event_id = @id ORDER BY full_name');

        // Services
        const servicesRes = await pool.request().input('id', parseInt(id))
            .query('SELECT id, name, price FROM Services WHERE event_id = @id ORDER BY name');

        res.status(200).json({
            event: evtRes.recordset[0],
            guests: guestsRes.recordset,
            services: servicesRes.recordset,
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

// ─── CREATE (brouillon par défaut, notif admins) ──────────────────
export const createEvent = async (req, res) => {
    const { title, description, organizer_id, start_date, end_date, room_id } = req.body;
    if (!title || !start_date || !end_date || !organizer_id)
        return res.status(400).json({ message: 'Champs obligatoires : title, start_date, end_date, organizer_id.' });
    try {
        const pool = await poolPromise;

        // Créer en brouillon
        const result = await pool.request()
            .input('title',        title)
            .input('description',  description || null)
            .input('organizer_id', parseInt(organizer_id))
            .input('start_date',   new Date(start_date))
            .input('end_date',     new Date(end_date))
            .input('room_id',      room_id ? parseInt(room_id) : null)
            .query(`INSERT INTO Events (title, description, organizer_id, start_date, end_date, room_id, status)
                    OUTPUT INSERTED.id
                    VALUES (@title, @description, @organizer_id, @start_date, @end_date, @room_id, 'brouillon')`);

        const eventId = result.recordset[0].id;

        // Notifier tous les admins
        const admins = await pool.request().query(`
            SELECT u.id FROM Users u
            JOIN Roles r ON u.role_id = r.id
            WHERE r.name = 'admin' AND u.is_active = 1
        `);
        for (const admin of admins.recordset) {
            await creerNotification(
                admin.id,
                'event_pending',
                'Nouvel événement en attente de confirmation',
                `L'événement « ${title} » a été soumis et attend votre confirmation.`,
                eventId
            );
        }

        res.status(201).json({ message: 'Événement créé en brouillon — en attente de confirmation admin.', id: eventId });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la création', error: error.message });
    }
};

// ─── UPDATE ───────────────────────────────────────────────────────
export const updateEvent = async (req, res) => {
    const { id } = req.params;
    const { title, description, organizer_id, start_date, end_date, room_id, status } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id',           parseInt(id))
            .input('title',        title)
            .input('description',  description || null)
            .input('organizer_id', parseInt(organizer_id))
            .input('start_date',   new Date(start_date))
            .input('end_date',     new Date(end_date))
            .input('room_id',      room_id ? parseInt(room_id) : null)
            .input('status',       status)
            .query(`UPDATE Events SET
                        title        = @title,
                        description  = @description,
                        organizer_id = @organizer_id,
                        start_date   = @start_date,
                        end_date     = @end_date,
                        room_id      = @room_id,
                        status       = @status,
                        updated_at   = SYSUTCDATETIME()
                    WHERE id = @id`);
        res.status(200).json({ message: 'Événement mis à jour.' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la mise à jour', error: error.message });
    }
};

// ─── DELETE ───────────────────────────────────────────────────────
export const deleteEvent = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await poolPromise;
        // Supprimer les dépendances d'abord
        await pool.request().input('id', parseInt(id)).query('DELETE FROM Services WHERE event_id = @id');
        await pool.request().input('id', parseInt(id)).query('DELETE FROM Guests   WHERE event_id = @id');
        await pool.request().input('id', parseInt(id)).query('DELETE FROM Events   WHERE id       = @id');
        res.status(200).json({ message: 'Événement supprimé.' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la suppression', error: error.message });
    }
};

// ─── CHANGER LE STATUT ────────────────────────────────────────────
export const updateEventStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuts = ['brouillon', 'planned', 'ongoing', 'completed', 'cancelled'];
    if (!validStatuts.includes(status))
        return res.status(400).json({ message: 'Statut invalide.' });
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', parseInt(id))
            .input('status', status)
            .query('UPDATE Events SET status = @status, updated_at = SYSUTCDATETIME() WHERE id = @id');
        res.status(200).json({ message: 'Statut mis à jour.' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur', error: error.message });
    }
};

// ─── CONFIRMER (brouillon → planned + notif organisateur) ───────
export const confirmerEvent = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await poolPromise;

        // Vérifier que l'événement est bien en brouillon
        const evtRes = await pool.request().input('id', parseInt(id))
            .query(`SELECT e.id, e.title, e.organizer_id,
                           u.first_name + ' ' + u.last_name AS organizer_name
                    FROM Events e
                    JOIN Users u ON e.organizer_id = u.id
                    WHERE e.id = @id`);
        if (evtRes.recordset.length === 0)
            return res.status(404).json({ message: 'Événement introuvable.' });

        const evt = evtRes.recordset[0];

        // Passer en planned
        await pool.request()
            .input('id', parseInt(id))
            .query("UPDATE Events SET status = 'planned', updated_at = SYSUTCDATETIME() WHERE id = @id");

        // Notifier l'organisateur
        await creerNotification(
            evt.organizer_id,
            'event_confirmed',
            'Événement confirmé ✅',
            `Votre événement « ${evt.title} » a été confirmé par l'administrateur. Il est maintenant planifié !`,
            parseInt(id)
        );

        res.status(200).json({ message: `Événement « ${evt.title} » confirmé et planifié.` });
    } catch (error) {
        res.status(500).json({ message: 'Erreur', error: error.message });
    }
};
