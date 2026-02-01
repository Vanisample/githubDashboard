# Team Health Dashboard

AI-powered Team Health Dashboard (backend + frontend) starter scaffold for Vanisample/githubDashboard.

Contents:
- server/: Express API that serves weekly metrics and computes subscores + THI
- frontend/: React app (minimal) that fetches the API and displays THI line
- db/: Postgres schema and seed data (4 weeks of dummy metrics)
- docker-compose.yml to run Postgres + server + frontend locally

Quickstart (local):
1. Copy `.env.example` to `.env` under server/ and set DATABASE_URL
2. Run: docker-compose up --build
3. Server: http://localhost:4000
4. Frontend: http://localhost:3000

License: MIT