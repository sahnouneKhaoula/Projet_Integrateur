import { poolPromise } from '../db/db.js';
import { creerNotification } from './notificationsController.js';

// Statuts : DEMANDÉ → VALIDÉ | REJETÉ

export const creerDemandesServices = async (req, res) => {
    const event_id = parseInt(req.params.id);
    const services = Array.isArray(req.body) ? req.body : [req.body];

    if (!services.length) {
        return res.status(400).json({ message: 'Aucun service fourni.' });
    }

    try {
        const pool = await poolPromise;

        const evtRes = await pool.request()
            .input('event_id', event_id)
            .query(`SELECT id, title, organizer_id FROM Events WHERE id = @event_id`);

        if (!evtRes.recordset.length) {
            return res.status(404).json({ message: 'Événement introuvable.' });
        }

        const event = evtRes.recordset[0];
        const insertedIds = [];

        for (const svc of services) {
            const { name, price } = svc;

            if (!name) {
                return res.status(400).json({ message: 'Le champ "name" est requis pour chaque service.' });
            }

            const insertRes = await pool.request()
                .input('event_id', event_id)
                .input('name',     name)
                .input('price',    price || 0)
                .query(`
                    INSERT INTO Services (event_id, name, price)
                    OUTPUT INSERTED.id
                    VALUES (@event_id, @name, @price)
                `);

            insertedIds.push(insertRes.recordset[0].id);
        }

        // Notifier les coordinateurs / admins
        const coordRes = await pool.request().query(`
            SELECT u.id FROM Users u
            INNER JOIN Roles r ON u.role_id = r.id
            WHERE r.name IN ('coordinateur', 'admin') AND u.is_active = 1
        `);

        for (const coord of coordRes.recordset) {
            await creerNotification(
                coord.id,
                'service_demande',
                'Nouvelle demande de service',
                `${insertedIds.length} demande(s) soumise(s) pour l'événement « ${event.title} ».`,
                event_id
            );
        }

        res.status(201).json({
            message:     'Demande(s) enregistrée(s).',
            service_ids: insertedIds
        });

    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

export const chargerDemandes = async (req, res) => {
    try {
        const pool = await poolPromise;

        const result = await pool.request().query(`
            SELECT
                s.id,
                s.name,
                s.price,
                s.created_at,
                e.title AS event_title,
                u.first_name + ' ' + u.last_name AS organizer_name
            FROM Services s
            INNER JOIN Events e ON s.event_id = e.id
            INNER JOIN Users  u ON e.organizer_id = u.id
            ORDER BY s.created_at ASC
        `);

        res.status(200).json(result.recordset);

    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};


// Body : { action: 'valider' | 'rejeter' }
export const traiterDemande = async (req, res) => {
    const service_id = parseInt(req.params.id);
    const { action } = req.body;

    if (!action || !['valider', 'rejeter'].includes(action)) {
        return res.status(400).json({ message: 'L\'action doit être "valider" ou "rejeter".' });
    }

    try {
        const pool = await poolPromise;

        const svcRes = await pool.request()
            .input('id', service_id)
            .query(`
                SELECT s.id, s.name, s.event_id,
                       e.title AS event_title, e.organizer_id
                FROM Services s
                INNER JOIN Events e ON s.event_id = e.id
                WHERE s.id = @id
            `);

        if (!svcRes.recordset.length) {
            return res.status(404).json({ message: 'Service introuvable.' });
        }

        const svc = svcRes.recordset[0];
        await creerNotification(
            svc.organizer_id,
            action === 'valider' ? 'service_valide' : 'service_rejete',
            action === 'valider' ? 'Service validé' : 'Service rejeté',
            action === 'valider'
                ? `Votre demande « ${svc.name} » pour « ${svc.event_title} » a été validée.`
                : `Votre demande « ${svc.name} » pour « ${svc.event_title} » a été rejetée.`,
            svc.event_id
        );

        res.status(200).json({ message: `Service ${action === 'valider' ? 'validé' : 'rejeté'}.` });

    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};


export const getAllServices = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT s.*, e.title AS event_title
            FROM Services s
            INNER JOIN Events e ON s.event_id = e.id
            ORDER BY s.created_at DESC
        `);
        res.status(200).json(result.recordset);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};


export const getServicesByEvent = async (req, res) => {
    const event_id = parseInt(req.params.id);
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('event_id', event_id)
            .query(`SELECT * FROM Services WHERE event_id = @event_id ORDER BY created_at ASC`);
        res.status(200).json(result.recordset);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};