import sql from "mssql";

const server = String(process.env.DB_SERVER ?? process.env.SQL_SERVER ?? "").trim();
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const database = process.env.DB_DATABASE;

if (!server) {
  console.error(
    "[db] Variable DB_SERVER manquante. Ajoutez dans src/Backend/.env ou src/Backend/routes/.env :\n" +
    "  DB_SERVER=localhost\\\\SQLEXPRESS   (ou votre instance SQL)\n" +
    "  DB_USER=...\n" +
    "  DB_PASSWORD=...\n" +
    "  DB_DATABASE=...\n" +
    "Lancez le serveur depuis src/Backend (npm run dev) ou utilisez loadEnv en premier."
  );
}

/** Parse "true"/"1"/"yes" / "false"/"0" / vide → fallback */
function envBool(raw, fallback) {
  if (raw == null || String(raw).trim() === "") return fallback
  const v = String(raw).trim().toLowerCase()
  if (["true", "1", "yes"].includes(v)) return true
  if (["false", "0", "no"].includes(v)) return false
  return fallback
}

const isAzureSql = /\.database\.windows\.net$/i.test(server)
// Azure SQL impose TLS : encrypt true par défaut ; local souvent false
const encrypt = envBool(process.env.DB_ENCRYPT, isAzureSql)
// Certificat signé sur Azure : false par défaut ; local / dev : true
const trustServerCertificate = envBool(
  process.env.DB_TRUST_SERVER_CERTIFICATE,
  !isAzureSql
)

const portParsed = Number.parseInt(String(process.env.DB_PORT ?? "").trim(), 10)
const port = Number.isFinite(portParsed) && portParsed > 0 ? portParsed : undefined

const connTimeoutParsed = Number.parseInt(
  String(process.env.DB_CONNECTION_TIMEOUT_MS ?? "").trim(),
  10
)
/** Azure : défaut plus long ; pare-feu mal configuré = timeout classique sur 1433 */
const connectionTimeout = Number.isFinite(connTimeoutParsed) && connTimeoutParsed > 0
  ? connTimeoutParsed
  : isAzureSql
    ? 60000
    : 15000

const config = {
  user,
  password,
  server,
  database,
  ...(port != null ? { port } : {}),
  connectionTimeout,
  options: {
    encrypt,
    trustServerCertificate,
  },
};

export const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log("SQL connecté (TCP / SQL Auth)")
    return pool
  })
  .catch(err => {
    console.error(" SQL erreur :", err)
    if (err.code === "ETIMEOUT" || /ETIMEOUT/i.test(String(err.message))) {
      console.error(
        "[db] Connexion TCP expirée (port 1433). Ce n’est en général pas un bug dans le code.\n" +
          " Vérifiez sur Azure Portal → votre serveur SQL → « Sécurité / Mise en réseau » / pare-feu :\n" +
          "   • Ajoutez votre IP publique actuelle (IPv4).\n" +
          "   • Ou activez « Autoriser les services Azure » si l’API tourne sur Azure.\n" +
          " Vérifiez aussi votre box / VPN / entreprise ne bloquent pas le port 1433 sortant.\n" +
          " Optionnel dans .env : DB_CONNECTION_TIMEOUT_MS=90000 pour un réseau lent."
      )
    }
  })

/** Pool pour contrôleurs qui ont besoin d’une promesse résolue ou d’une erreur claire */
export async function getPool() {
  const pool = await poolPromise
  if (!pool) throw new Error("Pool SQL indisponible — vérifiez DB_SERVER et vos identifiants (.env).")
  return pool
}

export { sql }
