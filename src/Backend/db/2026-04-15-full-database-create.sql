/*
  Création complète de la base HotelEventsDB (SQL Server)
  Exécuter ce script en premier.
*/

IF DB_ID('HotelEventsDB') IS NULL
BEGIN
    CREATE DATABASE HotelEventsDB;
END
GO

USE HotelEventsDB;
GO

IF OBJECT_ID('dbo.Roles', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Roles (
      id INT IDENTITY(1,1) PRIMARY KEY,
      name NVARCHAR(50) NOT NULL UNIQUE
    );
END
GO

IF OBJECT_ID('dbo.Users', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Users (
      id INT IDENTITY(1,1) PRIMARY KEY,
      username NVARCHAR(100) NULL,
      email NVARCHAR(255) NOT NULL UNIQUE,
      password_hash NVARCHAR(255) NOT NULL,
      first_name NVARCHAR(100) NOT NULL,
      last_name NVARCHAR(100) NOT NULL,
      phone NVARCHAR(50) NULL,
      role_id INT NOT NULL,
      is_active BIT NOT NULL DEFAULT 1,
      created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
      updated_at DATETIME2 NULL,
      last_login DATETIME2 NULL,
      CONSTRAINT FK_User_Role FOREIGN KEY (role_id) REFERENCES dbo.Roles(id)
    );
END
GO

IF OBJECT_ID('dbo.Salles', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Salles (
      id INT IDENTITY(1,1) PRIMARY KEY,
      name NVARCHAR(100) NOT NULL,
      capacity INT NOT NULL,
      location NVARCHAR(255) NULL
    );
END
GO

IF OBJECT_ID('dbo.Events', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Events (
      id INT IDENTITY(1,1) PRIMARY KEY,
      title NVARCHAR(255) NOT NULL,
      description NVARCHAR(MAX) NULL,
      organizer_id INT NOT NULL,
      start_date DATETIME2 NOT NULL,
      end_date DATETIME2 NOT NULL,
      room_id INT NULL,
      expected_guests INT NULL,
      status NVARCHAR(50) NOT NULL DEFAULT 'planned',
      created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
      updated_at DATETIME2 NULL,
      CONSTRAINT FK_Event_Organizer FOREIGN KEY (organizer_id) REFERENCES dbo.Users(id),
      CONSTRAINT FK_Event_Room FOREIGN KEY (room_id) REFERENCES dbo.Salles(id)
    );
END
GO

IF OBJECT_ID('dbo.Reservations', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Reservations (
      id INT IDENTITY(1,1) PRIMARY KEY,
      event_id INT NOT NULL,
      room_id INT NOT NULL,
      reserved_from DATETIME2 NOT NULL,
      reserved_to DATETIME2 NOT NULL,
      status NVARCHAR(50) NOT NULL DEFAULT 'pending',
      created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
      CONSTRAINT FK_Reservation_Event FOREIGN KEY (event_id) REFERENCES dbo.Events(id),
      CONSTRAINT FK_Reservation_Room FOREIGN KEY (room_id) REFERENCES dbo.Salles(id)
    );
END
GO

IF OBJECT_ID('dbo.Guests', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Guests (
      id INT IDENTITY(1,1) PRIMARY KEY,
      full_name NVARCHAR(255) NOT NULL,
      email NVARCHAR(255) NULL,
      phone NVARCHAR(50) NULL,
      created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
END
GO

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

IF OBJECT_ID('dbo.Services', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Services (
      id INT IDENTITY(1,1) PRIMARY KEY,
      event_id INT NOT NULL,
      name NVARCHAR(255) NOT NULL,
      price DECIMAL(10,2) NOT NULL DEFAULT 0,
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
      CONSTRAINT FK_Service_Event FOREIGN KEY (event_id) REFERENCES dbo.Events(id)
    );
END
GO

IF OBJECT_ID('dbo.Invoices', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Invoices (
      id INT IDENTITY(1,1) PRIMARY KEY,
      event_id INT NOT NULL,
      total DECIMAL(12,2) NOT NULL DEFAULT 0,
      status NVARCHAR(50) NOT NULL DEFAULT 'unpaid',
      issued_date DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
      CONSTRAINT FK_Invoice_Event FOREIGN KEY (event_id) REFERENCES dbo.Events(id)
    );
END
GO

IF OBJECT_ID('dbo.InvoiceLines', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.InvoiceLines (
      id INT IDENTITY(1,1) PRIMARY KEY,
      invoice_id INT NOT NULL,
      source_type NVARCHAR(20) NOT NULL,
      service_id INT NULL,
      label NVARCHAR(255) NOT NULL,
      unit_price DECIMAL(12,2) NOT NULL,
      quantity DECIMAL(12,2) NOT NULL DEFAULT 1,
      line_total AS (unit_price * quantity) PERSISTED,
      created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
      CONSTRAINT FK_InvoiceLine_Invoice FOREIGN KEY (invoice_id) REFERENCES dbo.Invoices(id),
      CONSTRAINT FK_InvoiceLine_Service FOREIGN KEY (service_id) REFERENCES dbo.Services(id),
      CONSTRAINT CK_InvoiceLine_SourceType CHECK (source_type IN ('service','extra')),
      CONSTRAINT CK_InvoiceLine_UnitPrice CHECK (unit_price >= 0),
      CONSTRAINT CK_InvoiceLine_Quantity CHECK (quantity > 0),
      CONSTRAINT UQ_InvoiceLine_Invoice_Service UNIQUE (invoice_id, service_id)
    );
END
GO

IF OBJECT_ID('dbo.Payments', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Payments (
      id INT IDENTITY(1,1) PRIMARY KEY,
      invoice_id INT NOT NULL,
      amount DECIMAL(12,2) NOT NULL,
      paid_at DATETIME2 NULL,
      method NVARCHAR(50) NULL,
      CONSTRAINT FK_Payment_Invoice FOREIGN KEY (invoice_id) REFERENCES dbo.Invoices(id)
    );
END
GO

IF OBJECT_ID('dbo.Notifications', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Notifications (
      id INT IDENTITY(1,1) PRIMARY KEY,
      user_id INT NOT NULL,
      type NVARCHAR(50) NOT NULL,
      title NVARCHAR(255) NOT NULL,
      message NVARCHAR(MAX) NOT NULL,
      event_id INT NULL,
      is_read BIT NOT NULL DEFAULT 0,
      created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
      CONSTRAINT FK_Notif_User  FOREIGN KEY (user_id)  REFERENCES dbo.Users(id),
      CONSTRAINT FK_Notif_Event FOREIGN KEY (event_id) REFERENCES dbo.Events(id)
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UX_Reservations_event_id' AND object_id = OBJECT_ID('dbo.Reservations'))
    CREATE UNIQUE INDEX UX_Reservations_event_id ON dbo.Reservations(event_id);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_EventGuests_event_id' AND object_id = OBJECT_ID('dbo.EventGuests'))
    CREATE INDEX IX_EventGuests_event_id ON dbo.EventGuests(event_id);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_EventGuests_guest_id' AND object_id = OBJECT_ID('dbo.EventGuests'))
    CREATE INDEX IX_EventGuests_guest_id ON dbo.EventGuests(guest_id);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_InvoiceLines_invoice_id' AND object_id = OBJECT_ID('dbo.InvoiceLines'))
    CREATE INDEX IX_InvoiceLines_invoice_id ON dbo.InvoiceLines(invoice_id);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_InvoiceLines_service_id' AND object_id = OBJECT_ID('dbo.InvoiceLines'))
    CREATE INDEX IX_InvoiceLines_service_id ON dbo.InvoiceLines(service_id);
GO
