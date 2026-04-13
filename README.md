# Plateforme de gestion des événements – Projet intégrateur

## 📌 Description
Ce projet est une application web de gestion des événements développée dans le cadre d’un **projet intégrateur en programmation**.  
La plateforme permet à un hôtel de planifier, organiser et gérer des événements (mariages, réunions, séminaires, conférences, etc.) de manière centralisée.

Le système prend en charge la réservation de salles, la gestion des invités, la coordination des services de l’hôtel, la facturation automatisée et la génération de rapports post-événement.

---

## 🎯 Objectifs du projet
- Centraliser la gestion des événements
- Éviter les conflits de réservation
- Automatiser la facturation
- Faciliter la coordination entre les différents services
- Appliquer les bonnes pratiques de développement logiciel

---

## 👥 Types d’utilisateurs
- **Organisateur** : crée et gère les événements
- **Coordonnateur hôtel** : valide et planifie les services
- **Comptabilité** : gère la facturation et les paiements
- **Administrateur** : gère les utilisateurs, salles et paramètres

---

## ⚙️ Fonctionnalités principales
- Gestion des événements (création, modification, annulation)
- Réservation des salles avec calendrier et prévention des conflits
- Gestion des invités et envoi d’invitations
- Coordination des services (traiteur, audiovisuel, sécurité, etc.)
- Notifications automatiques
- Facturation automatisée et génération de reçus
- Rapports post-événement (statistiques, exports)

---

## 🛠️ Technologies utilisées
> À adapter selon ton projet

