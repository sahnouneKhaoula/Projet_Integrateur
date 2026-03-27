/**
 * Point d'entrée du serveur API (Express).
 *
 * Rôle :
 *   - Charger la config (.env) et la connexion SQL (db/db.js)
 *   - Appliquer les middlewares de sécurité / perf (helmet, cors, compression, JSON)
 *   - Monter toutes les routes REST sous /api/...
 *
 * Pour l'équipe : chaque fichier dans routes/ correspond à un "module" métier
 * (utilisateurs, événements, factures, etc.). Le frontend appelle ces URLs.
 */
import 'dotenv/config'

// Importations générales du projet
import express, { json } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression';
import dotenv from "dotenv";


dotenv.config();

// Initialise le pool de connexions SQL Server (une seule fois au démarrage)
import "./db/db.js";

// --- Routes API : un import = un groupe d'URL liées au même domaine fonctionnel ---
import statsRoutes from './routes/statsRoutes.js';
import importExportRoutes from './routes/importExportRoutes.js';
import notificationsRoutes from './routes/notificationsRoutes.js';
import rolesRoutes from './routes/rolesRoutes.js';
import usersRoutes from './routes/usersRoutes.js';
import sallesRoutes from './routes/sallesRoutes.js';
import eventsRoutes from './routes/eventsRoutes.js';
import reservationsRoutes from './routes/reservationsRoutes.js';
import guestsRoutes from './routes/guestsRoutes.js';
import servicesRoutes from './routes/servicesRoutes.js';
import invoicesRoutes from './routes/invoicesRoutes.js';
import paymentsRoutes from './routes/paymentsRoutes.js';

const app = express();

// Sécurité en-têtes HTTP · autoriser le frontend (autre port) · gzip · corps JSON · fichiers statiques /public
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(json());
app.use(express.static('public'));

// Préfixe /api : convention pour séparer l'API du reste si besoin
app.use('/api/stats',         statsRoutes);
app.use('/api/import',        importExportRoutes);
app.use('/api/export',        importExportRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/salles', sallesRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/reservations', reservationsRoutes);
app.use('/api/guests', guestsRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/payments', paymentsRoutes);

// Écoute sur le port défini dans .env (ex. 3001)
app.listen(process.env.PORT);
console.log('Serveur démarré:');
console.log('http://localhost:' + process.env.PORT);