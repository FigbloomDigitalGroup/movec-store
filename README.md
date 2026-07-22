# Movec Store

Movec Store is a modern e-commerce platform for technology products and services, including Starlink internet solutions, CCTV surveillance systems, networking equipment, and smart devices.

## Project Structure

```
movec-store/
├── backend/     # NestJS API (Node.js + Prisma + PostgreSQL)
└── frontend/    # React + Vite frontend
```

## Tech Stack

### Frontend
- React 19 + TypeScript
- Vite
- TailwindCSS
- React Router DOM
- Zustand (state management)
- Framer Motion + GSAP (animations)
- React Query

### Backend
- NestJS (Node.js)
- Prisma ORM
- PostgreSQL
- Stripe, M-Pesa, PayPal payments
- Brevo / Nodemailer (email)
- Cloudinary (image uploads)
- JWT authentication

## Getting Started

### Backend
```bash
cd backend
npm install
npx prisma migrate dev
npm run start:dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Features
- Product catalog (Starlink kits, CCTV systems, networking equipment, accessories)
- Shopping cart & wishlist
- Multiple payment methods (M-Pesa, Stripe, PayPal, bank transfer)
- Order management & tracking
- Installation service booking
- Admin dashboard with reports & inventory management
- User authentication & profiles
- Email notifications

## License
UNLICENSED — Proprietary
