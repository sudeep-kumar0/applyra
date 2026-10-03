# Applyra Production Deployment Guide

Applyra is designed for seamless modern cloud deployment:
- **Frontend**: Vercel or AWS Amplify (Next.js 14)
- **Backend**: Render, Railway, AWS ECS, or DigitalOcean App Platform (Node.js/NestJS)
- **Database**: MongoDB Atlas (Managed Cloud Cluster)
- **Auth & Storage**: Supabase Cloud

---

## 1. Environment Variables Checklist

Ensure these variables are configured in your production hosting dashboards:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `MONGODB_URI` | MongoDB Atlas cluster connection URI | `mongodb+srv://...` |
| `SUPABASE_URL` | Supabase Project URL | `https://mytywaubhmpmyyblofri.supabase.co` |
| `SUPABASE_ANON_KEY` | Public client API key | `eyJhbGciOi...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret backend administration key | `eyJhbGciOi...` |
| `STORAGE_BUCKET` | Supabase private resume bucket name | `resumes` |
| `PORT` | Backend listening port | `5000` |
| `FRONTEND_URL` | Deployed Frontend domain for CORS | `https://applyra.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | Frontend Supabase URL | `https://mytywaubhmpmyyblofri.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Frontend Supabase Anon Key | `eyJhbGciOi...` |
| `NEXT_PUBLIC_API_URL` | Frontend Backend API endpoint | `https://api.applyra.com/api/v1` |

---

## 2. Backend Deployment (e.g. Render / Railway)

1. Root Directory: `backend`
2. Build Command: `npm install && npm run build`
3. Start Command: `node dist/main`
4. Configure Health Check: `/api/v1/health`

---

## 3. Frontend Deployment (e.g. Vercel)

1. Root Directory: `frontend`
2. Framework Preset: Next.js
3. Build Command: `npm run build`
4. Output Directory: `.next`

---

## 4. Production Database Indexes

MongoDB indexes configured automatically on bootstrap:
- `users`: `supabaseUserId` (unique), `email` (unique)
- `jobs`: `slug` (unique), `category`, `location`, `workMode`, `jobType`, `skills`, `postedAt`
- `profiles`: `userId` (unique)
