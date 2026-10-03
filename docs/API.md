# Applyra REST API Documentation (Version 1)

Base URL: `http://localhost:5000/api/v1`

---

## 1. System Health

### `GET /api/v1/health`
Public system health check and connectivity indicator.

**Response (200 OK):**
```json
{
  "status": "healthy",
  "service": "Applyra REST API",
  "version": "1.0.0",
  "timestamp": "2026-10-03T17:30:00.000Z",
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

## 2. Public Job Discovery (No Authentication Required)

### `GET /api/v1/jobs`
Query and filter verified job postings.

**Query Parameters:**
- `search` (string): Keyword search for title, company, skills, or description.
- `location` (string): Location filter (e.g., "Bengaluru", "Remote").
- `category` (string): Role category filter (e.g., "Java Developer", "Frontend Developer").
- `workMode` (string): `Remote`, `Hybrid`, `On-site`.
- `jobType` (string): `Full-time`, `Part-time`, `Internship`, `Contract`.
- `experience` (string): Years of experience filter.
- `sort` (string): `recent` (default), `relevance`.
- `page` (number): Page number (default: 1).
- `limit` (number): Items per page (default: 12, max: 50).

**Response (200 OK):**
```json
{
  "jobs": [
    {
      "_id": "6700...",
      "title": "Java Full Stack Developer",
      "slug": "java-full-stack-developer-tcs-bengaluru",
      "company": "Tata Consultancy Services",
      "location": "Bengaluru, Karnataka",
      "salary": "₹6–10 LPA",
      "experience": "1-3 years",
      "workMode": "Hybrid",
      "jobType": "Full-time",
      "category": "Java Developer",
      "source": "Company Careers",
      "skills": ["Java", "Spring Boot", "React", "TypeScript", "Docker"],
      "originalUrl": "https://careers.tcs.com/jobs/java-fullstack-dev-blr",
      "postedAt": "2026-10-03T15:00:00.000Z"
    }
  ],
  "total": 7,
  "page": 1,
  "totalPages": 1
}
```

### `GET /api/v1/jobs/:slugOrId`
Fetch full job details by slug or MongoDB ObjectId.

**Response (200 OK):**
```json
{
  "job": {
    "title": "Java Full Stack Developer",
    "slug": "java-full-stack-developer-tcs-bengaluru",
    "company": "Tata Consultancy Services",
    "description": "...",
    "responsibilities": ["..."],
    "skills": ["..."],
    "qualifications": ["..."],
    "location": "Bengaluru, Karnataka",
    "salary": "₹6–10 LPA",
    "experience": "1-3 years",
    "workMode": "Hybrid",
    "jobType": "Full-time",
    "source": "Company Careers",
    "originalUrl": "https://careers.tcs.com/jobs/java-fullstack-dev-blr"
  }
}
```

---

## 3. Authentication & User Sync

### `POST /api/v1/auth/sync`
Synchronizes the authenticated Supabase user into MongoDB (`users` collection) and creates/updates their default profile record.

**Headers:**
- `Authorization: Bearer <supabase_access_token>`

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "6700...",
    "supabaseUserId": "9e2c4f...",
    "email": "user@example.com",
    "role": "USER",
    "lastLoginAt": "2026-10-03T17:35:00.000Z",
    "createdAt": "2026-10-03T17:35:00.000Z"
  },
  "profile": {
    "userId": "6700...",
    "fullName": "Jane Doe",
    "profileCompletion": 25
  }
}
```

### `GET /api/v1/auth/me`
Retrieves current user identity, role, and profile.

**Headers:**
- `Authorization: Bearer <supabase_access_token>`

---

## 4. User Profiles (Authenticated)

### `GET /api/v1/profile`
Retrieve the authenticated user's profile and completeness score.

### `PUT /api/v1/profile`
Update the authenticated user's profile (name, headline, skills, preferences, bio).

**Request Body:**
```json
{
  "fullName": "Jane Doe",
  "headline": "Senior Full Stack Engineer",
  "location": "Bengaluru, India",
  "phone": "+91 98765 43210",
  "skills": ["Java", "Spring Boot", "React", "Node.js", "Docker"],
  "preferredWorkMode": "Hybrid",
  "bio": "Passionate software engineer building resilient cloud services."
}
```

---

## 5. Administration (Admin Role Required)

Protected by `SupabaseAuthGuard` and `AdminGuard`. Returns `403 Forbidden` if `role !== 'ADMIN'`.

### `GET /api/v1/admin/stats`
Returns system metrics (total registered users, total active jobs, sources).

### `GET /api/v1/admin/users`
Returns paginated list of registered users in MongoDB.
