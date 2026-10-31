# Applyra — Local Development & Setup Guide (Phase 1)

This guide walks you through setting up and running Applyra locally.

---

## 1. System Requirements

- **Node.js**: v18.0.0 or higher (Tested with v24.19.0)
- **npm**: v9.0.0 or higher
- **MongoDB Atlas**: MongoDB connection URI (or local MongoDB 6.0+)
- **Supabase Account**:
  - Project Reference: `mytywaubhmpmyyblofri`
  - Project URL: `https://mytywaubhmpmyyblofri.supabase.co`

---

## 2. Environment Configuration

Create a `.env` file in the root directory (you can copy `.env.example`):

```bash
cp .env.example .env
```

Set the following values in `.env`:

```env
# MongoDB Atlas (or local: mongodb://127.0.0.1:27017/applyra_dev)
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/applyra?retryWrites=true&w=majority

# Supabase Auth & Storage
SUPABASE_URL=https://mytywaubhmpmyyblofri.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Storage
STORAGE_BUCKET=resumes

# Network Ports & URLs
PORT=5000
APP_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000

# Next.js Environment Variables (Frontend)
NEXT_PUBLIC_SUPABASE_URL=https://mytywaubhmpmyyblofri.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

> **Security Note**: Never commit `.env` to Git. The `.gitignore` file is pre-configured to ignore all `.env*` files.

---

## 3. Backend Setup & Run

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```

3. Run Database Migrations (ensures latest fields, default values, and indexes are applied):
   ```bash
   npm run db:migrate
   ```

4. Build the backend:
   ```bash
   npm run build
   ```

5. Start the backend in development mode:
   ```bash
   npm run start:dev
   ```

The backend starts at `http://localhost:5000/api/v1`.

### Verifying Backend Health
Open `http://localhost:5000/api/v1/health` in your browser. You should see:
```json
{
  "status": "healthy",
  "service": "Applyra REST API",
  "version": "1.0.0",
  "database": {
    "type": "MongoDB Atlas",
    "status": "Connected",
    "connected": true
  },
  "auth": {
    "provider": "Supabase Auth",
    "status": "Configured"
  },
  "storage": {
    "provider": "Supabase Storage",
    "bucket": "resumes (private)",
    "status": "Configured"
  }
}
```

---

## 4. Frontend Setup & Run

1. In a separate terminal, navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the frontend:
   ```bash
   npm run build
   ```

4. Start Next.js in development mode:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 5. Provisioning an Administrator

To protect administrative routes from unauthorized access:
1. Public signups automatically receive `role = USER` and `is_admin = false`.
2. To promote a user to `ADMIN`, execute the secure backend CLI command:
   ```bash
   cd backend
   npm run create-admin -- --email your-email@example.com
   ```
3. When that user logs into Applyra, they will gain access to `/admin` and the Admin Console under their profile menu.

---

## 6. Supabase Storage Setup (resumes bucket)

1. Open your Supabase Dashboard: `https://mytywaubhmpmyyblofri.supabase.co`.
2. Navigate to **Storage** → **Buckets**.
3. If the bucket named `resumes` does not exist:
   - Click **New Bucket**.
   - Name: `resumes`.
   - **Public Bucket**: Disabled / OFF (Private).
   - Maximum File Size: 10 MB.
   - Allowed MIME types: `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`.
4. Click **Save**.
