import { poolPromise } from '../db/db.js';

// Récupérer tous les paiements
export const getAllPayments = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT
                p.id,
                p.invoice_id,
                p.amount,
                p.paid_at,
                p.method,
                i.event_id,
                i.total AS invoice_total,
                e.title AS event_title
            FROM Payments p
            INNER JOIN Invoices i ON i.id = p.invoice_id
            INNER JOIN Events e ON e.id = i.event_id
            ORDER BY p.paid_at DESC, p.id DESC
        `);
        res.status(200).json(result.recordset);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

// Ajouter un paiement
export const createPayment = async (req, res) => {
    const { invoice_id, amount, paid_at, method } = req.body;
    const invoiceId = Number(invoice_id);
    const amountValue = Number(amount);

    if (!Number.isInteger(invoiceId) || invoiceId <= 0) {
        return res.status(400).json({ message: "invoice_id invalide." });
    }
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
        return res.status(400).json({ message: "Le montant doit être supérieur à 0." });
    }

    try {
        const pool = await poolPromise;

        const invoiceRes = await pool.request()
            .input('invoice_id', invoiceId)
            .query(`
                SELECT id, total, status
                FROM Invoices
                WHERE id = @invoice_id
            `);
        if (!invoiceRes.recordset.length) {
            return res.status(404).json({ message: "Facture introuvable." });
        }
        if (invoiceRes.recordset[0].status === 'draft') {
            return res.status(400).json({ message: "Paiement interdit: cette facture est encore en brouillon." });
        }

        const paidAtValue = paid_at ? new Date(paid_at) : new Date();

        await pool.request()
            .input('invoice_id', invoiceId)
            .input('amount', amountValue)
            .input('paid_at', paidAtValue)
            .input('method', method || null)
            .query(`
                INSERT INTO Payments (invoice_id, amount, paid_at, method)
                VALUES (@invoice_id, @amount, @paid_at, @method)
            `);

        const totalsRes = await pool.request()
            .input('invoice_id', invoiceId)
            .query(`
                SELECT
                    i.total,
                    ISNULL(SUM(p.amount), 0) AS paid_total
                FROM Invoices i
                LEFT JOIN Payments p ON p.invoice_id = i.id
                WHERE i.id = @invoice_id
                GROUP BY i.total
            `);

        const total = Number(totalsRes.recordset[0]?.total || 0);
        const paidTotal = Number(totalsRes.recordset[0]?.paid_total || 0);

        let status = 'unpaid';
        if (paidTotal >= total && total > 0) status = 'paid';
        else if (paidTotal > 0) status = 'partial';

        await pool.request()
            .input('invoice_id', invoiceId)
            .input('status', status)
            .query(`
                UPDATE Invoices
                SET status = @status
                WHERE id = @invoice_id
            `);

        res.status(201).json({
            message: "Paiement ajouté avec succès",
            invoice_id: invoiceId,
            paid_total: paidTotal,
            invoice_total: total,
            status,
        });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la création", error: error.message });
    }
};
