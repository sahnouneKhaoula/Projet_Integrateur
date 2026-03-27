/**
 * Script d'initialisation de la base (rôles, utilisateur admin de test, données de base).
 * Lancer depuis le dossier Backend : `node seed.js`
 * Nécessite un .env valide et une base SQL déjà créée selon le schéma du projet.
 */
import 'dotenv/config';
import { poolPromise } from './db/db.js';
import bcrypt from 'bcrypt';

async function seedDatabase() {
    try {
        const pool = await poolPromise;
        console.log("Connecté à la base de données, début de l'initialisation...");

        // 1. Création des rôles de base s'ils n'existent pas
        const rolesToInsert = ['admin', 'comptabilite', 'organisateur', 'coordonnateur', 'client'];
        let adminRoleId = null;

        for (const roleName of rolesToInsert) {
            // Vérifier si le rôle existe déjà
            const checkRole = await pool.request()
                .input('name', roleName)
                .query('SELECT id FROM Roles WHERE name = @name');

            if (checkRole.recordset.length === 0) {
                // Insérer le rôle
                await pool.request()
                    .input('name', roleName)
                    .query('INSERT INTO Roles (name) VALUES (@name)');
                console.log(`Rôle '${roleName}' inséré.`);
            } else {
                console.log(`Rôle '${roleName}' existe déjà.`);
            }
        }

        // Récupérer l'ID du rôle admin (qu'il vienne d'être créé ou qu'il existe déjà)
        const adminRoleResult = await pool.request()
            .input('name', 'admin')
            .query('SELECT id FROM Roles WHERE name = @name');

        if (adminRoleResult.recordset.length > 0) {
            adminRoleId = adminRoleResult.recordset[0].id;
        } else {
            throw new Error("Impossible de trouver ou créer le rôle admin.");
        }

        // 2. Création de l'utilisateur admin de test
        const adminEmail = 'admin@lapromenade.ca';
        const rawPassword = 'admin'; // Mot de passe facile pour les tests

        // Vérifier si l'utilisateur admin existe déjà
        const checkAdmin = await pool.request()
            .input('email', adminEmail)
            .query('SELECT id FROM Users WHERE email = @email');

        if (checkAdmin.recordset.length === 0) {
            // Hasher le mot de passe
            const saltRounds = 10;
            const passwordHash = await bcrypt.hash(rawPassword, saltRounds);

            // Insérer l'admin
            await pool.request()
                .input('username', 'admin_test')
                .input('email', adminEmail)
                .input('password_hash', passwordHash)
                .input('first_name', 'Admin')
                .input('last_name', 'Directeur')
                .input('phone', '555-0101')
                .input('role_id', adminRoleId)
                .query(`
                    INSERT INTO Users (username, email, password_hash, first_name, last_name, phone, role_id) 
                    VALUES (@username, @email, @password_hash, @first_name, @last_name, @phone, @role_id)
                `);
            console.log(`Utilisateur Admin créé avec succès !`);
            console.log(`-> Email : ${adminEmail}`);
            console.log(`-> Mot de passe : ${rawPassword}`);
        } else {
            console.log(`L'utilisateur Admin (${adminEmail}) existe déjà dans la base.`);
        }

        // 3. Création du rôle et d'un utilisateur Client de test
        const clientRoleResult = await pool.request()
            .input('name', 'client')
            .query('SELECT id FROM Roles WHERE name = @name');

        if (clientRoleResult.recordset.length > 0) {
            const clientRoleId = clientRoleResult.recordset[0].id;
            const clientEmail = 'client@lapromenade.ca';

            const checkClient = await pool.request()
                .input('email', clientEmail)
                .query('SELECT id FROM Users WHERE email = @email');

            if (checkClient.recordset.length === 0) {
                const saltRounds = 10;
                const clientPasswordHash = await bcrypt.hash('client', saltRounds);

                await pool.request()
                    .input('username', 'client_jdoe')
                    .input('email', clientEmail)
                    .input('password_hash', clientPasswordHash)
                    .input('first_name', 'SmartProjet')
                    .input('last_name', 'Doe')
                    .input('phone', '555-0202')
                    .input('role_id', clientRoleId)
                    .query(`
                        INSERT INTO Users (username, email, password_hash, first_name, last_name, phone, role_id) 
                        VALUES (@username, @email, @password_hash, @first_name, @last_name, @phone, @role_id)
                    `);
                console.log(`Utilisateur Client créé avec succès !`);
                console.log(`-> Email : ${clientEmail}`);
                console.log(`-> Mot de passe : client`);
            } else {
                console.log(`L'utilisateur Client (${clientEmail}) existe déjà dans la base.`);
            }
        }

        console.log("Initialisation terminée avec succès.");
        process.exit(0);

    } catch (error) {
        console.error("Erreur lors de l'initialisation :", error);
        process.exit(1);
    }
}

seedDatabase();
