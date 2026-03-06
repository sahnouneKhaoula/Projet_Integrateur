USE HotelEventsDB;
GO

-- 1. Création de la table Roles
CREATE TABLE Roles (
  id INT IDENTITY(1,1) PRIMARY KEY,
  name NVARCHAR(50) NOT NULL UNIQUE
);

-- 2. Création de la table Users
CREATE TABLE Users (
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
  CONSTRAINT FK_User_Role FOREIGN KEY (role_id) REFERENCES Roles(id)
);

-- 3. Création de la table Salles
CREATE TABLE Salles (
  id INT IDENTITY(1,1) PRIMARY KEY,
  name NVARCHAR(100) NOT NULL,
  capacity INT NOT NULL,
  location NVARCHAR(255) NULL
);

-- 4. Création de la table Events
CREATE TABLE Events (
  id INT IDENTITY(1,1) PRIMARY KEY,
  title NVARCHAR(255) NOT NULL,
  description NVARCHAR(MAX) NULL,
  organizer_id INT NOT NULL,
  start_date DATETIME2 NOT NULL,
  end_date DATETIME2 NOT NULL,
  room_id INT NULL,
  status NVARCHAR(50) NOT NULL DEFAULT 'planned',
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_at DATETIME2 NULL,
  CONSTRAINT FK_Event_Organizer FOREIGN KEY (organizer_id) REFERENCES Users(id),
  CONSTRAINT FK_Event_Room FOREIGN KEY (room_id) REFERENCES Salles(id)
);

-- 5. Création de la table Reservations
CREATE TABLE Reservations (
  id INT IDENTITY(1,1) PRIMARY KEY,
  event_id INT NOT NULL,
  room_id INT NOT NULL,
  reserved_from DATETIME2 NOT NULL,
  reserved_to DATETIME2 NOT NULL,
  status NVARCHAR(50) NOT NULL DEFAULT 'pending',
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT FK_Reservation_Event FOREIGN KEY (event_id) REFERENCES Events(id),
  CONSTRAINT FK_Reservation_Room FOREIGN KEY (room_id) REFERENCES Salles(id)
);

-- 6. Création de la table Guests
CREATE TABLE Guests (
  id INT IDENTITY(1,1) PRIMARY KEY,
  event_id INT NOT NULL,
  full_name NVARCHAR(255) NOT NULL,
  email NVARCHAR(255) NULL,
  phone NVARCHAR(50) NULL,
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT FK_Guest_Event FOREIGN KEY (event_id) REFERENCES Events(id)
);

-- 7. Création de la table Services
CREATE TABLE Services (
  id INT IDENTITY(1,1) PRIMARY KEY,
  event_id INT NOT NULL,
  name NVARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT FK_Service_Event FOREIGN KEY (event_id) REFERENCES Events(id)
);

-- 8. Création de la table Invoices
CREATE TABLE Invoices (
  id INT IDENTITY(1,1) PRIMARY KEY,
  event_id INT NOT NULL,
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  status NVARCHAR(50) NOT NULL DEFAULT 'unpaid',
  issued_date DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT FK_Invoice_Event FOREIGN KEY (event_id) REFERENCES Events(id)
);

-- 9. Création de la table Payments
CREATE TABLE Payments (
  id INT IDENTITY(1,1) PRIMARY KEY,
  invoice_id INT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  paid_at DATETIME2 NULL,
  method NVARCHAR(50) NULL,
  CONSTRAINT FK_Payment_Invoice FOREIGN KEY (invoice_id) REFERENCES Invoices(id)
);
