import { poolPromise } from '../db/db.js';

// Récupérer tous les invités
export const getAllGuests = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT
                g.id,
                g.full_name,
                g.email,
                g.phone,
                g.created_at,
                eg.event_id
            FROM Guests g
            INNER JOIN EventGuests eg ON eg.guest_id = g.id
            ORDER BY g.created_at DESC
        `);
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
        if (!event_id || !full_name) {
            return res.status(400).json({ message: "event_id et full_name sont obligatoires." });
        }

        // Vérifier que l'événement existe
        const eventRes = await pool.request()
            .input('event_id', parseInt(event_id, 10))
            .query('SELECT id FROM Events WHERE id = @event_id');
        if (eventRes.recordset.length === 0) {
            return res.status(404).json({ message: "Événement introuvable." });
        }

        // Réutiliser un invité existant si trouvé (priorité email, sinon nom+téléphone)
        let guestId = null;
        if (email) {
            const existingByEmail = await pool.request()
                .input('email', email)
                .query('SELECT TOP 1 id FROM Guests WHERE email = @email ORDER BY id DESC');
            if (existingByEmail.recordset.length > 0) guestId = existingByEmail.recordset[0].id;
        }

        if (!guestId) {
            const existingByNamePhone = await pool.request()
                .input('full_name', full_name)
                .input('phone', phone || null)
                .query(`
                    SELECT TOP 1 id
                    FROM Guests
                    WHERE full_name = @full_name
                      AND ((phone IS NULL AND @phone IS NULL) OR phone = @phone)
                    ORDER BY id DESC
                `);
            if (existingByNamePhone.recordset.length > 0) guestId = existingByNamePhone.recordset[0].id;
        }

        if (!guestId) {
            const insertGuest = await pool.request()
                .input('full_name', full_name)
                .input('email', email || null)
                .input('phone', phone || null)
                .query(`
                    INSERT INTO Guests (full_name, email, phone)
                    OUTPUT INSERTED.id
                    VALUES (@full_name, @email, @phone)
                `);
            guestId = insertGuest.recordset[0].id;
        }

        // Lier l'invité à l'événement sans dupliquer le lien
        await pool.request()
            .input('event_id', parseInt(event_id, 10))
            .input('guest_id', parseInt(guestId, 10))
            .query(`
                IF NOT EXISTS (
                    SELECT 1 FROM EventGuests
                    WHERE event_id = @event_id AND guest_id = @guest_id
                )
                BEGIN
                    INSERT INTO EventGuests (event_id, guest_id)
                    VALUES (@event_id, @guest_id)
                END
            `);

        res.status(201).json({ message: "Invité associé à l'événement avec succès", guest_id: guestId });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la création", error: error.message });
    }
};
