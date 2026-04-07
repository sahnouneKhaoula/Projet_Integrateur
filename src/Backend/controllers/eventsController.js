import { poolPromise } from '../db/db.js';
import { creerNotification } from './notificationsController.js';

// ─── GET ALL — liste complète avec jointures ──────────────────────
export const getAllEvents = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT
                e.id, e.title, e.description, e.status,
                e.start_date, e.end_date, e.created_at, e.expected_guests,
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
                e.start_date, e.end_date, e.created_at, e.expected_guests,
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
    const { title, description, organizer_id, start_date, end_date, room_id, expected_guests } = req.body;
    if (!title || !start_date || !end_date || !organizer_id)
        return res.status(400).json({ message: 'Champs obligatoires : title, start_date, end_date, organizer_id.' });
    try {
        const pool = await poolPromise;

        const debut = new Date(start_date);
        const fin   = new Date(end_date);
        const maintenant = new Date();
        if (debut < new Date(maintenant.toDateString())) {
            return res.status(400).json({ message: 'La date de début ne peut pas être dans le passé.' });
        }
        if (fin <= debut) {
            return res.status(400).json({ message: 'La date de fin doit être après la date de début.' });
        }

        

        // Si une salle et un nombre d'invités sont fournis, vérifier la capacité
        if (room_id && expected_guests) {
            const salleRes = await pool.request()
                .input('room_id', parseInt(room_id))
                .query('SELECT capacity FROM Salles WHERE id = @room_id');
            if (salleRes.recordset.length === 0) {
                return res.status(400).json({ message: 'Salle sélectionnée introuvable.' });
            }
            const capacity = salleRes.recordset[0].capacity;
            if (parseInt(expected_guests, 10) > capacity) {
                return res.status(400).json({
                    message: `Le nombre d'invités (${expected_guests}) dépasse la capacité de la salle (${capacity}).`
                });
            }
        }
// Conflit de réservation de salle
if (room_id) {
    const conflit = await pool.request()
      .input('room_id', parseInt(room_id))
      .input('start_date', new Date(start_date))
      .input('end_date', new Date(end_date))
      .query(`
        SELECT 1
        FROM Events
        WHERE room_id = @room_id
          AND status <> 'cancelled'
          AND (@start_date < end_date AND @end_date > start_date)
      `);
  
    if (conflit.recordset.length > 0) {
      return res.status(400).json({
        message: 'La salle est déjà réservée sur ce créneau. Veuillez choisir une autre plage horaire ou une autre salle.'
      });
    }
  }
        // Créer en brouillon
        const result = await pool.request()
            .input('title',        title)
            .input('description',  description || null)
            .input('organizer_id', parseInt(organizer_id))
            .input('start_date',   new Date(start_date))
            .input('end_date',     new Date(end_date))
            .input('room_id',      room_id ? parseInt(room_id) : null)
            .input('expected_guests', expected_guests ? parseInt(expected_guests, 10) : null)
            .query(`INSERT INTO Events (title, description, organizer_id, start_date, end_date, room_id, expected_guests, status)
                    OUTPUT INSERTED.id
                    VALUES (@title, @description, @organizer_id, @start_date, @end_date, @room_id, @expected_guests, 'brouillon')`);

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
    const { title, description, organizer_id, start_date, end_date, room_id, expected_guests } = req.body;
    try {
        const pool = await poolPromise;

        // Récupérer l'état actuel de l'événement
        const currentRes = await pool.request()
            .input('id', parseInt(id))
            .query('SELECT title, description, organizer_id, start_date, end_date, room_id, expected_guests, status FROM Events WHERE id = @id');
        if (currentRes.recordset.length === 0) {
            return res.status(404).json({ message: 'Événement introuvable.' });
        }
        const current = currentRes.recordset[0];

        // Règle 1: un événement annulé ou archivé ne peut plus être modifié
        if (current.status === 'cancelled' || current.status === 'archived') {
            return res.status(400).json({ message: 'Les événements annulés ou archivés ne peuvent plus être modifiés.' });
        }

        // Règle 2: un événement terminé ne permet de modifier que la description
        if (current.status === 'termine') {
            await pool.request()
                .input('id',           parseInt(id))
                .input('description',  description || null)
                .query(`UPDATE Events SET
                            description  = @description,
                            updated_at   = SYSUTCDATETIME()
                        WHERE id = @id`);
            return res.status(200).json({ message: 'Description de l\'événement mise à jour.' });
        }

        // Règle 3: pour un événement validé / en cours, on ne peut pas changer dates ni salle
        const newStart = new Date(start_date);
        const newEnd   = new Date(end_date);
        const newRoomId = room_id ? parseInt(room_id) : null;

        if ((current.status === 'valide' || current.status === 'ongoing')) {
            const sameStart = new Date(current.start_date).getTime() === newStart.getTime();
            const sameEnd   = new Date(current.end_date).getTime() === newEnd.getTime();
            const sameRoom  = (current.room_id || null) === newRoomId;
            if (!sameStart || !sameEnd || !sameRoom) {
                return res.status(400).json({
                    message: 'Les dates et la salle ne peuvent pas être modifiées une fois l\'événement confirmé ou en cours.'
                });
            }
        }

        // Mise à jour générale (titre, description, organisateur, et éventuellement dates/salle si brouillon)
        await pool.request()
            .input('id',           parseInt(id))
            .input('title',        title)
            .input('description',  description || null)
            .input('organizer_id', parseInt(organizer_id))
            .input('start_date',   newStart)
            .input('end_date',     newEnd)
            .input('room_id',      newRoomId)
            .input('expected_guests', expected_guests ? parseInt(expected_guests, 10) : null)
            .query(`UPDATE Events SET
                        title        = @title,
                        description  = @description,
                        organizer_id = @organizer_id,
                        start_date   = @start_date,
                        end_date     = @end_date,
                        room_id      = @room_id,
                        expected_guests = @expected_guests,
                        updated_at   = SYSUTCDATETIME()
                    WHERE id = @id`);

        // Synchroniser la réservation liée si elle existe déjà
        await pool.request()
            .input('event_id', parseInt(id))
            .input('room_id', newRoomId)
            .input('reserved_from', newStart)
            .input('reserved_to', newEnd)
            .query(`
                UPDATE Reservations
                SET room_id = @room_id,
                    reserved_from = @reserved_from,
                    reserved_to = @reserved_to
                WHERE event_id = @event_id
            `);
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
        const evtRes = await pool.request().input('id', parseInt(id)).query('SELECT status FROM Events WHERE id = @id');
        if (evtRes.recordset.length === 0) {
            return res.status(404).json({ message: 'Événement introuvable.' });
        }
        const { status } = evtRes.recordset[0];

        if (status !== 'brouillon') {
            return res.status(400).json({
                message: 'Seuls les événements en brouillon peuvent être supprimés. Veuillez l’annuler plutôt que le supprimer.'
            });
        }

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
    const validStatuts = ['brouillon', 'planned', 'ongoing', 'completed', 'cancelled', 'archived'];
    if (!validStatuts.includes(status))
        return res.status(400).json({ message: 'Statut invalide.' });
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', parseInt(id))
            .input('status', status)
            .query('UPDATE Events SET status = @status, updated_at = SYSUTCDATETIME() WHERE id = @id');

        // Synchroniser le statut de la réservation liée, si elle existe
        let reservationStatus = null;
        if (status === 'cancelled') reservationStatus = 'cancelled';
        else if (status === 'completed') reservationStatus = 'completed';
        else if (status === 'planned' || status === 'ongoing') reservationStatus = 'confirmed';

        if (reservationStatus) {
            await pool.request()
                .input('event_id', parseInt(id))
                .input('reservation_status', reservationStatus)
                .query(`
                    UPDATE Reservations
                    SET status = @reservation_status
                    WHERE event_id = @event_id
                `);
        }
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

        // Vérifier que l'événement existe et récupérer les infos nécessaires
        const evtRes = await pool.request().input('id', parseInt(id))
            .query(`SELECT e.id, e.title, e.organizer_id, e.status, e.room_id, e.start_date, e.end_date,
                           u.first_name + ' ' + u.last_name AS organizer_name
                    FROM Events e
                    JOIN Users u ON e.organizer_id = u.id
                    WHERE e.id = @id`);
        if (evtRes.recordset.length === 0)
            return res.status(404).json({ message: 'Événement introuvable.' });

        const evt = evtRes.recordset[0];

        if (evt.status !== 'brouillon') {
            return res.status(400).json({ message: 'Seuls les événements en brouillon peuvent être confirmés.' });
        }

        if (!evt.room_id || !evt.start_date || !evt.end_date) {
            return res.status(400).json({
                message: 'Impossible de confirmer: la salle et les dates de l’événement sont obligatoires.'
            });
        }

        // Passer en planned
        await pool.request()
            .input('id', parseInt(id))
            .query("UPDATE Events SET status = 'planned', updated_at = SYSUTCDATETIME() WHERE id = @id");

        // Créer ou mettre à jour automatiquement la réservation liée à l'événement
        const resaRes = await pool.request()
            .input('event_id', parseInt(id))
            .query('SELECT id FROM Reservations WHERE event_id = @event_id');

        if (resaRes.recordset.length > 0) {
            await pool.request()
                .input('event_id', parseInt(id))
                .input('room_id', parseInt(evt.room_id))
                .input('reserved_from', new Date(evt.start_date))
                .input('reserved_to', new Date(evt.end_date))
                .input('status', 'confirmed')
                .query(`
                    UPDATE Reservations
                    SET room_id = @room_id,
                        reserved_from = @reserved_from,
                        reserved_to = @reserved_to,
                        status = @status
                    WHERE event_id = @event_id
                `);
        } else {
            await pool.request()
                .input('event_id', parseInt(id))
                .input('room_id', parseInt(evt.room_id))
                .input('reserved_from', new Date(evt.start_date))
                .input('reserved_to', new Date(evt.end_date))
                .input('status', 'confirmed')
                .query(`
                    INSERT INTO Reservations (event_id, room_id, reserved_from, reserved_to, status)
                    VALUES (@event_id, @room_id, @reserved_from, @reserved_to, @status)
                `);
        }

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
