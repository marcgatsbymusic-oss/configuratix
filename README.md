# Installation Execution Platform & Window Configurator

This repository is a monorepo containing the Drutex Window Configurator and the Installation Execution Platform module.

## Workspace Layout

- `apps/configurator/`: Existing React window configurator
- `apps/back-office/`: React web app for installation administration and operations
- `apps/backend/`: Node.js modular monolith providing the backend for the installation platform
- `apps/mobile/`: Flutter mobile app for installers
- `packages/shared/`: Shared TS types and API contracts

## Local Development Setup

### Prerequisites
- Node.js (v20+)
- Docker & Docker Compose
- Flutter SDK (for mobile app development)

### Getting Started

1. **Start the database:**
   ```bash
   docker compose up -d
   ```
   This starts a PostgreSQL instance with the PostGIS extension enabled on port 5432.

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the stack:**
   ```bash
   npm run dev
   ```
   This will concurrently start the `configurator`, `back-office`, and `backend` servers.

### Architecture Constraints
- The Installation Platform is a module of the configurator with its own access boundary (OIDC).
- Business logic is strictly housed in the backend.
- Mobile operates offline-first with an outbox sync pattern.

See `docs/spec/installation-execution-spec.md` for full functional requirements.
