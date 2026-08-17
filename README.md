# Real Estate Platform

A production-ready Real Estate SaaS platform built with React, NestJS, and PostgreSQL.

## Monorepo Architecture
This project uses a monorepo approach with NPM Workspaces.
- `apps/web`: Frontend React application (Vite, TypeScript, Tailwind CSS)
- `apps/api`: Backend API application (NestJS, Prisma, PostgreSQL)
- `packages/shared`: Shared utilities and code
- `packages/types`: Shared TypeScript definitions
- `packages/config`: Shared configuration files (ESLint, Prettier, TSConfig)

## Requirements
- Node.js (v18+)
- PostgreSQL (pgvector support recommended)
- Redis

## Setup Instructions

1. **Environment Configuration**
   Copy `.env.example` to `.env` in the root and fill out the necessary values:
   ```bash
   cp .env.example .env
   ```

2. **Install Dependencies**
   Run the following command at the root to install dependencies for all workspaces:
   ```bash
   npm install
   ```

3. **Running PostgreSQL & Redis**
   Make sure you have a running instance of PostgreSQL (preferably with pgvector extension) and Redis. Update the `DATABASE_URL` and `REDIS_URL` in your `.env` file.

4. **Database Setup**
   Run Prisma migrations to set up the database schema:
   ```bash
   cd apps/api
   npx prisma generate
   npx prisma migrate dev
   ```

## Running the Applications

### Frontend (React)
```bash
npm run dev:web
```

### Backend (NestJS)
```bash
npm run dev:api
```
