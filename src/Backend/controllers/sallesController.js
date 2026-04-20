import { poolPromise } from '../db/db.js';

// Récupérer toutes les salles
export const getAllSalles = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Salles');
        res.status(200).json(result.recordset);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

// Créer une salle
export const createSalle = async (req, res) => {
    const { name, capacity, location } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('name', name)
            .input('capacity', capacity)
            .input('location', location)
            .query('INSERT INTO Salles (name, capacity, location) VALUES (@name, @capacity, @location)');
        res.status(201).json({ message: "Salle créée avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la création", error: error.message });
    }
};



// ... getAllSalles et createSalle déjà présents ...

// Statistiques d’occupation des salles
export const getSallesStats = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      DECLARE @today date = CAST(GETUTCDATE() AS date);
      DECLARE @startOfMonth date = DATEFROMPARTS(YEAR(@today), MONTH(@today), 1);
      DECLARE @startOfNextMonth date = DATEADD(month, 1, @startOfMonth);

      SELECT
        (SELECT COUNT(*) FROM Salles) AS total_salles,
        (SELECT COUNT(DISTINCT room_id)
         FROM Reservations
         WHERE status <> 'cancelled'
           AND reserved_from <= DATEADD(day, 1, @today)
           AND reserved_to   >= @today) AS salles_reservees_aujourdhui,
        (SELECT COUNT(DISTINCT room_id)
         FROM Reservations
         WHERE status <> 'cancelled'
           AND reserved_from <  @startOfNextMonth
           AND reserved_to   >= @startOfMonth) AS salles_occupees_mois
    `);

    res.status(200).json(result.recordset[0]);
  } catch (error) {
    res.status(500).json({ message: 'Erreur stats salles', error: error.message });
  }
};