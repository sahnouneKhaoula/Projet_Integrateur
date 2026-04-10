import { poolPromise } from '../db/db.js';

// Statistiques globales pour le tableau de bord
export const getStats = async (req, res) => {
    try {
        const pool = await poolPromise;

        // Nb total d'utilisateurs (comptes clients inscrits)
        const clients = await pool.request().query(`
            SELECT COUNT(*) as nb FROM Users u
            JOIN Roles r ON u.role_id = r.id
            WHERE r.name = 'client'
        `);

        // Nb total d'utilisateurs Staff (tous sauf client)
        const staff = await pool.request().query(`
            SELECT COUNT(*) as nb FROM Users u
            JOIN Roles r ON u.role_id = r.id
            WHERE r.name != 'client'
        `);

        // Nb total d'événements
        const totalEvents = await pool.request().query(`
            SELECT COUNT(*) as nb FROM Events
        `);

        // Nb d'événements ce mois-ci
        const eventsCeMois = await pool.request().query(`
            SELECT COUNT(*) as nb FROM Events
            WHERE MONTH(start_date) = MONTH(GETDATE())
            AND YEAR(start_date) = YEAR(GETDATE())
        `);

        // Nb de réservations (d'événements)
        const totalReservations = await pool.request().query(`
            SELECT COUNT(*) as nb FROM Reservations
        `);

        // Prochains événements (5 prochains)
        const prochains = await pool.request().query(`
            SELECT TOP 5
                e.id,
                e.title,
                e.start_date,
                e.end_date,
                e.status,
                s.name as salle_nom,
                u.first_name + ' ' + u.last_name as organisateur,
                (SELECT COUNT(*) FROM EventGuests eg WHERE eg.event_id = e.id) as nb_invites
            FROM Events e
            LEFT JOIN Salles s ON e.room_id = s.id
            LEFT JOIN Users u ON e.organizer_id = u.id
            WHERE e.start_date >= GETDATE()
            ORDER BY e.start_date ASC
        `);

        // Derniers événements (liste complète récente)
        const recents = await pool.request().query(`
            SELECT TOP 8
                e.id,
                e.title,
                e.start_date,
                e.end_date,
                e.status,
                s.name as salle_nom,
                u.first_name + ' ' + u.last_name as organisateur,
                (SELECT COUNT(*) FROM EventGuests eg WHERE eg.event_id = e.id) as nb_invites
            FROM Events e
            LEFT JOIN Salles s ON e.room_id = s.id
            LEFT JOIN Users u ON e.organizer_id = u.id
            ORDER BY e.created_at DESC
        `);

        // Nb de Salles disponibles
        const salles = await pool.request().query(`SELECT COUNT(*) as nb FROM Salles`);

        res.status(200).json({
            stats: {
                nb_clients: clients.recordset[0].nb,
                nb_staff: staff.recordset[0].nb,
                nb_events_total: totalEvents.recordset[0].nb,
                nb_events_ce_mois: eventsCeMois.recordset[0].nb,
                nb_reservations: totalReservations.recordset[0].nb,
                nb_salles: salles.recordset[0].nb,
            },
            evenements_prochains: prochains.recordset,
            evenements_recents: recents.recordset,
        });
    } catch (error) {
        console.error('Erreur stats:', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};
