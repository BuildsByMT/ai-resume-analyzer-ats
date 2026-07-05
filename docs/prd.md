# Product Requirements Document (PRD)
## Project: AI Resume Analyzer & ATS Optimizer

### 1. Executive Summary
The AI Resume Analyzer & ATS Optimizer is a premium, web-based dashboard designed to help job seekers optimize their resumes for Applicant Tracking Systems (ATS). The application will evaluate existing resumes against target Job Descriptions (JD), provide detailed feedback, and offer an interactive resume creator to output a 100% ATS-friendly PDF. 
To ensure zero deployment or runtime costs, the entire system utilizes free-tier cloud architectures: **Vercel** (hosting & serverless APIs), **TiDB Cloud Serverless** (MySQL database), and **Google Gemini API** (Free Tier via Google AI Studio).

### 2. Goals & Objectives
- **Zero Operating Costs:** Fully runnable on free tiers.
- **High-Precision Job Matching:** Score resumes based on actual semantic overlap with specific job descriptions using Gemini.
- **Premium User Experience:** Stunning, modern dark-themed glassmorphism dashboard UI.
- **ATS-Optimized Output:** Generate a standard, single-column PDF that parsers can extract with 100% fidelity.

---

### 3. Core Features & Functional Requirements

#### Feature 1: Authentication & User Accounts
- **JWT Auth:** Users can register and login securely via email/password.
- **Guest Mode:** Allow users to run a single check without signing up (encourages engagement).
- **Session State:** Local session management with automatic expiry.

#### Feature 2: Resume Parser & Job Matcher
- **Upload File:** Accept PDF files up to 5MB.
- **Target Job Description:** A text area where users paste the job description they are targeting.
- **ATS Score Engine:** 
  - Parse the PDF text on the serverless backend.
  - Send the resume text and the job description to the Gemini API.
  - Return a structured score (0-100) based on:
    1. *Keyword Density:* Presence of critical hard/soft skills.
    2. *Semantic Relevance:* Match between experience and job requirements.
    3. *Formatting Compliance:* Detecting multi-columns, tables, icons, or visual elements that break typical parsers.
- **Interactive Feedback Dashboard:** Visual chart of score breakdown, list of missing key skills, and bullet-by-bullet rewriting recommendations.

#### Feature 3: Interactive ATS Resume Creator
- **Autofill Profile:** If a user uploads an existing resume, the system parses it and automatically populates a multi-step form (Contact Info, Experience, Education, Skills, Projects).
- **Form Builder:** Responsive web form with real-time validation to let users edit, add, or delete sections.
- **Dynamic Stepper Validation:** Wavy SVG stepper nodes dynamically evaluate inputs when steps are switched. Renders green nodes for completed steps and red warning nodes for incomplete steps.
- **ATS-Friendly PDF Generator:** A client-side generator compiling details into a clean, single-column, standard-compliant PDF layout.

#### Feature 4: High-Availability & Free Quotas (Fallback Cascade)
- **API Model Fallback Loop:** Backend endpoints handle quota limits (`429`) and server overloads (`503`) by catching exceptions and retrying requests across an active model chain (`gemini-2.5-flash` -> `gemini-3.5-flash` -> `gemini-2.5-pro` -> `gemini-3.1-pro-preview` -> `gemini-3.1-flash-lite`).
- **Completely Free:** Operations are constrained to free-tier endpoints to maintain zero cost.

#### Feature 5: Dashboard History
- Save past resume analyses and generated PDF histories for logged-in users.
- Quick re-testing of modified resumes against previously saved job descriptions.

---

### 4. Non-Functional Requirements
- **Performance:** Resume parsing and AI grading must return in under 10 seconds (Vercel serverless timeout limit).
- **Design & Aesthetics:** Rich dark mode theme, glassmorphic card backdrops, smooth micro-interactions, responsive sizing from mobile to desktop.
- **Data Security:** Personal data in resumes must be encrypted or parsed securely.
- **Compliance:** 100% text-extractable output PDFs.

---

### 5. Success Metrics
- **ATS Parsability:** Generated PDFs must be 100% readable by standard text parsers (e.g., PyPDF, pdfminer).
- **Page Performance:** Lighthouse Performance score > 90.
