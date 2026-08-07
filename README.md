# Movec Store

E-commerce platform for Starlink and CCTV products built with NestJS and React.

## 🚀 Quick Start

```bash
# Clone repository
git clone <repository-url>
cd movec-store

# Backend setup
cd backend
npm install
npx prisma migrate deploy
npx prisma generate
npx prisma db seed
npm run start:dev

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev
```

Visit:
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3000
- **Admin:** http://localhost:5173/admin

Default admin: `admin@movec.co.ke` / `admin123`

## 📚 Documentation

Complete documentation is in the [`docs/`](./docs) folder:

- **[Project Setup](./docs/01-PROJECT-SETUP.md)** - Installation & configuration
- **[Deployment](./docs/02-DEPLOYMENT.md)** - Production deployment
- **[Homepage Banners](./docs/03-HOMEPAGE-BANNERS.md)** - Banner management
- **[Product Cards](./docs/04-PRODUCT-CARDS.md)** - Product UI components
- **[Database](./docs/06-DATABASE.md)** - Schema & migrations

## 🛠️ Tech Stack

### Backend
- NestJS - REST API framework
- PostgreSQL - Database
- Prisma - ORM
- JWT - Authentication
- Cloudinary - Image storage

### Frontend
- React 18 + TypeScript
- React Router - Navigation
- React Query - Data fetching
- Tailwind CSS - Styling
- Framer Motion - Animations

## ✨ Features

- 🛍️ Product catalog with categories
- 🛒 Shopping cart & wishlist
- 💳 Multiple payment methods (M-Pesa, Paystack, PayPal)
- 📦 Order tracking
- 👤 User authentication
- 🎨 Admin dashboard
- 📱 Responsive design
- 🎯 Dynamic homepage banners
- 📸 Image management with Cloudinary
- 🔍 Product search & filters

## 🌐 Live Sites

- **Frontend:** https://your-site.vercel.app
- **Backend:** https://your-api.onrender.com

## 📝 License

Proprietary - All rights reserved
