// Chargement du fichier de configuration
import 'dotenv/config'

// Importations générales du projet
import express, { json } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression';
import dotenv from "dotenv";


dotenv.config();

import "./db/db.js";


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

// Création du serveur
const app = express();

// Ajout des middlewares
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(json());
app.use(express.static('public'));

// Programmation des routes
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

// Démarrage du serveur sur un port fixe pour le dev
const PORT = 3002;
app.listen(PORT, () => {
  console.log('Serveur démarré:');
  console.log('http://localhost:' + PORT);
});