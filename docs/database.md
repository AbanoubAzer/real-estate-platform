# Database Architecture

The platform uses **PostgreSQL** configured via **Prisma ORM**.

## Core Schema Layout
- UUIDs are used for primary keys where appropriate.
- Indexes on `agentId`, `status`, `cityId`, `price`, etc.
- Pgvector readiness for property embeddings.

## Security
- Do not store plain text passwords; use bcrypt for hashing.
- Never expose JWT secrets.
- Use the DB for strict role/permission validations instead of relying on frontend states.
