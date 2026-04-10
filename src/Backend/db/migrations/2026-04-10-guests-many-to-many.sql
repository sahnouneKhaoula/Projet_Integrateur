USE HotelEventsDB;
GO


/* 1) Créer la table de liaison si absente */
IF OBJECT_ID('dbo.EventGuests', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.EventGuests (
        id INT IDENTITY(1,1) PRIMARY KEY,
        event_id INT NOT NULL,
        guest_id INT NOT NULL,
        created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_EventGuest_Event FOREIGN KEY (event_id) REFERENCES dbo.Events(id),
        CONSTRAINT FK_EventGuest_Guest FOREIGN KEY (guest_id) REFERENCES dbo.Guests(id),
        CONSTRAINT UQ_EventGuest UNIQUE (event_id, guest_id)
    );
END
GO

/* 2) Migrer les liaisons existantes Guests.event_id -> EventGuests */
IF COL_LENGTH('dbo.Guests', 'event_id') IS NOT NULL
BEGIN
    INSERT INTO dbo.EventGuests (event_id, guest_id)
    SELECT DISTINCT g.event_id, g.id
    FROM dbo.Guests g
    WHERE g.event_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1
        FROM dbo.EventGuests eg
        WHERE eg.event_id = g.event_id
          AND eg.guest_id = g.id
      );
END
GO

/* 3) Supprimer FK Guests -> Events si elle existe */
IF EXISTS (
    SELECT 1 FROM sys.foreign_keys
    WHERE name = 'FK_Guest_Event'
      AND parent_object_id = OBJECT_ID('dbo.Guests')
)
BEGIN
    ALTER TABLE dbo.Guests DROP CONSTRAINT FK_Guest_Event;
END
GO

/* 4) Rendre event_id nullable pour compatibilité progressive */
IF COL_LENGTH('dbo.Guests', 'event_id') IS NOT NULL
BEGIN
    ALTER TABLE dbo.Guests ALTER COLUMN event_id INT NULL;
END
GO

/* 5) Index utiles */
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'IX_EventGuests_event_id'
      AND object_id = OBJECT_ID('dbo.EventGuests')
)
BEGIN
    CREATE INDEX IX_EventGuests_event_id ON dbo.EventGuests(event_id);
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'IX_EventGuests_guest_id'
      AND object_id = OBJECT_ID('dbo.EventGuests')
)
BEGIN
    CREATE INDEX IX_EventGuests_guest_id ON dbo.EventGuests(guest_id);
END
GO

