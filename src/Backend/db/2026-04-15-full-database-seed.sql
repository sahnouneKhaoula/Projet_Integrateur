/*
  Données de démonstration (seed) pour HotelEventsDB
  Prérequis :
  1) Exécuter 2026-04-15-full-database-create.sql (ou schema.sql équivalent)
  2) Créer au moins un utilisateur (recommandé : node Backend/seed.js pour admin + client avec mots de passe hashés bcrypt)
  Puis exécuter ce script.
*/

USE HotelEventsDB;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Users)
BEGIN
    RAISERROR('Aucun utilisateur trouvé. Lancez d''abord : cd Backend && node seed.js', 16, 1);
    RETURN;
END
GO

DECLARE @organizerId INT = (SELECT TOP 1 id FROM dbo.Users ORDER BY id);
DECLARE @adminId INT = (SELECT id FROM dbo.Users WHERE email = 'admin@lapromenade.ca');
IF @adminId IS NULL SET @adminId = @organizerId;

/* ---------- Rôles (idempotent) ---------- */
IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE name = 'admin') INSERT INTO dbo.Roles(name) VALUES ('admin');
IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE name = 'comptabilite') INSERT INTO dbo.Roles(name) VALUES ('comptabilite');
IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE name = 'organisateur') INSERT INTO dbo.Roles(name) VALUES ('organisateur');
IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE name = 'coordonnateur') INSERT INTO dbo.Roles(name) VALUES ('coordonnateur');
IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE name = 'client') INSERT INTO dbo.Roles(name) VALUES ('client');
GO

DECLARE @organizerId INT = (SELECT TOP 1 id FROM dbo.Users ORDER BY id);
DECLARE @adminId INT = (SELECT id FROM dbo.Users WHERE email = 'admin@lapromenade.ca');
IF @adminId IS NULL SET @adminId = @organizerId;

/* ---------- Salles ---------- */
IF NOT EXISTS (SELECT 1 FROM dbo.Salles WHERE name = N'Salle Atlas')
    INSERT INTO dbo.Salles(name, capacity, location) VALUES (N'Salle Atlas', 120, N'RDC');

IF NOT EXISTS (SELECT 1 FROM dbo.Salles WHERE name = N'Salle Cedre')
    INSERT INTO dbo.Salles(name, capacity, location) VALUES (N'Salle Cedre', 80, N'1er étage');

DECLARE @salleAtlas INT = (SELECT id FROM dbo.Salles WHERE name = N'Salle Atlas');
DECLARE @salleCedre INT = (SELECT id FROM dbo.Salles WHERE name = N'Salle Cedre');

/* ---------- Événements ---------- */
IF NOT EXISTS (SELECT 1 FROM dbo.Events WHERE title = N'test event')
    INSERT INTO dbo.Events(title, description, organizer_id, start_date, end_date, room_id, expected_guests, status)
    VALUES (
        N'test event',
        N'Événement de démonstration',
        @organizerId,
        DATEADD(DAY, 3, SYSUTCDATETIME()),
        DATEADD(HOUR, 4, DATEADD(DAY, 3, SYSUTCDATETIME())),
        @salleAtlas,
        75,
        N'planned'
    );

IF NOT EXISTS (SELECT 1 FROM dbo.Events WHERE title = N'test réservation')
    INSERT INTO dbo.Events(title, description, organizer_id, start_date, end_date, room_id, expected_guests, status)
    VALUES (
        N'test réservation',
        N'Réservation de démonstration',
        @organizerId,
        DATEADD(DAY, 5, SYSUTCDATETIME()),
        DATEADD(HOUR, 3, DATEADD(DAY, 5, SYSUTCDATETIME())),
        @salleCedre,
        50,
        N'planned'
    );

DECLARE @evTest INT = (SELECT id FROM dbo.Events WHERE title = N'test event');
DECLARE @evResa INT = (SELECT id FROM dbo.Events WHERE title = N'test réservation');

/* ---------- Réservations ---------- */
IF @evTest IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.Reservations WHERE event_id = @evTest)
    INSERT INTO dbo.Reservations(event_id, room_id, reserved_from, reserved_to, status)
    SELECT @evTest, room_id, start_date, end_date, N'confirmed' FROM dbo.Events WHERE id = @evTest;

