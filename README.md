# Decision Intelligence Agent (DIA)

Full-stack decision analysis platform powered by Groq. Users submit a scenario, the backend generates a structured multi-dimensional analysis, and the frontend reveals the results in a cinematic, section-by-section UI.

## Stack

- Frontend: Next.js App Router (React 19)
- Backend: NestJS + TypeORM
- Database: PostgreSQL
- LLM: Groq API (llama-3.3-70b-versatile)

## Quick start

```bash
# backend
cd backend
npm install
cp .env.example .env
npm run start:dev

# frontend (new terminal)
cd ../frontend
npm install
cp .env.example .env
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001/api
- Swagger: http://localhost:3001/api/docs

## Environment

Backend `.env.example` includes:
- `DATABASE_*` (PostgreSQL connection)
- `JWT_SECRET` / `JWT_EXPIRES_IN`
- `GROQ_API_KEY` / `GROQ_MODEL` / `GROQ_TIMEOUT_MS`

Frontend `.env.example` includes:
- `NEXT_PUBLIC_API_BASE`
