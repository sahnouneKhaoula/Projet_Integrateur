USE HotelEventsDB;
GO


/* 1) expected_guests dans Events */
IF COL_LENGTH('dbo.Events', 'expected_guests') IS NULL
BEGIN
    ALTER TABLE dbo.Events ADD expected_guests INT NULL;
END
GO

/* 2) Nettoyage prealable des doublons de Reservations (si existants)
   On garde la reservation la plus recente (id max) pour chaque event_id */
;WITH doublons AS (
    SELECT
        id,
        event_id,
        ROW_NUMBER() OVER (PARTITION BY event_id ORDER BY id DESC) AS rn
    FROM dbo.Reservations
)
DELETE FROM doublons
WHERE rn > 1;
GO

/* 3) Unicite: une reservation max par event */
IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'UX_Reservations_event_id'
      AND object_id = OBJECT_ID('dbo.Reservations')
)
BEGIN
    CREATE UNIQUE INDEX UX_Reservations_event_id
        ON dbo.Reservations(event_id);
END
GO

/* 4) Index optimisation conflits de salle (Events) */
IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_Events_room_dates_status'
      AND object_id = OBJECT_ID('dbo.Events')
)
BEGIN
    CREATE INDEX IX_Events_room_dates_status
        ON dbo.Events(room_id, start_date, end_date, status);
END
GO

/* 5) Index optimisation vue Reservations */
IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_Reservations_room_dates_status'
      AND object_id = OBJECT_ID('dbo.Reservations')
)
BEGIN
    CREATE INDEX IX_Reservations_room_dates_status
        ON dbo.Reservations(room_id, reserved_from, reserved_to, status);
END
GO

/* 6) Contrainte de statut Reservations (si absente) */
IF NOT EXISTS (
    SELECT 1
    FROM sys.check_constraints
    WHERE name = 'CK_Reservations_Status'
      AND parent_object_id = OBJECT_ID('dbo.Reservations')
)
BEGIN
    ALTER TABLE dbo.Reservations
    ADD CONSTRAINT CK_Reservations_Status
        CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled'));
END
GO

ALTER TABLE Events ADD expected_guests INT NULL;