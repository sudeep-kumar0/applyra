# Applyra — Unified Job Search, Resume Matching, Application Tracking & Analytics

> **Search. Match. Apply. Track.**  
> *Your entire job search. One place.*

Applyra is a production-oriented SaaS platform engineered for job seekers to discover verified opportunities, evaluate deterministic ATS resume match scores, apply directly on official employer career portals, and track every application round in one dashboard.

---

## 🌟 Core Pillars

1. **Free-First Public Experience**
   - No forced login walls on the homepage.
   - Visitors can browse, search, and inspect full job details and requirements without creating an account.
   - Authentication is required only for contextual, user-specific actions (e.g., Saving a Job, ATS Resume Matching, Application Tracking).

2. **Deterministic & Explainable ATS Matching**
   - Transparent scoring breakdown: Skills (30%), Keywords (20%), Experience (20%), Education (10%), Projects (10%), Structure (10%).
   - Truthful recommendations without fabricating credentials or false claims.

3. **Official Employer Redirects**
   - Applyra never scrapes user credentials or uses bot form scripts.
   - Users apply directly on official company career portals or authorized ATS feeds.
   - "Did You Apply?" confirmation dialog captures applied roles automatically into the application tracker.

4. **Private Resume Vault**
   - Resumes are stored in private Supabase Storage buckets (`resumes`), never publicly accessible.
   - Time-limited signed URLs are used for secure, isolated access.

5. **Multi-Platform Ready**
   - Unified REST API architecture built with NestJS & MongoDB Atlas.
   - Ready for web (Next.js 14) and future mobile (React Native + Expo).

---

## 🏗️ Architecture

```text
                    APPLYRA

           Next.js 14 (App Router)
                    │
                    ▼
          NestJS Backend REST API (/api/v1)
                    │
          ┌─────────┴─────────┐
          │                   │
          ▼                   ▼
     MongoDB Atlas       Supabase Auth
          │                   │
          │                   ├─ Email/Password Signup
          │                   ├─ Email Verification
          │                   ├─ Login / Logout
          │                   └─ Password Reset
          │
          └── Application Data
              (users, profiles, jobs, applications, savedJobs, atsAnalyses)

          Supabase Storage
                 │
                 └── Private "resumes" Bucket
```

---

## 📁 Project Structure

```text
applyra/
├── frontend/                     # Next.js 14 App Router Frontend
│   ├── app/                      # App pages (Landing, /jobs, /dashboard, /admin, etc.)
│   ├── components/               # Reusable UI components & modals (ContextualAuthModal, Navbar, Footer)
│   ├── context/                  # AuthContext (Supabase Auth + MongoDB sync)
│   ├── lib/                      # Supabase client & API client helpers
│   └── public/                   # Favicon & vector assets
│
├── backend/                      # NestJS REST API Backend
│   ├── src/
│   │   ├── auth/                 # Supabase Auth guard, Admin guard, Auth controller
│   │   ├── users/                # MongoDB user schema & service
│   │   ├── profiles/             # MongoDB profile schema, controller & service
│   │   ├── jobs/                 # MongoDB jobs schema, public search & realistic seed data
│   │   ├── admin/                # Admin-only endpoints & stats
│   │   ├── storage/              # Supabase private storage integration
│   │   └── common/               # Health check & exception sanitization
│   └── scripts/
│       ├── migrate-db.js         # Automated schema migration & backfill runner
│       └── create-admin.ts       # Secure server-side CLI script to provision admins
│
├── docs/                         # Technical specifications & guides
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── SECURITY.md
│
├── .env.example                  # Environment configuration template
├── .gitignore
├── SETUP.md                      # Detailed step-by-step local setup instructions
└── README.md
```

---

## 🚀 Quick Start (Phase 1)

### 1. Prerequisites
- **Node.js**: v18+ (v20+ recommended)
- **npm**: v9+
- **MongoDB Atlas**: Free tier or local MongoDB connection URI
- **Supabase**: Project URL and Anon Key (Auth & Storage)

### 2. Configure Environment Variables
Copy `.env.example` to `.env` in the root:
```bash
cp .env.example .env
```
Fill in your credentials:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/applyra?retryWrites=true&w=majority
SUPABASE_URL=https://mytywaubhmpmyyblofri.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
STORAGE_BUCKET=resumes
```

### 3. Run Backend (Port 5000)
```bash
cd backend
npm install
npm run db:migrate
npm run start:dev
```
Health Check: `http://localhost:5000/api/v1/health`  
Public Jobs API: `http://localhost:5000/api/v1/jobs`

### 4. Run Frontend (Port 3000)
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛡️ Admin Security Policy

- **No Public Admin Registration**: Public signups strictly assign `role = USER` and `is_admin = false`.
- **Backend Admin CLI**: To grant administrator rights to an account, run:
  ```bash
  cd backend
  npm run create-admin -- --email admin@example.com
  ```
- **Guarded Endpoints**: Normal users accessing `/admin` or `/api/v1/admin/*` receive `403 Forbidden`.

---

## 📜 License
Proprietary & Confidential — Applyra Platform.
