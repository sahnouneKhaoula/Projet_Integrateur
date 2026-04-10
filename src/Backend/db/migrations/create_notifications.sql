USE HotelEventsDB;
GO

-- Table Notifications
CREATE TABLE Notifications (
  id INT IDENTITY(1,1) PRIMARY KEY,
  user_id INT NOT NULL,                        -- destinataire
  type NVARCHAR(50) NOT NULL,                  -- ex: 'event_pending', 'event_confirmed'
  title NVARCHAR(255) NOT NULL,
  message NVARCHAR(MAX) NOT NULL,
  event_id INT NULL,                           -- lien optionnel vers un événement
  is_read BIT NOT NULL DEFAULT 0,
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT FK_Notif_User  FOREIGN KEY (user_id)  REFERENCES Users(id),
  CONSTRAINT FK_Notif_Event FOREIGN KEY (event_id) REFERENCES Events(id)
);
GO
