# InterviewFlow API

A production-style REST API for managing job openings, candidates, and interview pipelines.

The project is intentionally small enough to understand end-to-end, while still demonstrating practical backend engineering patterns with **Node.js, Express, PostgreSQL, authentication, validation, Docker, testing, and CI**.

## Features

- User registration and login with JWT authentication
- Password hashing with bcrypt
- Create, read, update, and delete job openings
- Add candidates to jobs
- Move candidates through hiring stages
- Filter candidates by stage and score
- Per-job pipeline summary
- PostgreSQL relational data model
- Input validation with Zod
- Centralized error handling
- Helmet, CORS, API rate limiting, and request logging
- Docker Compose for local PostgreSQL
- Jest + Supertest tests
- GitHub Actions CI for linting and tests

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Database Driver:** `pg`
- **Authentication:** JWT + bcrypt
- **Validation:** Zod
- **Testing:** Jest + Supertest
- **Infrastructure:** Docker Compose
- **CI:** GitHub Actions

## Architecture

```text
Client
  |
  v
Express Routes
  |
  +--> Authentication Middleware
  |
  +--> Zod Validation
  |
  v
Controllers
  |
  v
PostgreSQL
```

The project is separated into routes, controllers, validation, middleware, and infrastructure configuration so application concerns remain easy to understand and maintain.

## Project Structure

```text
interviewflow-api/
├── .github/
│   └── workflows/
│       └── ci.yml
├── db/
│   └── init.sql
├── src/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── candidate.controller.js
│   │   └── job.controller.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── validate.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── candidate.routes.js
│   │   └── job.routes.js
│   ├── utils/
│   │   ├── asyncHandler.js
│   │   └── jwt.js
│   ├── validators/
│   │   ├── auth.validators.js
│   │   ├── candidate.validators.js
│   │   └── job.validators.js
│   ├── app.js
│   └── server.js
├── tests/
│   └── health.test.js
├── .env.example
├── .gitignore
├── docker-compose.yml
├── eslint.config.js
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

Install:

- Node.js 20+
- npm
- Docker Desktop or Docker Engine
- Git

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/interviewflow-api.git
cd interviewflow-api
```

### 2. Install dependencies

```bash
npm install
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

Default development values:

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

The database tables are created automatically from `db/init.sql` when the PostgreSQL volume is initialized for the first time.

### 5. Start the API

Development mode:

```bash
npm run dev
```

Production-style mode:

```bash
npm start
```

API:

```text
http://localhost:4000
```

Health check:

```text
GET http://localhost:4000/health
```

## API Endpoints

### Authentication

#### Register

```http
POST /api/auth/register
```

Request:

```json
{
  "name": "Aryan Singhal",
  "email": "aryan@example.com",
  "password": "password123"
}
```

#### Login

```http
POST /api/auth/login
```

Request:

```json
{
  "email": "aryan@example.com",
  "password": "password123"
}
```

The response contains a JWT token.

For authenticated endpoints, send:

```http
Authorization: Bearer YOUR_TOKEN
```

---

### Jobs

#### Create a job

```http
POST /api/jobs
```

```json
{
  "title": "Software Engineer",
  "department": "Engineering",
  "location": "Remote"
}
```

#### List jobs

```http
GET /api/jobs
```

Each job also includes its current candidate count.

#### Get one job

```http
GET /api/jobs/:id
```

#### Update a job

```http
PATCH /api/jobs/:id
```

Example:

```json
{
  "status": "PAUSED"
}
```

Allowed job statuses:

- `OPEN`
- `PAUSED`
- `CLOSED`

#### Delete a job

```http
DELETE /api/jobs/:id
```

Deleting a job also deletes its candidates through PostgreSQL cascading foreign keys.

---

### Candidates

#### Add a candidate

```http
POST /api/jobs/:jobId/candidates
```

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "score": 82,
  "notes": "Strong backend fundamentals."
}
```

#### List candidates

```http
GET /api/jobs/:jobId/candidates
```

Optional filters:

```text
GET /api/jobs/:jobId/candidates?stage=INTERVIEW&minScore=75
```

#### Update candidate stage, score, or notes

```http
PATCH /api/candidates/:id
```

```json
{
  "stage": "INTERVIEW",
  "score": 88
}
```

Allowed candidate stages:

- `APPLIED`
- `SCREENING`
- `INTERVIEW`
- `OFFER`
- `HIRED`
- `REJECTED`

#### Pipeline summary

```http
GET /api/jobs/:jobId/pipeline-summary
```

Example response:

```json
{
  "jobId": "uuid",
  "totalCandidates": 8,
  "stages": [
    {
      "stage": "APPLIED",
      "count": 3
    },
    {
      "stage": "INTERVIEW",
      "count": 4
    },
    {
      "stage": "OFFER",
      "count": 1
    }
  ]
}
```

## Example cURL Workflow

### Register

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Aryan Singhal","email":"aryan@example.com","password":"password123"}'
```

Copy the returned token.

### Create a job

```bash
curl -X POST http://localhost:4000/api/jobs \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Software Engineer","department":"Engineering","location":"Remote"}'
```

### List jobs

```bash
curl http://localhost:4000/api/jobs \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Testing

Run:

```bash
npm test
```

The included tests cover the health route and 404 handling without requiring a running database.

## Linting

```bash
npm run lint
```

## Resetting the Local Database

If you want to delete all local PostgreSQL data and recreate the schema:

```bash
docker compose down -v
docker compose up -d
```

**Warning:** this deletes the local development database volume.

## CI/CD

A GitHub Actions workflow is included in:

```text
.github/workflows/ci.yml
```

On pushes and pull requests to `main`, GitHub automatically:

1. Checks out the repository
2. Installs Node.js 20
3. Installs dependencies
4. Runs ESLint
5. Runs the Jest test suite

## Design Decisions

### Why PostgreSQL?

The domain has clear relationships:

- one user owns many jobs
- one job contains many candidates

PostgreSQL provides foreign keys, unique constraints, indexes, and reliable transactional behavior.

### Why JWT?

JWT authentication keeps the API stateless and is straightforward for frontend or mobile clients to consume.

### Why Zod?

Validation happens before controller logic, preventing malformed requests from reaching database operations.

### Why separate routes and controllers?

It keeps HTTP routing separate from application logic and makes the codebase easier to test and extend.

## Possible Extensions

This project is intentionally scoped. Natural next steps would include:

- React dashboard
- refresh tokens
- pagination
- role-based authorization
- interview scheduling
- candidate activity history
- email notifications
- OpenAPI / Swagger docs
- Redis caching
- deployment to AWS

## Resume Description

**InterviewFlow API — Node.js, Express, PostgreSQL, Docker, JWT**

- Built a production-style REST API for job and candidate workflow management using **Node.js, Express, and PostgreSQL**, implementing authenticated CRUD operations, relational data modeling, filtering, and pipeline analytics.
- Added **JWT authentication, bcrypt password hashing, Zod validation, centralized error handling, database constraints/indexes, and API security middleware** for reliable request processing.
- Containerized PostgreSQL with **Docker Compose** and configured **GitHub Actions CI** to automatically run ESLint and Jest/Supertest tests on pushes and pull requests.

## License

MIT
