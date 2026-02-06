# Events Space

Plateforme de gestion d'événements avec authentification, rôles, réservations et tickets PDF.

## Prérequis

- Node.js 20+
- Docker Desktop (pour PostgreSQL)
- npm

## Installation rapide

1. **Cloner le projet**
2. **Démarrer PostgreSQL**
   ```bash
   docker compose up -d
   ```
3. **Backend**
   ```bash
   cd backend
   npm install
   npx prisma generate
   npx prisma migrate deploy
   # optionnel: PORT=3001 pour éviter le conflit avec Next.js
   npm run start:dev
   ```
4. **Frontend**
   ```bash
   cd frontend
   npm install
   # optionnel: NEXT_PUBLIC_API_URL=http://localhost:3001
   npm run dev
   ```

## Variables d'environnement

Un exemple minimal (à placer dans `backend/.env` ou à la racine) :

```
DATABASE_URL=postgresql://admin:admin@127.0.0.1:5433/events_space
JWT_SECRET=dev_super_secret_change_me
JWT_EXPIRES_IN=1h
PORT=3001
CORS_ORIGINS=http://localhost:3000
```

Pour Docker :

```
POSTGRES_DB=events_space
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin
POSTGRES_PORT=5433
```

Frontend (optionnel) :

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Scripts principaux

Backend :

- `npm run start:dev` : mode développement
- `npm run build` : build TypeScript
- `npm run test` : tests unitaires

Frontend :

- `npm run dev` : mode développement
- `npm run build` : build Next.js

## Endpoints clés (backend)

Auth :

- `POST /auth/register` : créer un compte
- `POST /auth/login` : se connecter

Événements :

- `POST /events` (ADMIN) : créer un événement
- `PATCH /events/:id` (ADMIN) : modifier un événement
- `POST /events/:id/publish` (ADMIN) : publier un événement
- `POST /events/:id/cancel` (ADMIN) : annuler un événement
- `GET /events` : liste des événements publiés
- `GET /events/:id` : détail d'un événement publié

Réservations :

- `POST /reservations` : demander une réservation
- `GET /reservations/me` : mes réservations
- `POST /reservations/:id/confirm` (ADMIN) : confirmer
- `POST /reservations/:id/refuse` (ADMIN) : refuser
- `POST /reservations/:id/cancel` : annuler
- `GET /reservations/:id/ticket` : ticket PDF (si confirmé)

Stats :

- `GET /stats/overview` (ADMIN)
- `GET /stats/occupancy` (ADMIN)

## Structure du repo

- `backend/` : API NestJS + Prisma
- `frontend/` : UI Next.js
- `UML/` : diagrammes
