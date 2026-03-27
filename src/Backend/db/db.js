/**
 * Connexion à Microsoft SQL Server via le driver `mssql`.
 *
 * `poolPromise` : promesse qui résout vers un pool de connexions réutilisable.
 * Tous les contrôleurs font `const pool = await poolPromise` puis `pool.request()`.
 *
 * Les paramètres viennent du fichier .env (DB_SERVER, DB_DATABASE, DB_USER, etc.).
 */
import sql from "mssql";

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,      // localhost\\SQLEXPRESS
  database: process.env.DB_DATABASE,  // HotelEventsDB
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

export const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log("SQL connecté (TCP / SQL Auth)");
    return pool;
  })
  .catch(err => {
    console.error(" SQL erreur :", err);
  });

export { sql };
