# InterviewFlow

InterviewFlow is a compact full-stack recruiting pipeline application built to demonstrate practical product engineering with **React, TypeScript, Node.js, Express, PostgreSQL, Docker, testing, and CI**.

Recruiters can create job openings, add candidates, move candidates through hiring stages, and view stage-level pipeline counts from a responsive React dashboard.

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Responsive CSS

### Backend
- Node.js
- Express.js
- PostgreSQL (`pg`)
- JWT authentication
- bcrypt password hashing
- Zod validation

### Engineering / DevOps
- Docker Compose for PostgreSQL
- Jest + Supertest
- ESLint
- GitHub Actions CI
- Helmet, CORS, rate limiting, centralized error handling

## Features

- Register and log in as a recruiter
- JWT-protected API routes
- Create and list job openings
- Add candidates to a selected job
- Move candidates through:
  - `APPLIED`
  - `SCREENING`
  - `INTERVIEW`
  - `OFFER`
  - `HIRED`
  - `REJECTED`
- View live pipeline counts by stage
- Filter candidates through backend query parameters
- PostgreSQL foreign keys, unique constraints, indexes, and cascading deletes
- Responsive React + TypeScript dashboard
- Automated API lint/tests and frontend production build in GitHub Actions

## Architecture

```text
React + TypeScript Client (Vite)
             |
             | REST / JSON + JWT
             v
       Node.js + Express
             |
             v
         PostgreSQL
```

## Project Structure

```text
interviewflow-api/
├── .github/
│   └── workflows/
│       └── ci.yml
├── client/
│   ├── src/
│   │   ├── api.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── styles.css
│   │   └── types.ts
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── db/
│   └── init.sql
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── utils/
│   ├── validators/
│   ├── app.js
│   └── server.js
├── tests/
│   └── health.test.js
├── .env.example
├── docker-compose.yml
├── eslint.config.js
└── package.json
```

## Local Setup

### Prerequisites

- Node.js 20+
- npm
- Docker Desktop / Docker Engine

### 1. Install API dependencies

```bash
npm install
```

### 2. Install client dependencies

```bash
npm --prefix client install
```

### 3. Create the environment file

macOS/Linux:

```bash
cp .env.example .env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Default development configuration:

```env
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/interviewflow
JWT_SECRET=change_me_in_production
JWT_EXPIRES_IN=1d
NODE_ENV=development
```

### 4. Start PostgreSQL

```bash
docker compose up -d
```

`db/init.sql` initializes the schema the first time the database volume is created.

### 5. Start the API

Terminal 1:

```bash
npm run dev
```

API: `http://localhost:4000`

Health check: `http://localhost:4000/health`

### 6. Start the React client

Terminal 2:

```bash
npm run client:dev
```

Client: `http://localhost:5173`

The client defaults to calling `http://localhost:4000`. To use another backend URL, create `client/.env`:

```env
VITE_API_URL=http://localhost:4000
```

## Useful Commands

```bash
npm run lint
npm test
npm run client:build
npm run check
```

`npm run check` runs backend lint, backend tests, and the React production build.

## API Overview

### Authentication

```http
POST /api/auth/register
POST /api/auth/login
```

Example registration body:

```json
{
  "name": "Aryan Singhal",
  "email": "aryan@example.com",
  "password": "password123"
}
```

Authenticated routes require:

```http
Authorization: Bearer YOUR_TOKEN
```

### Jobs

```http
POST   /api/jobs
GET    /api/jobs
GET    /api/jobs/:id
PATCH  /api/jobs/:id
DELETE /api/jobs/:id
```

### Candidates

```http
POST  /api/jobs/:jobId/candidates
GET   /api/jobs/:jobId/candidates
PATCH /api/candidates/:id
GET   /api/jobs/:jobId/pipeline-summary
```

Candidate filters are supported, for example:

```http
GET /api/jobs/:jobId/candidates?stage=INTERVIEW&minScore=75
```

## Database Model

### `users`
Recruiter accounts with hashed passwords.

### `jobs`
Each job belongs to one recruiter.

### `candidates`
Each candidate belongs to one job. A `(job_id, email)` unique constraint prevents duplicate candidates for the same opening.

Indexes are defined for common ownership, job, and stage lookups.

## CI

`.github/workflows/ci.yml` runs on pushes and pull requests to `main` and performs:

1. API dependency installation
2. React client dependency installation
3. API ESLint checks
4. Jest/Supertest tests
5. TypeScript + Vite production build

## Reset Local PostgreSQL

```bash
docker compose down -v
docker compose up -d
```

This deletes the local development database volume and recreates the schema.

## Resume Summary

**InterviewFlow — React, TypeScript, Node.js, Express, PostgreSQL, Docker**

- Built a full-stack recruiting pipeline with a responsive **React + TypeScript** dashboard and **Node.js/Express REST API**, supporting JWT-authenticated job and candidate workflows.
- Designed a relational **PostgreSQL** data model with foreign keys, constraints, indexes, filtering, and stage-level pipeline analytics; added Zod validation and centralized error handling.
- Containerized PostgreSQL with **Docker Compose** and configured **GitHub Actions CI** to run ESLint, Jest/Supertest tests, and a production frontend build on pushes and pull requests.

## License

MIT
