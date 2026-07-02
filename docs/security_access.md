# Security & Access Document
## Project: AI Resume Analyzer & ATS Optimizer

### 1. Authentication & Session Management
- **JWT-Based Authentication:** Standard JSON Web Tokens (JWT) will be generated upon successful login.
  - The JWT will contain the user's ID and email, signed with a secure secret key stored in Vercel environment variables (`JWT_SECRET`).
  - Tokens will expire in 7 days, requiring re-authentication.
- **Client Storage:** The JWT will be stored in the browser's `localStorage` or inside a secure, `httpOnly` cookie to prevent Cross-Site Scripting (XSS) access.
- **Password Hashing:** User passwords will be salted and hashed using `bcryptjs` (with a work factor of 10) before being persisted to the TiDB database. Raw passwords are never stored.

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
- **Database Storage Encryption:** Users have the option to save their resume details to their history. The PDF base64 data stored in TiDB will be restricted to authorized users via SQL matching:
  ```sql
  SELECT * FROM resumes WHERE user_id = ? AND id = ?
  ```
- **Optional Right-to-Forget:** The dashboard will feature a "Delete Account" button that triggers a cascade delete in the database, removing the user, all uploaded resumes, and history data.
