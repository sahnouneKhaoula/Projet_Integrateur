import { poolPromise } from '../db/db.js';
import * as XLSX from 'xlsx';

// ─── UTILITAIRES ────────────────────────────────────────────────

// Lit un fichier Excel (base64) ou CSV (texte) et retourne les lignes
const parseInput = (fileContent, csvContent) => {
    if (fileContent) {
        // Fichier Excel envoyé en base64
        const buffer = Buffer.from(fileContent, 'base64');
        const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        // Normaliser les clés (trim + lowercase)
        return rows.map(row =>
            Object.fromEntries(Object.entries(row).map(([k, v]) => [k.trim(), String(v ?? '').trim()]))
        ).filter(row => Object.values(row).some(v => v !== ''));
    }
    if (csvContent) {
        const lines = csvContent.trim().split(/\r?\n/);
        if (lines.length < 2) return [];
        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        return lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
            return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']));
        }).filter(row => Object.values(row).some(v => v !== ''));
    }
    return [];
};

const buildCSV = (headers, rows) => {
    const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const headerLine = headers.map(escape).join(',');
    const dataLines = rows.map(row => headers.map(h => escape(row[h])).join(','));
    return [headerLine, ...dataLines].join('\r\n');
};


// ─── IMPORT ─────────────────────────────────────────────────────

// POST /api/import/events
// Colonnes FR : titre, description, email_organisateur, date_debut, date_fin, nom_salle, statut
export const importEvents = async (req, res) => {
    const { csvContent, fileContent } = req.body;
    if (!csvContent && !fileContent) return res.status(400).json({ message: 'Contenu manquant (CSV ou Excel).' });

    const rows = parseInput(fileContent, csvContent);
    if (rows.length === 0) return res.status(400).json({ message: 'Aucune ligne valide trouvée.' });

    const pool = await poolPromise;
    const erreurs = [];
    let inseres = 0;

    for (const [i, row] of rows.entries()) {
        const lineNum = i + 2;
        // Accepter colonnes FR ou EN
        const titre       = row.titre       || row.title;
        const description = row.description;
        const orgEmail    = row.email_organisateur || row.organizer_email;
        const dateDebut   = row.date_debut  || row.start_date;
        const dateFin     = row.date_fin    || row.end_date;
        const nomSalle    = row.nom_salle   || row.salle_name;
        const statut      = row.statut      || row.status;

        if (!titre || !dateDebut || !dateFin) {
            erreurs.push(`Ligne ${lineNum} : champs obligatoires manquants (titre, date_debut, date_fin).`);
            continue;
        }

        try {
            let organizer_id = 1;
            if (orgEmail) {
                const orgRes = await pool.request()
                    .input('email', orgEmail)
                    .query('SELECT id FROM Users WHERE email = @email');
                if (orgRes.recordset.length === 0) {
                    erreurs.push(`Ligne ${lineNum} : organisateur "${orgEmail}" introuvable.`);
                    continue;
                }
                organizer_id = orgRes.recordset[0].id;
            }

            let room_id = null;
            if (nomSalle) {
                const salleRes = await pool.request()
                    .input('name', nomSalle)
                    .query('SELECT id FROM Salles WHERE name = @name');
                if (salleRes.recordset.length > 0) room_id = salleRes.recordset[0].id;
            }

            await pool.request()
                .input('title', titre)
                .input('description', description || null)
                .input('organizer_id', organizer_id)
                .input('start_date', new Date(dateDebut))
                .input('end_date', new Date(dateFin))
                .input('room_id', room_id)
                .input('status', statut || 'planned')
                .query(`INSERT INTO Events (title, description, organizer_id, start_date, end_date, room_id, status)
                        VALUES (@title, @description, @organizer_id, @start_date, @end_date, @room_id, @status)`);
            inseres++;
        } catch (err) {
            erreurs.push(`Ligne ${lineNum} : ${err.message}`);
        }
    }

    res.status(200).json({
        message: `Import terminé : ${inseres} événement(s) importé(s) sur ${rows.length}.`,
        inseres,
        total: rows.length,
        erreurs,
    });
};

// POST /api/import/salles
// Colonnes FR : nom, capacite, emplacement
export const importSalles = async (req, res) => {
    const { csvContent, fileContent } = req.body;
    if (!csvContent && !fileContent) return res.status(400).json({ message: 'Contenu manquant (CSV ou Excel).' });

    const rows = parseInput(fileContent, csvContent);
    if (rows.length === 0) return res.status(400).json({ message: 'Aucune ligne valide.' });

    const pool = await poolPromise;
    const erreurs = [];
    let inseres = 0;

    for (const [i, row] of rows.entries()) {
        const lineNum = i + 2;
        const nom       = row.nom       || row.name;
        const capacite  = row.capacite  || row.capacity;
        const emplacement = row.emplacement || row.location;

        if (!nom || !capacite) {
            erreurs.push(`Ligne ${lineNum} : nom et capacite sont obligatoires.`);
            continue;
        }
        try {
            await pool.request()
                .input('name', nom)
                .input('capacity', parseInt(capacite))
                .input('location', emplacement || null)
                .query('INSERT INTO Salles (name, capacity, location) VALUES (@name, @capacity, @location)');
            inseres++;
        } catch (err) {
            erreurs.push(`Ligne ${lineNum} : ${err.message}`);
        }
    }

    res.status(200).json({ message: `${inseres} salle(s) importée(s) sur ${rows.length}.`, inseres, total: rows.length, erreurs });
};

