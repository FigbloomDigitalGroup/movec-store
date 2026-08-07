# Project Setup Guide

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Git

## Installation

### 1. Clone Repository
```bash
git clone <repository-url>
cd movec-store
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/movec_db"
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### 3. Database Setup
```bash
# Run migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# Seed database
npx prisma db seed
```

### 4. Frontend Setup
```bash
cd ../frontend
npm install
```

Create `.env` file:
```env
VITE_API_URL=http://localhost:3000
```

## Running Locally

### Start Backend
```bash
cd backend
npm run start:dev
```
Backend runs on `http://localhost:3000`

### Start Frontend
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:5173`

## Default Admin Credentials

After seeding, login with:
- **Email:** `admin@movec.co.ke`
- **Password:** `admin123`

⚠️ **Change these credentials immediately in production!**

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URL in .env
- Ensure database exists

### Build Errors
- Delete node_modules and reinstall
- Clear npm cache: `npm cache clean --force`
- Verify Node.js version

### Port Already in Use
- Backend: Change port in `main.ts`
- Frontend: Vite will auto-assign another port
