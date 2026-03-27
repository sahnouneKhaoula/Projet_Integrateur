/** Enregistrement des paiements (liés aux factures). */
import { poolPromise } from '../db/db.js';

// Récupérer tous les paiements
export const getAllPayments = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Payments');
        res.status(200).json(result.recordset);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

// Ajouter un paiement
export const createPayment = async (req, res) => {
    const { invoice_id, amount, paid_at, method } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('invoice_id', invoice_id)
            .input('amount', amount)
            .input('paid_at', paid_at)
            .input('method', method)
            .query(`INSERT INTO Payments (invoice_id, amount, paid_at, method) 
                    VALUES (@invoice_id, @amount, @paid_at, @method)`);
        res.status(201).json({ message: "Paiement ajouté avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la création", error: error.message });
    }
};
