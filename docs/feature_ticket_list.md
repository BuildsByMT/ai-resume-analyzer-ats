# Feature Ticket List
## Project: AI Resume Analyzer & ATS Optimizer

Below is the structured task list divided into 5 sprints. These tickets define the sequential path to build the full system.

---

### Sprint 1: Foundation & Database Setup

#### Ticket 1.1: Project Initialization
- **Description:** Setup the workspace repository. Initialize the React client-side project using Vite (with TypeScript and Tailwind CSS). Configure basic folder structure.
- **Deliverables:** `/src` structure, `tailwind.config.js`, initial landing page component.

#### Ticket 1.2: TiDB Cloud Database Setup & SQL Configuration
- **Description:** Establish a connection to TiDB Serverless. Setup database tables (`users`, `resumes`, `analyses`).
- **Deliverables:** SQL migration scripts, database connection client using `@tidbcloud/serverless` under Vercel Serverless Functions.

---

### Sprint 2: Parser & AI Matcher Backend

#### Ticket 2.1: Resume Upload & Extraction API
- **Description:** Build the `POST /api/analyze` API route. It must receive a base64 PDF and job description text.
- **Deliverables:** Serverless api file that handles the payload and forwards binary file parts to the AI.

#### Ticket 2.2: Gemini prompt engineering for scoring
- **Description:** Implement Gemini SDK. Program the prompt structure to evaluate the resume text against the job description. Parse the returned JSON response.
- **Deliverables:** AI prompt utility file, error handling for rate limits, structured JSON return format.

---

### Sprint 3: Resume Builder & Client-Side PDF

#### Ticket 3.1: Multi-Step Resume Builder Form
- **Description:** Build the step-by-step UI form in React (Contact Info, Work History, Education, Skills, Projects).
- **Deliverables:** Wizard component with Next/Prev validation and draft-saving state.

#### Ticket 3.2: Client-side ATS PDF Generator
- **Description:** Integrated client-side PDF compiler using `jspdf` or `pdf-lib`. Generate a single-column, standard-font, ATS-friendly document.
- **Deliverables:** "Export PDF" function generating a text-extractable, correctly formatted file.

---

### Sprint 4: Dashboard UI & Auth Integration

#### Ticket 4.1: Authentication Frontend & JWT API
- **Description:** Create the JWT signup/login API endpoints. Build the login/signup frontend interface.
- **Deliverables:** Hashing password utility on backend, login/signup forms, Zustand auth store.

#### Ticket 4.2: Premium Dashboard Layout
- **Description:** Build the main dashboard page using the glassmorphic theme. Include the file drag-and-drop zone, job description text input, and history logs sidebar.
- **Deliverables:** Premium dashboard visual layouts, uploader status indicator, animations.

#### Ticket 4.3: Analysis Results View
- **Description:** Create the detailed score result page. Add radial progress indicators, keyword checklists (matched/missing badges), and formatting checks.
- **Deliverables:** Tabbed results panel showing AI feedback and suggested revisions.

---

### Sprint 5: Testing & Production Deployment

#### Ticket 5.1: Vercel Hosting & Environment Configurations
- **Description:** Deploy the website on Vercel's free tier. Configure environment variables (`TIDB_URL`, `GEMINI_API_KEY`, `JWT_SECRET`).
- **Deliverables:** Active live URL of the application.

#### Ticket 5.2: End-to-End System Testing & Verification
- **Description:** Test the parser against 5 sample resumes. Ensure PDF text is 100% extractable. Check responsive design.
- **Deliverables:** Successful testing reports for core flows.

---

### Sprint 6: Enhancements, Animations & UX Polish (Completed)

#### Ticket 6.1: PDF Overlap & Hanging Indent Fixes
- **Description:** Fix the text overlap in project titles, experience headers, and education blocks. Implement hanging indents for wrapped bullet points and bold labels for technical skills.
- **Deliverables:** Upgraded jsPDF layout generation code in `ResumeBuilder.tsx` with dynamic wrapping and padding.

#### Ticket 6.2: Score Gauge Radial Circle Animation
- **Description:** Replace the static borders of the match score radial gauge with an animated SVG circular progress circle.
- **Deliverables:** Smooth SVG progress circle inside `AnalysisResults.tsx` animating on mount over 1.5s.

#### Ticket 6.3: Light Mode Theme Visibility & High Contrast Overrides
- **Description:** Optimize light mode contrast. Swapped bright accent variables for darker variants and specifically styled inputs/selects to use white backgrounds with clear gray borders.
- **Deliverables:** Light theme enhancements in `index.css` ensuring WCAG contrast compliance.

#### Ticket 6.4: AI Assistant Duplicate Suggestion Check
- **Description:** Check if a suggested bullet is already present in the latest work experience details block. If yes, disable the button and show "Applied".
- **Deliverables:** State check and disabled/Applied visual button state in the CV assistant sidebar in `ResumeBuilder.tsx`.

#### Ticket 6.5: Custom Glassmorphic Delete Confirmation Modal
- **Description:** Replace native browser `confirm()` modal with a custom glassmorphic warning modal when deleting a history item.
- **Deliverables:** React dialog modal inside `Dashboard.tsx` with backdrop blur, alert icon, and Cancel/Delete actions.

#### Ticket 6.6: Guest Mode Signup Call-To-Action (CTA) Card
- **Description:** Add a high-converting promotion box below the founder profile card in the sidebar for unauthenticated users.
- **Deliverables:** Promotion glassmorphic card in `Dashboard.tsx` with clear value propositions and a "Create Free Account" button.

