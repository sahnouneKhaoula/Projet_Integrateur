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


- Frontend : (React / JSX-Vite / CSS-JS)
- Backend : (Javascript / SQL / Node.js )
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
---

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

- https://www.microsoft.com/en-us/sql-server/sql-server-downloads
- SQL Server 2025 Express

Pour permettre au projet de se connecter correctement à SQL Server, certaines configurations réseau peuvent être nécessaires sur la machine qui héberge la base de données.

### 1. Activer le protocole TCP/IP
1. Ouvrir **SQL Server Configuration Manager** || Windows + r : ``` SQLServerManager15.msc ```
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
PORT= 3002
DB_SERVER=[Nom_de_Votre_Serveur]\SQLEXPRESS
DB_DATABASE=HotelEventsDB
DB_USER=sa
DB_PASSWORD=[Votre_mot_de_passe]
DB_ENCRYPT=false
JWT_SECRET=ma_clef_secrete_ultra_solide_pour_l_hotel_2026

```

---

### Avant de démarrer 
Assurez-vous d’activer l’utilisateur nommé « sa » et de définir le mot de passe qui sera utilisé dans le fichier d’environnement ```bash .env ```

assurez-vous d’exécuter les scripts SQL dans l’ordre : commencez par ```2026-04-15-full-database-create.sql``` afin de créer la structure de la base de données, puis exécutez ```2026-04-15-full-database-seed.sql``` pour y insérer les données de test requises.


 Cloner le dépôt :
  ```bash
   git clone https://github.com/sahnouneKhaoula/Projet_Integrateur.git
   ```
   ```bash 
   cd src/frontend
   ```
  ```bash
   npm install
   ```
   ```bash
   npm run dev
  ```

   
   Ouvrez un nouveau terminal :
   ```bash
    cd src/backend
```
```bash
 npm install
   ```
   ```bash
   npm run dev
   ```

---

## Alignement entre le cahier des charges et le livrable

### Introduction

Ce projet a été réalisé en visant une cohérence directe entre le cahier des charges et les fonctionnalités livrées. Chaque exigence fonctionnelle prévue a été prise en charge dans le périmètre du projet, tout en respectant les délais fixés.

L’ensemble des fonctionnalités décrites dans le cahier des charges a été développé et intégré, à l’exception du module de **notifications automatiques**. Ce volet a été amorcé et partiellement implémenté, mais il n’a pas été complété au niveau prévu dans la spécification initiale, notamment en ce qui concerne les déclencheurs métier, les préférences utilisateur et le cycle de vie complet des notifications.

Le détail de cet écart est présenté ci-dessous afin de préciser clairement ce qui fait partie du livrable final et ce qui demeure ouvert pour une évolution ultérieure.

---

### Module « Notifications automatiques » — périmètre partiel

Le cahier des charges prévoyait un module de notifications automatiques permettant d’alerter les utilisateurs sur les actions importantes, les échéances et les événements critiques liés à l’organisation d’événements. L’objectif était de réduire les oublis, d’améliorer la réactivité des équipes et de centraliser les alertes importantes dans l’application.

Dans la version présentée, ce module n’est pas complet au regard de la spécification initiale. Certains éléments peuvent être présents dans le code ou dans l’interface, mais le dispositif global n’est pas entièrement fonctionnel.

Les éléments non entièrement couverts sont notamment :

- **Vue centralisée et navigation**
  - Tableau d’alertes unifié regroupant les paiements, rappels, services et validations.
  - Recherche et filtrage par type, événement ou date.

- **Contexte métier**
  - Consultation systématique des notifications avec des détails contextualisés.
  - Exemple : lien vers une facture, un événement, un service ou une réservation associée.

- **Préférences utilisateur**
  - Paramétrage des canaux de notification, comme les notifications in-app ou par e-mail.
  - Gestion des règles prévues pour les alertes critiques, notamment celles qui ne devraient pas être désactivables par simple préférence utilisateur.

- **Cycle de vie des notifications**
  - Gestion complète des statuts : `Non lue`, `Lue` et `Archivée`.
  - Conservation de la traçabilité par archivage, sans suppression physique des notifications.

- **Déclenchement automatique selon les scénarios prévus**
  - Facturation : création de facture, retard de paiement.
  - Services : validation ou refus d’un service.
  - Événements : rappels J-7 / J-1, changement de planification, annulation.
  - Invités : RSVP, si ce périmètre est retenu.
  - Paiements : reçu, paiement partiel, échéance dépassée.

- **Règles métier avancées**
  - Lien obligatoire entre une notification et un objet métier.
  - Prévention des redéclenchements tant que l’état sous-jacent demeure inchangé.
  - Paramétrage des types d’alertes par l’administrateur.

---

### Conclusion

Les acteurs visés par la spécification, soit l’organisateur, le coordonnateur, la comptabilité, la direction optionnelle et l’administrateur, ne disposent donc pas encore du dispositif complet de notifications automatiques tel que décrit dans le cahier des charges.

Le module constitue toutefois une base exploitable pour une amélioration future. Les fonctionnalités restantes pourront être complétées dans une version ultérieure afin d’atteindre pleinement le périmètre prévu initialement.