// POST /api/import/guests
// Colonnes FR : id_evenement, nom_complet, email, telephone
export const importGuests = async (req, res) => {
    const { csvContent, fileContent } = req.body;
    if (!csvContent && !fileContent) return res.status(400).json({ message: 'Contenu manquant (CSV ou Excel).' });

    const rows = parseInput(fileContent, csvContent);
    if (rows.length === 0) return res.status(400).json({ message: 'Aucune ligne valide.' });

    const pool = await poolPromise;
    const erreurs = [];
    let inseres = 0;

    for (const [i, row] of rows.entries()) {
        const lineNum = i + 2;
        const idEvenement = row.id_evenement || row.event_id;
        const nomComplet  = row.nom_complet  || row.full_name;
        const email       = row.email;
        const telephone   = row.telephone    || row.phone;

        if (!idEvenement || !nomComplet) {
            erreurs.push(`Ligne ${lineNum} : id_evenement et nom_complet sont obligatoires.`);
            continue;
        }
        try {
            await pool.request()
                .input('event_id', parseInt(idEvenement))
                .input('full_name', nomComplet)
                .input('email', email || null)
                .input('phone', telephone || null)
                .query('INSERT INTO Guests (event_id, full_name, email, phone) VALUES (@event_id, @full_name, @email, @phone)');
            inseres++;
        } catch (err) {
            erreurs.push(`Ligne ${lineNum} : ${err.message}`);
        }
    }

    res.status(200).json({ message: `${inseres} invité(s) importé(s) sur ${rows.length}.`, inseres, total: rows.length, erreurs });
};

// ─── EXPORT ─────────────────────────────────────────────────────

// GET /api/export/events
export const exportEvents = async (req, res) => {
    const pool = await poolPromise;
    const result = await pool.request().query(`
        SELECT e.id, e.title, e.description,
               u.email as organizer_email,
               e.start_date, e.end_date,
               s.name as salle_name,
               e.status, e.created_at
        FROM Events e
        LEFT JOIN Users u ON e.organizer_id = u.id
        LEFT JOIN Salles s ON e.room_id = s.id
        ORDER BY e.start_date DESC
    `);
    const headers = ['id', 'title', 'description', 'organizer_email', 'start_date', 'end_date', 'salle_name', 'status', 'created_at'];
    const csv = buildCSV(headers, result.recordset);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="events.csv"');
    res.send('\uFEFF' + csv); // BOM pour UTF-8 (Excel)
};

// GET /api/export/users
export const exportUsers = async (req, res) => {
    const pool = await poolPromise;
    const result = await pool.request().query(`
        SELECT u.id, u.first_name, u.last_name, u.email, u.phone,
               r.name as role, u.is_active, u.created_at
        FROM Users u
        JOIN Roles r ON u.role_id = r.id
        ORDER BY u.created_at DESC
    `);
    const headers = ['id', 'first_name', 'last_name', 'email', 'phone', 'role', 'is_active', 'created_at'];
    const csv = buildCSV(headers, result.recordset);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="users.csv"');
    res.send('\uFEFF' + csv);
};

// GET /api/export/salles
export const exportSalles = async (req, res) => {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT id, name, capacity, location FROM Salles ORDER BY name');
    const headers = ['id', 'name', 'capacity', 'location'];
    const csv = buildCSV(headers, result.recordset);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="salles.csv"');
    res.send('\uFEFF' + csv);
};

// GET /api/export/guests
export const exportGuests = async (req, res) => {
    const pool = await poolPromise;
    const result = await pool.request().query(`
        SELECT g.id, g.full_name, g.email, g.phone,
               e.title as event_title, g.event_id, g.created_at
        FROM Guests g
        JOIN Events e ON g.event_id = e.id
        ORDER BY g.created_at DESC
    `);
    const headers = ['id', 'full_name', 'email', 'phone', 'event_title', 'event_id', 'created_at'];
    const csv = buildCSV(headers, result.recordset);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="guests.csv"');
    res.send('\uFEFF' + csv);
};

// ─── TEMPLATES CSV ───────────────────────────────────────────────

export const templateEvents = (_req, res) => {
    const csv = `"titre","description","email_organisateur","date_debut","date_fin","nom_salle","statut"\r\n`
        + `"Gala de charité","Description de l'événement","admin@lapromenade.ca","2026-04-01 18:00","2026-04-01 23:00","Grande Salle","planned"\r\n`
        + `"Conférence Annuelle","","admin@lapromenade.ca","2026-05-10 09:00","2026-05-10 17:00","Salle Bellevue","planned"`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="template_events.csv"');
    res.send('\uFEFF' + csv);
};

export const templateSalles = (_req, res) => {
    const csv = `"nom","capacite","emplacement"\r\n"Grande Salle","200","Rez-de-chaussée"\r\n"Salle Bellevue","80","1er étage"`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="template_salles.csv"');
    res.send('\uFEFF' + csv);
};

export const templateGuests = (_req, res) => {
    const csv = `"id_evenement","nom_complet","email","telephone"\r\n"1","Marie Tremblay","marie@exemple.ca","514-555-0100"\r\n"1","Jean Dupont","jean@exemple.ca",""`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="template_guests.csv"');
    res.send('\uFEFF' + csv);
};
