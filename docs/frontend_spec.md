# Frontend Spec Document
## Project: AI Resume Analyzer & ATS Optimizer

### 1. Design System & Aesthetics
The dashboard features a modern, premium dark-themed glassmorphism interface. 

#### Color Palette (Tailwind Configuration):
- **Background:** Deep Navy/Slate (`bg-slate-950`)
- **Card Background:** Semi-transparent Slate (`bg-slate-900/60` with `backdrop-blur-md`)
- **Primary Accent:** Electric Cyan / Emerald Gradient (`from-cyan-500 to-emerald-500`)
- **Secondary Accent:** Slate Grey (`border-slate-800`, `text-slate-400`)
- **Success:** Emerald (`text-emerald-400`)
- **Warning:** Amber (`text-amber-400`)
- **Error:** Rose (`text-rose-400`)

#### Typography:
- **Font Family:** Inter or Outfit (loaded via Google Fonts)
- **Scale:** H1 (3xl, semibold), H2 (xl, medium), Body (sm/base, normal)

---

### 2. Router & Pages Map
The client-side routing is handled via `react-router-dom`:

1. **`/login` / `/signup` (Auth Pages):**
   - Centered glassmorphic card for credential inputs.
   - Smooth animated background glow.
2. **`/dashboard` (Main Dashboard Home):**
   - Grid layout showing summary cards (Previous Resumes uploaded, average ATS scores, recent jobs checked).
   - Drag-and-Drop file uploader.
   - Text area for pasting the Job Description.
   - "Analyze Resume" primary CTA with glowing hover effect.
3. **`/analyze/:id` (Analysis View):**
   - Left Panel: The uploaded/original resume text.
   - Right Panel: Interactive score display (Radial progress chart) and tabs for:
     - *Key Skill Match:* Matched vs. Missing skills shown in badges.
     - *Grammar & Action Verbs:* Highlighting passive voice or weak phrasing.
     - *Formatting Report:* Checklist of ATS compliance standards.
     - *AI Rewriting:* Cards showing side-by-side "Original" vs "ATS Optimized" bullet points.
4. **`/creator` (ATS Resume Builder):**
   - Multi-step wizard form (Step 1: Contact, Step 2: Experience, Step 3: Education, Step 4: Skills, Step 5: Projects).
   - Real-time previews of the text layout.
   - "Generate & Download ATS Resume" primary CTA.

---

### 3. State Management (Zustand Schema)
We will use `zustand` for lightweight state management.

#### Auth Store (`useAuthStore`):
- `user`: User details (ID, email) or `null`.
- `token`: JWT string.
- `setAuth(user, token)`: Function to set sessions.
- `logout()`: Clears credentials and redirects.

#### Resume Store (`useResumeStore`):
- `currentResume`: Parsed details of the active resume.
- `analysisResult`: Output details from the Gemini API analysis.
- `uploadResume(file, jobDescription)`: Action to send PDF to backend.
- `updateResumeDetails(field, value)`: Modifies fields in the form.

---

### 4. Interactive Flow & Animations
- **File Upload:** Smooth hover states on drag-over, animated progress bar during parsing.
- **Score Reveal:** Radial gauge runs an incrementing counting animation from `0` to the actual score on mount.
- **Form Actions:** Drag-and-drop ordering for work experience list items.
- **Transitions:** Page routing transitions use `framer-motion` for a fade-in-slide effect.
