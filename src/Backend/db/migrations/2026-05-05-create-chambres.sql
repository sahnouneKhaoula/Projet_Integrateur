/*
  Table dbo.Chambres — catalogue hébergement (GET /api/chambres, détail, réservation).
  Exécuter une fois sur la base (SSMS ou sqlcmd). Sans GO : compatible batch Node/mssql.
*/
IF NOT EXISTS (
  SELECT 1 FROM sys.tables t
  WHERE t.name = N'Chambres' AND SCHEMA_NAME(t.schema_id) = N'dbo'
)
BEGIN
  CREATE TABLE dbo.Chambres (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(150) NOT NULL,
    category NVARCHAR(50) NOT NULL,
    description NVARCHAR(MAX) NULL,
    price_per_night DECIMAL(10,2) NOT NULL,
    size_m2 INT NOT NULL,
    capacity INT NOT NULL,
    vue_label NVARCHAR(100) NULL,
    image_url NVARCHAR(2000) NULL,
    images_json NVARCHAR(MAX) NULL,
    featured BIT NOT NULL DEFAULT 0,
    equipments_json NVARCHAR(MAX) NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
  );
END
