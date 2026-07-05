# CVOptimize: AI Resume Analyzer & ATS Builder

**CVOptimize** is a premium, high-fidelity web dashboard designed to help job seekers evaluate and optimize their resumes against applicant tracking systems (ATS). Built using a modern, serverless architecture, the platform grades resumes in real-time, extracts keywords, provides structured AI rewriting suggestions, and generates clean, single-column, parser-friendly PDFs.

This project is engineered to operate **100% free of charge** using serverless free tiers.

---

## 🚀 Key Features

* **AI ATS Scoring Engine:** Upload a resume in PDF format and paste a target job description. The system executes semantic grading against industry standards, returning an overall match score from 0 to 100%.
* **Keyword Density Analysis:** Dynamically extracts present vs. missing hard and soft skills, showing them in color-coded visual grids.
* **ATS Compatibility Audit:** Runs checkups to identify formatting errors (such as multi-column layouts, incompatible fonts, tables, or icons) that frequently trigger parser failures.
* **AI Bullet-Point Optimizer:** Provides side-by-side rewriting suggestions to help users phrase experience descriptions using strong action verbs and quantifiable metrics.
* **ATS-Friendly Resume Creator:** A step-by-step form wizard featuring an interactive **Wavy SVG Stepper** (fluid sinusoidal path tracking, checkmark completions, glowing active nodes, and animated speech bubble tooltips) that generates a clean, single-column PDF locally using `jsPDF`.
* **Resume Optimizer AI Chatbot:** A floating AI career assistant at the bottom-right corner of the website for logged-in users. Using system restrictions, the assistant strictly handles queries related to resume writing, templates, page length, ATS compatibility, and CV comparisons.
* **Global Toast Notification System:** A lightweight state-driven toast component indicating successful uploads and AI imports.
* **Dashboard History Logging:** Logged-in users can view, re-examine, or delete previous scan results.

---

## 🛠️ Technology Stack

* **Frontend:** React (Vite) + Tailwind CSS + Zustand (State Management) + Lucide Icons + jsPDF (PDF Generation)
* **Backend:** Vercel Serverless Functions (Node.js API Routes)
* **Database:** TiDB Cloud Serverless (Fully managed, MySQL-compatible relational database)
* **AI Integration:** Google Gemini API (via the `@google/genai` unified SDK)
* **Hosting & Deployment:** Vercel (Free Tier)

---

## 🔑 Environment Variables Config

To run this application locally or in production, configure the following keys inside a `.env` file or your hosting provider's settings:

```text
DATABASE_URL=mysql://[user]:[password]@[host]:4000/[database]?ssl={"rejectUnauthorized":true}
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_jwt_signing_secret
```

---

## 👨‍💻 Author & Founder

* **Created by:** Muzammil Tanveer
* **Role:** Founder & Lead Developer
* **Contact Email:** [tanveermuzammil@gmail.com](mailto:tanveermuzammil@gmail.com)
