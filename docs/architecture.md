# Architecture Documentation

## Epic Architecture
The system is structured around 19 epics, designed as a Modular Monolith. Each epic can evolve independently without tight coupling.
- E01 — Property Management
- E02 — Property Media
- E03 — Search & Filtering
- E04 — Property Details
- E05 — Anonymous Visitor
- E06 — Authentication & User Profile
- E07 — Favorites & Saved Searches
- E08 — Viewing & Recommendations
- E09 — Agents / Owners
- E10 — Leads & Contact
- E11 — Notifications
- E12 — Admin Dashboard & Platform Management
- E13 — Location & Maps
- E14 — Security / Roles / Permissions
- E15 — Analytics & Reporting
- E16 — Payments & Monetization
- E17 — CMS & Content Management
- E18 — Documents & Verification
- E19 — AI Search & Recommendation Engine

## Frontend Architecture
- **React + Vite** with a feature-based architecture.
- Modules are grouped by features (`apps/web/src/features/*`), avoiding giant global component folders.
- **Tailwind CSS** with semantic design tokens for styling, utilizing primary navy (`#152D5B`) and accent orange (`#EF8D00`).
- RTL/LTR support via logical CSS properties (`margin-inline`, `padding-inline`) and `dir="rtl"`.
- Typography: GE SS for Arabic, Poppins for English.

## Backend Architecture
- **NestJS** following a Modular Monolith architecture.
- Feature modules inside `apps/api/src/` (e.g., `properties`, `users`, `auth`).
- **Prisma ORM** connecting to a **PostgreSQL** database.
- AI Search is decoupled from direct SQL access, outputting structured search intents.
- Event architecture using **Redis** and **BullMQ** for async tasks.
