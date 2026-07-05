# Frontend Spec Document
## Project: AI Resume Analyzer & ATS Optimizer

### 1. Design System & Aesthetics
The dashboard features a modern, premium dark-themed glassmorphism interface. 

#### Color Palette (Tailwind Configuration):
- **Background:** Deep Navy/Slate (`bg-slate-950`), swaps to light gray (`#f8fafc`) in light mode.
- **Card Background:** Semi-transparent Slate (`bg-slate-900/60` with `backdrop-blur-md`), swaps to semi-transparent white in light mode.
- **Primary Accent:** Electric Cyan / Emerald Gradient (`from-cyan-500 to-emerald-500`). Swaps to darker, highly visible variants (`#0891b2` / `#059669`) in light mode to maintain contrast.
- **Secondary Accent:** Slate Grey (`border-slate-800`, `text-slate-400`).
- **Success:** Emerald (`text-emerald-400`), swaps to green-600 (`#059669`) in light mode.
- **Warning:** Amber (`text-amber-400`), swaps to amber-600 (`#d97706`) in light mode.
- **Error:** Rose (`text-rose-400`), swaps to rose-600 (`#e11d48`) in light mode.

#### Form Controls (Light Mode Visibility):
- Inputs, selects, and textareas are styled with solid white background (`#ffffff`), soft gray borders (`#cbd5e1`), and dark slate text (`#0f172a`) to ensure prominence.

#### Typography:
- **Font Family:** Inter or Outfit (loaded via Google Fonts)
- **Scale:** H1 (3xl, semibold), H2 (xl, medium), Body (sm/base, normal)

---

### 2. Router & Pages Map
The client-side routing is handled via hash routing:

1. **`#/login` / `#/signup` (Auth Pages):**
   - Centered glassmorphic card for credential inputs.
   - Smooth animated background glow.
2. **`#/dashboard` (Main Dashboard Home):**
   - Grid layout showing summary cards (Previous Resumes uploaded, average ATS scores, recent jobs checked).
   - Drag-and-Drop file uploader.
   - Text area for pasting the Job Description.
   - "Analyze Resume" primary CTA with glowing hover effect.
   - **Guest Mode Promotion Card:** Rendered below the Founder Profile Card in the sidebar when the user is not logged in. Highlights features (ATS CV Creator, AI Assistant, Exports) and prompts sign up.
   - **Custom Delete Confirmation Modal:** Intercepts delete actions, prompting user with a themed glassmorphic dialog instead of the browser native popup.
3. **`#/analysis` (Analysis View):**
   - Left Panel: The uploaded/original resume text.
   - Right Panel: Interactive score display (Radial progress chart) and tabs for:
     - *Key Skill Match:* Matched vs. Missing skills shown in badges.
     - *Grammar & Action Verbs:* Highlighting passive voice or weak phrasing.
     - *Formatting Report:* Checklist of ATS compliance standards.
     - *AI Rewriting:* Cards showing side-by-side "Original" vs "ATS Optimized" bullet points.
4. **`#/creator` (ATS Resume Builder):**
   - Multi-step wizard form driven by a horizontal **Curved Wavy Stepper** (SVG-based sinusoidal wave with glowing active indicator, tooltips, and completion checkmarks).
   - Real-time previews of the text layout.
   - "Generate & Download ATS Resume" primary CTA.
5. **Floating AI Chatbot (All Logged-in Pages):**
   - Interactive chat window floating at the bottom right.
   - Restricted via backend system prompt to answer resume-related, ATS, and CV inquiries, while politely refusing general chat.

---

### 3. State Management (Zustand Schema)
We will use `zustand` for lightweight state management.

#### Auth Store (`useAuthStore`):
- `user`: User details (ID, email) or `null`.
- `token`: JWT string.
- `toast`: ToastState containing `message`, `type`, and `visible` properties.
- `setAuth(user, token)`: Function to set sessions.
- `logout()`: Clears credentials and redirects.
- `showToast(message, type)`: Triggers a global toast notification.
- `hideToast()`: Dismisses the active toast.

#### Resume Store (`useResumeStore`):
- `currentResume`: Parsed details of the active resume.
- `analysisResult`: Output details from the Gemini API analysis.
- `uploadResume(file, jobDescription)`: Action to send PDF to backend.
- `updateResumeDetails(field, value)`: Modifies fields in the form.

---

### 4. Interactive Flow & Animations
- **File Upload:** Smooth hover states on drag-over, uploader animation during parsing, and global slide-in Toast alert on upload success.
- **SVG Radial Gauge:** Circular progress path utilizing `stroke-dashoffset` keyframe transition (`fill-circle`) to animate-fill the score from 0% to the matching overall percentage.
- **Curved Wavy Stepper:** Draws a fluid sinusoidal SVG wave which animates the fill color dynamically utilizing `stroke-dashoffset` as the user navigates steps. Interactive nodes feature pulsating active states and scaling speech bubbles that pop up on active/hover focus.
- **Staggered Entry transitions:** Uses CSS scale-in and slide-up animations with calculated animation delays (`style={{ animationDelay: '...' }}`) for staggered entries on keyword chips, checklist rows, and AISuggestions cards.
- **AI CV Assistant:** Keeps track of whether suggestions are already applied. Disables the button and shows "✓ Applied" to prevent duplicate bullet additions.
- **Modals:** Custom React modal components styled with glassmorphic cards and fade/scale transitions, avoiding native browser interrupt block alerts.
