# Security & Access Document
## Project: AI Resume Analyzer & ATS Optimizer

### 1. Authentication & Session Management
- **JWT-Based Authentication:** Standard JSON Web Tokens (JWT) will be generated upon successful login.
  - The JWT will contain the user's ID and email, signed with a secure secret key stored in Vercel environment variables (`JWT_SECRET`).
  - Tokens will expire in 7 days, requiring re-authentication.
- **Client Storage:** The JWT will be stored in the browser's `localStorage` or inside a secure, `httpOnly` cookie to prevent Cross-Site Scripting (XSS) access.
- **Password Hashing:** User passwords will be salted and hashed using `bcryptjs` (with a work factor of 10) before being persisted to the TiDB database. Raw passwords are never stored.

#### Authorization Scopes (Guest Mode vs. Logged-in Mode):
- **Guest Mode (Unauthenticated):**
  - Users can run resume scans and ATS evaluations on-the-fly.
  - **No Database Persistence:** Guest data is processed entirely in-memory and is never written to the TiDB database.
  - **Restricted Access:** The ATS CV Creator form actions, saving history logs, and interactive cloud saves are disabled. A glassmorphic Guest Promotion Card is shown in the dashboard sidebar to encourage signup.
- **Logged-in Mode (Authenticated):**
  - Full access to the ATS CV Creator, AI CV Assistant, and interactive score integrations.
  - All scans and resume builder forms are saved securely to the database.

---

### 2. Database & API Security
- **Connection Security:** All connections between Vercel Serverless Functions and TiDB Cloud Serverless will be encrypted via TLS.
- **SQL Injection Prevention:** 
  - Raw SQL strings will not be built using string interpolation.
  - Parameterized queries will be used for all operations using `@tidbcloud/serverless` connection execute function:
    ```javascript
    conn.execute('SELECT * FROM users WHERE email = ?', [email])
    ```
- **Environment Variables:** API keys, database credentials, and secrets are strictly configured via Vercel’s environment settings dashboard and never committed to version control.

---

### 3. API Key & Prompt Protection (Gemini API)
The system supports two methods of utilizing the Gemini API Key:

#### Option A: Project-Owner API Key (Stored in Vercel)
- The developer's key is saved in Vercel Environment Variables (`GEMINI_API_KEY`).
- Serverless API calls proxy requests to Google AI Studio.
- Rate-limiting is applied per IP address to prevent a single user from exhausting the project's free-tier quota (15 RPM).

#### Option B: User-Provided API Key (Stored in Client Browser)
- The dashboard allows users to supply their own free Google AI Studio key.
- The key is saved exclusively in the user’s browser via `localStorage.setItem('user_gemini_api_key', key)`.
- When calls are made, the frontend sends requests directly to the Gemini API endpoint or passes the key in the header to the Vercel API proxy. The serverless backend does not store these keys.

---

### 4. Data Privacy & GDPR Guidelines
Resumes contain highly sensitive PII (Personally Identifiable Information) such as names, phone numbers, home addresses, and employment histories.
- **No Disk Caching:** The Vercel Serverless Function processes resume files entirely in-memory. No PDF files are saved to the server's local file system.
- **Guest Isolation:** Guest scans are executed strictly in-memory and are never stored in the database.
- **Database Storage Encryption & Scoped Querying:** Authenticated users have the option to save resume details. The database base64 data stored in TiDB is strictly restricted via SQL owner matching:
  ```sql
  SELECT * FROM resumes WHERE user_id = ? AND id = ?
  ```
- **Secure Deletions:** Deleting items from the Analysis History uses a custom glassmorphic warning modal (Dashboard.tsx) to prevent accidental calls. Upon confirmation, the deletion executes immediately on TiDB, and the cached logs are cleared from memory.
- **Optional Right-to-Forget:** The dashboard features a "Delete Account" option that triggers a cascade delete, removing the user row and all associated resumes and scans.
