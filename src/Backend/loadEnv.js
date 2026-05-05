/**
 * À importer en tout premier dans tout point d'entrée (avant db.js).
 * Les imports ES sont hoistés : sans ce fichier, db.js lit process.env avant dotenv.config().
 */
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// Fichier principal à la racine du Backend ; routes/.env complète ou remplace (override)
dotenv.config({ path: path.join(__dirname, '.env') })
dotenv.config({ path: path.join(__dirname, 'routes', '.env'), override: true })
