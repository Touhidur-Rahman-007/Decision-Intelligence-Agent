# Decision Intelligence Agent - Frontend

Next.js App Router UI for the Decision Intelligence Agent.

## Requirements

- Node.js 18+

## Setup

```bash
npm install
cp .env.example .env
```

Update `NEXT_PUBLIC_API_BASE` if your backend runs on a different host/port.

## Run

```bash
npm run dev
```

Open `http://localhost:3000`.

## Pages

- `/` landing
- `/auth/login` and `/auth/register`
- `/dashboard`
- `/decision/new`
- `/decision/[id]/analysis`
- `/admin`
