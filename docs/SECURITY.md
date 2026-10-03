# Applyra Security Architecture & Policies

## 1. Authentication Security

- **Identity Provider**: Supabase Auth handles identity lifecycle, password hashing (Argon2 / bcrypt), email confirmation links, and JWT issuance.
- **Zero Password Storage**: No user passwords or password hashes are ever transmitted to or stored in MongoDB Atlas.
- **Email Verification**: User signup requires email confirmation via Supabase Auth email dispatcher before login session creation.

---

## 2. Role-Based Authorization & Admin Hardening

- **Public Signup Isolation**: The frontend registration form has zero admin selection controls. The backend defaults all incoming signups strictly to:
  ```json
  "role": "USER"
  ```
- **Server-Side Admin Provisioning**: Administrator privileges can only be granted via secure server-side execution:
  ```bash
  npm run create-admin -- --email admin@applyra.com
  ```
- **Dual Layer Guarding**:
  - Backend: `AdminGuard` validates that `request.user.role === 'ADMIN'` on all `/api/v1/admin/*` endpoints. Returns `403 Forbidden` if unauthorized.
  - Frontend: `/admin` checks user role and renders an explicit `403 Forbidden` banner for standard users.

---

## 3. Resume File Protection & Storage Isolation

- **Private Supabase Bucket**: The `resumes` bucket is configured with `public = false`. Public unauthenticated downloads are impossible.
- **Time-Limited Signed URLs**: Resumes are only accessed through cryptographically signed temporary URLs generated on-demand by the backend for the verified owner.
- **MIME & Size Restrictions**: Only PDF and DOCX documents up to 10MB are permitted.

---

## 4. User Data Isolation

- All queries for profiles, saved jobs, resumes, and applications enforce tenant isolation:
  ```typescript
  query.userId = request.user._id;
  ```
- Client-supplied IDs in request payloads cannot override the verified JWT user identity.

---

## 5. Defense in Depth & Error Sanitization

- **Global Exception Filter**: Sanitizes all uncaught errors. No internal stack traces, database connection strings, or system paths are ever emitted in HTTP responses.
- **CORS Restriction**: Explicitly whitelists allowed origins (`FRONTEND_URL` and `http://localhost:3000`).
- **No Third-Party Scraping Violations**: Applyra redirects users to official employer career sites and never collects third-party credentials.
