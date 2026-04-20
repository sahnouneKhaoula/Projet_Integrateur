import { poolPromise } from '../db/db.js';

// Récupérer toutes les factures
export const getAllInvoices = async (req, res) => {
    try {
        const pool = await poolPromise;
        const tableCheck = await pool.request().query(`
            SELECT CASE WHEN OBJECT_ID('dbo.InvoiceLines', 'U') IS NOT NULL THEN 1 ELSE 0 END AS has_lines
        `);
        const hasInvoiceLinesTable = Number(tableCheck.recordset[0]?.has_lines || 0) === 1;

        const result = await pool.request().query(`
            SELECT
                i.id,
                i.event_id,
                i.total,
                i.status,
                i.issued_date,
                e.title AS event_title,
                e.start_date AS event_start_date,
                e.end_date AS event_end_date,
                ISNULL((
                    SELECT SUM(s.price)
                    FROM Services s
                    WHERE s.event_id = i.event_id
                ), 0) AS services_total,
                ISNULL((
                    SELECT SUM(p.amount)
                    FROM Payments p
                    WHERE p.invoice_id = i.id
                ), 0) AS paid_total
            FROM Invoices i
            INNER JOIN Events e ON e.id = i.event_id
            ORDER BY i.issued_date DESC
        `);

        const linesByInvoice = new Map();
        if (hasInvoiceLinesTable) {
            const linesRes = await pool.request().query(`
                SELECT
                    il.id,
                    il.invoice_id,
                    il.source_type,
                    il.service_id,
                    il.label,
                    il.unit_price,
                    il.quantity,
                    il.line_total
                FROM InvoiceLines il
                ORDER BY il.invoice_id, il.id
            `);
            for (const line of linesRes.recordset) {
                const key = Number(line.invoice_id);
                if (!linesByInvoice.has(key)) linesByInvoice.set(key, []);
                linesByInvoice.get(key).push({
                    id: line.id,
                    source_type: line.source_type,
                    service_id: line.service_id,
                    label: line.label,
                    unit_price: Number(line.unit_price || 0),
                    quantity: Number(line.quantity || 1),
                    line_total: Number(line.line_total || 0),
                });
            }
        }

        const factures = result.recordset.map((row) => {
            const total = Number(row.total || 0);
            const paid = Number(row.paid_total || 0);
            const due = Math.max(0, total - paid);
            const computedStatus = paid >= total && total > 0
                ? 'paid'
                : paid > 0
                    ? 'partial'
                    : 'unpaid';

            return {
                ...row,
                due_amount: due,
                computed_status: computedStatus,
                lines: linesByInvoice.get(Number(row.id)) || [],
            };
        });

        res.status(200).json(factures);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

// Créer une facture
export const createInvoice = async (req, res) => {
    const { event_id, total, status, lines } = req.body;
    const eventId = Number(event_id);
    const totalInput = total !== undefined && total !== null && total !== '' ? Number(total) : null;
    const providedLines = Array.isArray(lines) ? lines : [];

    if (!Number.isInteger(eventId) || eventId <= 0) {
        return res.status(400).json({ message: "event_id invalide." });
    }

    if (totalInput !== null && (!Number.isFinite(totalInput) || totalInput < 0)) {
        return res.status(400).json({ message: "Le total doit être un nombre positif." });
    }

    try {
        const pool = await poolPromise;
        const tableCheck = await pool.request().query(`
            SELECT CASE WHEN OBJECT_ID('dbo.InvoiceLines', 'U') IS NOT NULL THEN 1 ELSE 0 END AS has_lines
        `);
        const hasInvoiceLinesTable = Number(tableCheck.recordset[0]?.has_lines || 0) === 1;

        const eventRes = await pool.request()
            .input('event_id', eventId)
            .query('SELECT id, title FROM Events WHERE id = @event_id');
        if (!eventRes.recordset.length) {
            return res.status(404).json({ message: "Événement introuvable." });
        }

        const existing = await pool.request()
            .input('event_id', eventId)
            .query('SELECT id FROM Invoices WHERE event_id = @event_id');
        if (existing.recordset.length) {
            return res.status(409).json({ message: "Une facture existe déjà pour cet événement." });
        }

        const servicesRes = await pool.request()
            .input('event_id', eventId)
            .query(`
                SELECT ISNULL(SUM(price), 0) AS services_total
                FROM Services
                WHERE event_id = @event_id
            `);

        const servicesTotal = Number(servicesRes.recordset[0]?.services_total || 0);
        const normalizedLines = providedLines
            .map((line) => {
                const sourceType = line?.source_type === 'extra' ? 'extra' : 'service';
                const label = String(line?.label || '').trim();
                const unitPrice = Number(line?.unit_price);
                const quantity = line?.quantity !== undefined ? Number(line.quantity) : 1;
                const serviceId = line?.service_id !== undefined && line?.service_id !== null ? Number(line.service_id) : null;

                return { sourceType, label, unitPrice, quantity, serviceId };
            })
            .filter((line) => line.label && Number.isFinite(line.unitPrice) && line.unitPrice >= 0 && Number.isFinite(line.quantity) && line.quantity > 0);

        if (providedLines.length > 0 && normalizedLines.length === 0) {
            return res.status(400).json({ message: "Les lignes de facture sont invalides." });
        }

        const linesTotal = normalizedLines.reduce((acc, line) => acc + (line.unitPrice * line.quantity), 0);
        const totalToSave = totalInput !== null ? totalInput : (normalizedLines.length ? linesTotal : servicesTotal);
        const statusToSave = status || (totalToSave > 0 ? 'unpaid' : 'paid');

        const insertRes = await pool.request()
            .input('event_id', eventId)
            .input('total', totalToSave)
            .input('status', statusToSave)
            .query(`
                INSERT INTO Invoices (event_id, total, status)
                OUTPUT INSERTED.id
                VALUES (@event_id, @total, @status)
            `);

        const invoiceId = insertRes.recordset[0].id;

        if (hasInvoiceLinesTable && normalizedLines.length > 0) {
            for (const line of normalizedLines) {
                await pool.request()
                    .input('invoice_id', invoiceId)
                    .input('source_type', line.sourceType)
                    .input('service_id', line.sourceType === 'service' ? line.serviceId : null)
                    .input('label', line.label)
                    .input('unit_price', line.unitPrice)
                    .input('quantity', line.quantity)
                    .query(`
                        INSERT INTO InvoiceLines (invoice_id, source_type, service_id, label, unit_price, quantity)
                        VALUES (@invoice_id, @source_type, @service_id, @label, @unit_price, @quantity)
                    `);
            }
        } else if (hasInvoiceLinesTable) {
            // Fallback: créer les lignes depuis les services de l'événement pour compatibilité.
            await pool.request()
                .input('invoice_id', invoiceId)
                .input('event_id', eventId)
                .query(`
                    INSERT INTO InvoiceLines (invoice_id, source_type, service_id, label, unit_price, quantity)
                    SELECT
                        @invoice_id,
                        'service',
                        s.id,
                        s.name,
                        s.price,
                        1
                    FROM Services s
                    WHERE s.event_id = @event_id
                `);
        }

        res.status(201).json({
            message: "Facture créée avec succès",
            invoice_id: invoiceId,
            event_id: eventId,
            event_title: eventRes.recordset[0].title,
            services_total: servicesTotal,
            total: totalToSave,
            status: statusToSave,
        });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la création", error: error.message });
    }
};

// Valider une facture brouillon
export const validateInvoice = async (req, res) => {
    const invoiceId = Number(req.params.id);
    if (!Number.isInteger(invoiceId) || invoiceId <= 0) {
        return res.status(400).json({ message: "ID facture invalide." });
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

        const invoice = invoiceRes.recordset[0];
        if (invoice.status !== 'draft') {
            return res.status(400).json({ message: "Seules les factures en brouillon peuvent être validées." });
        }

        const total = Number(invoice.total || 0);
        const newStatus = total > 0 ? 'unpaid' : 'paid';

        await pool.request()
            .input('invoice_id', invoiceId)
            .input('status', newStatus)
            .query(`
                UPDATE Invoices
                SET status = @status
                WHERE id = @invoice_id
            `);

        return res.status(200).json({
            message: "Facture validée avec succès.",
            invoice_id: invoiceId,
            status: newStatus,
        });
    } catch (error) {
        return res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};