IF @evResa IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.Reservations WHERE event_id = @evResa)
    INSERT INTO dbo.Reservations(event_id, room_id, reserved_from, reserved_to, status)
    SELECT @evResa, room_id, start_date, end_date, N'confirmed' FROM dbo.Events WHERE id = @evResa;

/* ---------- Services ---------- */
IF @evTest IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.Services WHERE event_id = @evTest AND name = N'Nettoyage post-événement')
    INSERT INTO dbo.Services(event_id, name, price, status) VALUES (@evTest, N'Nettoyage post-événement', 180.00, N'pending');

IF @evTest IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.Services WHERE event_id = @evTest AND name = N'Transport / navette')
    INSERT INTO dbo.Services(event_id, name, price, status) VALUES (@evTest, N'Transport / navette', 150.00, N'pending');

DECLARE @svcNettoyage INT = (SELECT id FROM dbo.Services WHERE event_id = @evTest AND name = N'Nettoyage post-événement');
DECLARE @svcTransport INT = (SELECT id FROM dbo.Services WHERE event_id = @evTest AND name = N'Transport / navette');

/* ---------- Invités + liaison ---------- */
IF NOT EXISTS (SELECT 1 FROM dbo.Guests WHERE email = N'sara.benali@mail.com')
    INSERT INTO dbo.Guests(full_name, email, phone) VALUES (N'Sara Benali', N'sara.benali@mail.com', N'+212600112233');

DECLARE @g1 INT = (SELECT id FROM dbo.Guests WHERE email = N'sara.benali@mail.com');

IF @evTest IS NOT NULL AND @g1 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.EventGuests WHERE event_id = @evTest AND guest_id = @g1)
    INSERT INTO dbo.EventGuests(event_id, guest_id) VALUES (@evTest, @g1);

/* ---------- Factures ---------- */
IF @evTest IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.Invoices WHERE event_id = @evTest)
    INSERT INTO dbo.Invoices(event_id, total, status) VALUES (@evTest, 330.00, N'unpaid');

IF @evResa IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.Invoices WHERE event_id = @evResa)
    INSERT INTO dbo.Invoices(event_id, total, status) VALUES (@evResa, 79.00, N'draft');

DECLARE @invTest INT = (SELECT id FROM dbo.Invoices WHERE event_id = @evTest);
DECLARE @invResa INT = (SELECT id FROM dbo.Invoices WHERE event_id = @evResa);

IF OBJECT_ID('dbo.InvoiceLines', 'U') IS NOT NULL
BEGIN
    IF @invTest IS NOT NULL AND @svcNettoyage IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.InvoiceLines WHERE invoice_id = @invTest AND label = N'Nettoyage post-événement')
        INSERT INTO dbo.InvoiceLines(invoice_id, source_type, service_id, label, unit_price, quantity)
        VALUES (@invTest, N'service', @svcNettoyage, N'Nettoyage post-événement', 180.00, 1);

    IF @invTest IS NOT NULL AND @svcTransport IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.InvoiceLines WHERE invoice_id = @invTest AND label = N'Transport / navette')
        INSERT INTO dbo.InvoiceLines(invoice_id, source_type, service_id, label, unit_price, quantity)
        VALUES (@invTest, N'service', @svcTransport, N'Transport / navette', 150.00, 1);

    IF @invResa IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.InvoiceLines WHERE invoice_id = @invResa AND label = N'Frais divers')
        INSERT INTO dbo.InvoiceLines(invoice_id, source_type, service_id, label, unit_price, quantity)
        VALUES (@invResa, N'extra', NULL, N'Frais divers', 79.00, 1);
END

/* ---------- Notification exemple ---------- */
IF @adminId IS NOT NULL AND @evTest IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM dbo.Notifications WHERE user_id = @adminId AND event_id = @evTest AND type = N'event_pending'
)
    INSERT INTO dbo.Notifications(user_id, type, title, message, event_id, is_read)
    VALUES (@adminId, N'event_pending', N'Événement en attente', N'Exemple de notification liée à un événement.', @evTest, 0);

PRINT N'Seed terminé.';
GO
