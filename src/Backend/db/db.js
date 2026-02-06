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
