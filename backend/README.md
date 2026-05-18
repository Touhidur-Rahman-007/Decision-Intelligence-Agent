# Decision Intelligence Agent - Backend

NestJS API for authentication, decision analysis, Groq integration, and admin reporting.

## Requirements

- Node.js 18+
- PostgreSQL 14+

## Setup

```bash
npm install
cp .env.example .env
```

Update `.env` with your database settings and `GROQ_API_KEY`.

## Run

```bash
# development
npm run start:dev

# production
npm run start:prod
```

## Scripts

- `npm run lint`
- `npm run test`
- `npm run test:e2e`

## API endpoints

Base URL: `http://localhost:3001/api`

- `POST /auth/register`
- `POST /auth/login`
- `GET /users/me`
- `GET /decisions`
- `POST /decisions`
- `GET /decisions/:id`
- `DELETE /decisions/:id`
- `GET /admin/users`
- `GET /admin/decisions`

## Swagger

Swagger UI is available at `http://localhost:3001/api/docs` when `NODE_ENV` is not `production`.
