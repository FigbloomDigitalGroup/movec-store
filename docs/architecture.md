# System Architecture

## Overview
This document outlines the architecture of the Starlink & CCTV E-Commerce System – a multi‑role platform serving customers, technicians, and administrators. The system follows a **Clean Architecture** with clear separation between presentation, application, domain, and infrastructure layers.

## High‑Level Architecture
Client (React + Vite) → CDN/Edge (Vercel)
|
↓ HTTPS
Backend (NestJS on Render) → PostgreSQL (Render managed)
| → Cloudinary (media storage)
↓
External APIs:

M‑Pesa Daraja API

Stripe

PayPal

SMS gateway

Email service (SendGrid/Mailgun)

text

## Tech Stack Rationale

| Layer         | Technology          | Why                                                                 |
|---------------|---------------------|---------------------------------------------------------------------|
| Frontend      | React, Vite, Tailwind | Fast dev, CSS utility‑first, component‑based UI.                   |
| State         | Zustand + TanStack Query | Lightweight global state; server‑state caching & sync.           |
| Forms         | React Hook Form + Zod | Performant forms with schema validation.                         |
| Backend       | NestJS              | Modular, TypeScript‑native, decorator‑based, enterprise patterns. |
| ORM           | Prisma              | Type‑safe database access, easy migrations, great DX.              |
| Database      | PostgreSQL          | ACID compliant, JSON support, full‑text search, reliable.          |
| Auth          | JWT (access + refresh) | Stateless auth, RBAC, refresh rotation.                          |
| Payments      | M‑Pesa, Stripe, PayPal | Local (Kenya) and global payment methods.                        |
| Media         | Cloudinary          | On‑the‑fly transformations, secure delivery.                       |
| Deployment    | Vercel (frontend), Render (backend) | Zero‑config, auto‑deploy, free tier to start.       |

## Layered Backend Architecture (Clean Architecture)
Presentation → Controllers (NestJS)
Application → Use Cases / Services
Domain → Entities (Prisma models)
Infrastructure → Repositories, external APIs, DB

text

- **Controllers** handle HTTP, validation via Zod/Pipes.
- **Services** contain business logic, orchestrate use cases.
- **Repositories** abstract Prisma queries.
- **Guards & Decorators** enforce RBAC.

## Security Layers
- Helmet for secure headers.
- CORS configured for frontend domain.
- Rate limiting (ThrottlerModule).
- Input validation & sanitisation (class‑validator + Zod).
- JWT with short‑lived access tokens (15 min) and long‑lived refresh tokens (7 days).
- Password hashing with bcrypt (12 rounds).
- SQL injection prevention via Prisma’s parameterised queries.
- XSS protection by React’s default escaping.
- HTTPS enforced in production.

## Deployment Topology
- **Frontend**: Vercel, connected to GitHub repo, auto‑deploys on push to main.
- **Backend**: Render Web Service, Dockerfile or Node runtime, auto‑deploy.
- **Database**: Render PostgreSQL (or external), firewall rules restrict access.
- **Media**: Cloudinary cloud storage, accessed via signed URLs.

## Key Design Decisions
- **No server‑side sessions**: Stateless JWT, refresh tokens stored in DB and rotated.
- **SKU auto‑generation**: Format `CAT-BRAND-XXXX` for products.
- **Inventory soft‑lock**: During checkout, quantities are reserved temporarily.
- **Installation as a service**: Separate module with technicians, scheduling, and status tracking.
