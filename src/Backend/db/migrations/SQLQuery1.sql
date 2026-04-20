USE HotelEventsDB;
GO

/* ============================================================
   MIGRATION: Ajout des lignes de facture (InvoiceLines)
   Objectif:
   - stocker les lignes exactes validées (services + autres frais)
   - permettre impression fidèle et historique fiable
   ============================================================ */

/* 1) Créer la table InvoiceLines si absente */
IF OBJECT_ID('dbo.InvoiceLines', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.InvoiceLines (
        id INT IDENTITY(1,1) PRIMARY KEY,
        invoice_id INT NOT NULL,
        source_type NVARCHAR(20) NOT NULL,      -- 'service' | 'extra'
        service_id INT NULL,                    -- renseigné si source_type='service'
        label NVARCHAR(255) NOT NULL,           -- libellé affiché sur facture
        unit_price DECIMAL(12,2) NOT NULL,      -- prix unitaire
        quantity DECIMAL(12,2) NOT NULL DEFAULT 1,
        line_total AS (unit_price * quantity) PERSISTED,
        created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

        CONSTRAINT FK_InvoiceLine_Invoice
            FOREIGN KEY (invoice_id) REFERENCES dbo.Invoices(id),

        CONSTRAINT FK_InvoiceLine_Service
            FOREIGN KEY (service_id) REFERENCES dbo.Services(id),

        CONSTRAINT CK_InvoiceLine_SourceType
            CHECK (source_type IN ('service', 'extra')),

        CONSTRAINT CK_InvoiceLine_UnitPrice
            CHECK (unit_price >= 0),

        CONSTRAINT CK_InvoiceLine_Quantity
            CHECK (quantity > 0),

        -- Un service ne doit apparaître qu'une seule fois par facture
        CONSTRAINT UQ_InvoiceLine_Invoice_Service UNIQUE (invoice_id, service_id)
    );
END
GO

/* 2) Index utiles */
IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_InvoiceLines_invoice_id'
      AND object_id = OBJECT_ID('dbo.InvoiceLines')
)
BEGIN
    CREATE INDEX IX_InvoiceLines_invoice_id
        ON dbo.InvoiceLines(invoice_id);
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_InvoiceLines_service_id'
      AND object_id = OBJECT_ID('dbo.InvoiceLines')
)
BEGIN
    CREATE INDEX IX_InvoiceLines_service_id
        ON dbo.InvoiceLines(service_id);
END
GO

/* 3) Backfill minimal pour les anciennes factures:
      - insérer les services de l’événement comme lignes "service"
      - uniquement si la facture n’a encore aucune ligne
*/
INSERT INTO dbo.InvoiceLines (invoice_id, source_type, service_id, label, unit_price, quantity)
SELECT
    i.id AS invoice_id,
    'service' AS source_type,
    s.id AS service_id,
    s.name AS label,
    CAST(s.price AS DECIMAL(12,2)) AS unit_price,
    CAST(1 AS DECIMAL(12,2)) AS quantity
FROM dbo.Invoices i
INNER JOIN dbo.Services s
    ON s.event_id = i.event_id
WHERE NOT EXISTS (
    SELECT 1
    FROM dbo.InvoiceLines il
    WHERE il.invoice_id = i.id
)
AND NOT EXISTS (
    SELECT 1
    FROM dbo.InvoiceLines il2
    WHERE il2.invoice_id = i.id
      AND il2.service_id = s.id
);
GO

/* 4) (Optionnel mais recommandé) vue de lecture rapide */
IF OBJECT_ID('dbo.vw_InvoiceSummary', 'V') IS NOT NULL
BEGIN
    DROP VIEW dbo.vw_InvoiceSummary;
END
GO

CREATE VIEW dbo.vw_InvoiceSummary AS
SELECT
    i.id,
    i.event_id,
    i.total,
    i.status,
    i.issued_date,
    e.title AS event_title,
    ISNULL(SUM(il.line_total), 0) AS lines_total
FROM dbo.Invoices i
INNER JOIN dbo.Events e ON e.id = i.event_id
LEFT JOIN dbo.InvoiceLines il ON il.invoice_id = i.id
GROUP BY
    i.id, i.event_id, i.total, i.status, i.issued_date, e.title;
GO