/** Factures (montants, statuts) liées au flux métier événement / réservation. */
import { poolPromise } from '../db/db.js';

// Récupérer toutes les factures
export const getAllInvoices = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Invoices');
        res.status(200).json(result.recordset);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

// Créer une facture
export const createInvoice = async (req, res) => {
    const { event_id, total, status } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('event_id', event_id)
            .input('total', total || 0)
            .input('status', status || 'unpaid')
            .query(`INSERT INTO Invoices (event_id, total, status) 
                    VALUES (@event_id, @total, @status)`);
        res.status(201).json({ message: "Facture créée avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la création", error: error.message });
    }
};
