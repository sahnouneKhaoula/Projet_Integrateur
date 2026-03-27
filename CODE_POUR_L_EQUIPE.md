# Guide du code — Projet Intégrateur (Hôtel / Événements)

Ce document aide à **naviguer** le dépôt. Les détails sont aussi dans les **commentaires** des fichiers `.js` / `.jsx`.

## Structure des dossiers

| Dossier | Rôle |
|--------|------|
| `src/Backend/` | API **Express** (Node.js), connexion **SQL Server** (`mssql`), authentification **JWT**. |
| `src/Backend/routes/` | Définit les **URL** (`/api/...`) et branche les **middlewares** + **contrôleurs**. |
| `src/Backend/controllers/` | **Logique métier** : requêtes SQL, réponses JSON, erreurs HTTP. |
| `src/Backend/middleware/` | **authMiddleware** : vérifie le token JWT (`verifierToken`) et le rôle admin (`verifierAdmin`). |
| `src/Backend/db/` | Connexion pool (`db.js`) + scripts **SQL** de schéma si présents. |
| `src/Frontend/` | Application **React** (Vite), interface publique + **dashboard** staff. |
| `src/Frontend/src/pages/` | Pages **publiques** (accueil, chambres, services, connexion…). |
| `src/Frontend/src/components/` | Blocs réutilisables + **écrans admin** (Dashboard, Événements, etc.). |

## Flux typique (Backend)

1. Le client envoie une requête HTTP → **Express** (`server.js`).
2. La route correspondante dans `routes/*.js` choisit les middlewares (ex. token obligatoire).
3. Le **contrôleur** exécute la logique et parle à la base via `poolPromise` (`db/db.js`).
4. La réponse est du **JSON** (`res.json(...)`) avec un **code HTTP** (200, 401, 403, 500…).

## Flux typique (Frontend)

1. `main.jsx` monte l’app et charge les **styles** globaux.
2. `routes.jsx` définit les **URLs** : site public sous `Layout` (navbar + footer), `/connexion`, `/dashboard` (app admin complète dans `App.jsx`).
3. Les pages appellent le backend avec `fetch` vers `/api/...` (souvent avec `Authorization: Bearer <token>` stocké après login).

## Fichiers à lire en premier

- **Backend :** `server.js`, `db/db.js`, `middleware/authMiddleware.js`, `routes/usersRoutes.js`, `controllers/usersController.js`.
- **Frontend :** `main.jsx`, `routes.jsx`, `components/Layout.jsx`, `App.jsx`, `pages/Connexion.jsx`.

## Variables d’environnement (Backend)

Fichier `src/Backend/.env` (non versionné) : `PORT`, `DB_*`, `JWT_SECRET`. Sans base ou `.env`, l’API ne démarre pas correctement.

---

## Commentaires dans le code

Des **blocs de commentaire** ont été ajoutés en français dans les fichiers principaux :

- **Backend :** `server.js`, `db/db.js`, `middleware/authMiddleware.js`, chaque fichier dans `routes/`, chaque `controllers/*.js`, `seed.js`.
- **Frontend :** `main.jsx`, `routes.jsx`, `App.jsx`, `Layout`, pages (`Accueil`, `Chambres`, `Services`, `Connexion`, `Inscription`), composants de base (`Bouton`, `Carte`, `ImageAvecRepli`, `Navbar`), `Dashboard`, `Evenements`, `vite.config.js`.

Les fichiers très longs (ex. gros JSX) utilisent surtout un **commentaire d’en-tête** ; le détail reste dans les noms de fonctions et ce guide.

---

*Pour aller plus loin : ouvrir chaque fichier — les commentaires en tête de fichier expliquent le rôle du module.*
