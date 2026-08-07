# Movec Store Documentation

Complete documentation for the Movec e-commerce platform.

## 📚 Documentation Index

### Getting Started
- [Project Setup](./01-PROJECT-SETUP.md) - Installation, configuration, and local development
- [Deployment Guide](./02-DEPLOYMENT.md) - Production deployment instructions

### Features
- [Homepage Banners](./03-HOMEPAGE-BANNERS.md) - Dynamic banner management system
- [Compact Product Cards](./04-PRODUCT-CARDS.md) - Product display components
- [Image Management](./05-IMAGE-MANAGEMENT.md) - Cloudinary integration and image handling

### Development
- [Database & Seed Data](./06-DATABASE.md) - Prisma schema, migrations, and seeding
- [API Reference](./07-API-REFERENCE.md) - Backend endpoints and usage

---

## Quick Links

### For Developers
1. **Local Setup:** See [Project Setup](./01-PROJECT-SETUP.md)
2. **Database Setup:** See [Database Guide](./06-DATABASE.md)
3. **Feature Implementation:** See relevant feature docs

### For Admins
1. **Banner Management:** See [Homepage Banners](./03-HOMEPAGE-BANNERS.md)
2. **Product Management:** Use admin dashboard at `/admin/products`
3. **Order Management:** Use admin dashboard at `/admin/orders`

### For DevOps
1. **Deployment:** See [Deployment Guide](./02-DEPLOYMENT.md)
2. **Environment Setup:** See deployment guide for env variables
3. **Domain Setup:** See deployment guide for custom domain

---

## Project Structure

```
movec-store/
├── backend/               # NestJS backend
│   ├── prisma/           # Database schema & migrations
│   ├── src/              # Source code
│   └── dist/             # Built files
├── frontend/             # React frontend
│   ├── src/              # Source code
│   └── dist/             # Built files
├── docs/                 # Documentation (you are here)
└── README.md             # Project overview
```

---

## Technology Stack

### Backend
- **Framework:** NestJS
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Auth:** JWT
- **File Storage:** Cloudinary
- **Deployment:** Render

### Frontend
- **Framework:** React 18 + TypeScript
- **Routing:** React Router v6
- **State:** React Query + Zustand
- **Styling:** Tailwind CSS
- **Icons:** React Icons
- **Animations:** Framer Motion
- **Deployment:** Vercel

---

## Support

For questions or issues:
1. Check relevant documentation section
2. Review troubleshooting guides
3. Contact development team

---

**Last Updated:** 2026-08-07  
**Version:** 1.0.0