- Frontend : (ex. React / Angular / HTML-CSS-JS)
- Backend : (ex. Javascript / C# / Node.js )
- Base de données :  MySQLServer
- Architecture : Application web client–serveur

---

## Structure du Projet 
1. Strucutre Principale :
```bash
Projet_Integrateur/
├── src/
│   ├── Backend/
│   │   ├── controllers/
│   │   │   ├── eventsController.js
│   │   │   ├── guestsController.js
│   │   │   ├── invoicesController.js
│   │   │   ├── paymentsController.js
│   │   │   ├── reservationsController.js
│   │   │   ├── rolesController.js
│   │   │   ├── sallesController.js
│   │   │   ├── servicesController.js
│   │   │   └── usersController.js
│   │   ├── db/
│   │   │   ├── db.js                  — Connexion MSSQL (pool de connexions)
│   │   │   └── schema.sql             — Schéma de la base de données
│   │   ├── middleware/
│   │   │   └── authMiddleware.js      — Vérification JWT sur les routes protégées
│   │   ├── routes/
│   │   │   ├── eventsRoutes.js
│   │   │   ├── guestsRoutes.js
│   │   │   ├── invoicesRoutes.js
│   │   │   ├── paymentsRoutes.js
│   │   │   ├── reservationsRoutes.js
│   │   │   ├── rolesRoutes.js
│   │   │   ├── sallesRoutes.js
│   │   │   ├── servicesRoutes.js
│   │   │   └── usersRoutes.js
│   │   ├── public/
│   │   │   └── index.html
│   │   ├── .env                       — Variables d'environnement (non versionné)
│   │   ├── package.json
│   │   ├── seed.js                    — Données initiales (seeding)
│   │   └── server.js                  — Point d'entrée Express
│   │
│   └── Frontend/
│       ├── src/
│       │   ├── Style/
│       │   │   ├── base/
│       │   │   │   ├── variables.css       — Design tokens (couleurs, rayons, typo, ombres)
│       │   │   │   └── reset.css           — Reset global + typographie de base
│       │   │   ├── layout/
│       │   │   │   ├── app.css             — Shell app, sidebar, contenu principal
│       │   │   │   ├── navbar.css          — Barre de navigation publique
│       │   │   │   └── footer.css          — Pied de page
│       │   │   ├── components/
│       │   │   │   ├── buttons.css         — Tous les boutons réutilisables
│       │   │   │   ├── cards.css           — Cartes (base, suite, chambre, expérience, témoignage)
│       │   │   │   ├── forms.css           — Champs, inputs, selects, messages de feedback
│       │   │   │   └── sections.css        — Patterns de sections (grilles, CTA, événements)
│       │   │   ├── pages/
│       │   │   │   ├── home.css            — Page d'accueil (hero)
│       │   │   │   ├── rooms.css           — Page chambres + filtres
│       │   │   │   ├── services.css        — Page services
│       │   │   │   ├── booking.css         — Page réservation multi-étapes
│       │   │   │   └── auth.css            — Pages connexion / inscription
│       │   │   ├── admin/
│       │   │   │   ├── dashboard.css       — Tableau de bord
│       │   │   │   ├── gestion-roles.css   — Gestion des rôles
│       │   │   │   └── gestion-utilisateurs.css — Gestion des utilisateurs
│       │   │   └── index.css              — Point d'entrée global (importe tous les modules)
│       │   ├── components/
│       │   │   ├── Bouton.jsx
│       │   │   ├── Carte.jsx
│       │   │   ├── Comptabilite.jsx
│       │   │   ├── Dashboard.jsx
│       │   │   ├── Espaces.jsx
│       │   │   ├── Evenements.jsx
│       │   │   ├── GestionRoles.jsx
│       │   │   ├── GestionUtilisateurs.jsx
│       │   │   ├── ImageAvecRepli.jsx
│       │   │   ├── Layout.jsx
│       │   │   ├── Navbar.jsx
│       │   │   ├── Parametres.jsx
│       │   │   ├── PiedDePage.jsx
│       │   │   └── Services.jsx
│       │   ├── pages/
│       │   │   ├── Accueil.jsx
│       │   │   ├── Chambres.jsx
│       │   │   ├── Connexion.jsx
│       │   │   ├── Inscription.jsx
│       │   │   ├── Reservation.jsx
│       │   │   └── Services.jsx
│       │   ├── tests/
│       │   │   ├── GestionRoles.test.jsx
│       │   │   ├── GestionUtilisateurs.test.jsx
│       │   │   ├── SetupTests.js
│       │   │   └── README
│       │   ├── assets/
│       │   │   └── react.svg
│       │   ├── App.jsx                    — Racine de l'application + onglets admin
│       │   ├── main.jsx                   — Point d'entrée React
│       │   └── routes.jsx                 — Routage React Router v6
│       ├── public/
│       │   └── vite.svg
│       ├── Index.html
│       ├── eslint.config.js
│       ├── vite.config.js
│       └── package.json
└── README.md        
  ```

2. Strucutre du CSS : 
   ```bash
   Style/
   ├── base/
   │   ├── variables.css       — Design tokens (couleurs, rayons, typo, ombres)
   │   └── reset.css           — Reset global + typographie de base
   ├── layout/
   │   ├── app.css             — Shell app, sidebar, contenu principal
   │   ├── navbar.css          — Barre de navigation publique
   │   └── footer.css          — Pied de page
   ├── components/
   │   ├── buttons.css         — Tous les boutons réutilisables
   │   ├── cards.css           — Cartes (base, suite, chambre, expérience, témoignage)
   │   ├── forms.css           — Champs, inputs, selects, messages de feedback
   │   └── sections.css        — Patterns de sections (grilles, CTA, événements)
   ├── pages/
   │   ├── home.css            — Page d'accueil (hero)
   │   ├── rooms.css           — Page chambres + filtres
   │   ├── services.css        — Page services
   │   ├── booking.css         — Page réservation multi-étapes
   │   └── auth.css            — Pages connexion / inscription
   └── admin/
       ├── dashboard.css       — Tableau de bord
       ├── gestion-roles.css   — Gestion des rôles
       └── gestion-utilisateurs.css — Gestion des utilisateurs

   ---

## ▶️ Installation et exécution

Pour cette application, il est nécessaire d’avoir une base de données SQL Server nommée ``` HotelEventDB ```.

## Configuration de la base de données SQL Server

Pour permettre au projet de se connecter correctement à SQL Server, certaines configurations réseau peuvent être nécessaires sur la machine qui héberge la base de données.

### 1. Activer le protocole TCP/IP
1. Ouvrir **SQL Server Configuration Manager**
2. Aller dans :
   - **SQL Server Network Configuration**
   - **Protocols for [SQLEXPRESS]**
3. Activer **TCP/IP**
4. Appliquer les changements

### 2. Configurer un port fixe
- Windows + r : ``` services.msc ```
1. Dans les propriétés de **TCP/IP**, ouvrir l’onglet **IP Addresses**
2. Descendre jusqu’à **IPAll**
3. Vider le champ **TCP Dynamic Ports** si nécessaire
4. Définir **TCP Port = 1433** 
5. Enregistrer

### 3. Redémarrer SQL Server
Après toute modification réseau :
1. Aller dans **SQL Server Services** || Windows + r : ``` SQLServerManager15.msc ```
2. Redémarrer le service **SQL Server ([SQLEXPRESS])**

### 4. Configurer le pare-feu Windows
Ajouter une règle entrante autorisant :
- **TCP 1433** 

### 5. SQL Server Browser 
1. Démarrer le service **SQL Server Browser**
2. Autoriser **UDP 1434** dans le pare-feu si nécessaire

### 6. Vérifier la chaîne de connexion
Exemples :

#### Instance par défaut
```env
DB_SERVER=localhost/SQLEXPRESS
DB_PORT=1433
DB_NAME=HotelEventDB
DB_USER=sa
DB_PASSWORD=VotreMotDePasse
```
1. Cloner le dépôt :
   ```bash
   git clone https://github.com/sahnouneKhaoula/Projet_Integrateur.git
   ```
   ```bash
   cd src/frontend/src
   ```
     ```bash
   npm install
   ```
   ```bash
   npm run dev
   ```
   
   Ouvrez un nouveau terminal :
   
    ```bash
   cd src/backend/db
   ```
    ```bash
   npm install
   ```
   ```bash
   npm run dev
   ```
  
