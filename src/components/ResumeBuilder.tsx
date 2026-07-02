import React, { useState } from 'react';
import { useStore } from '../store';
import { jsPDF } from 'jspdf';
import { ChevronRight, ChevronLeft, Download, Plus, Trash2, User, Briefcase, GraduationCap, Code, FolderGit, Upload, Loader2, Sparkles } from 'lucide-react';

const industryPresets = {
  tech: {
    languages: 'Programming Languages',
    frameworks: 'Frameworks & Libraries',
    tools: 'Tools & Platforms',
    placeholderLanguages: 'JavaScript, TypeScript, Python, Go, Rust, SQL',
    placeholderFrameworks: 'React, Next.js, Node.js, Express, Tailwind CSS, Vue',
    placeholderTools: 'Git, Docker, TiDB Database, Vercel, AWS, Kubernetes'
  },
  hr: {
    languages: 'Core HR Competencies',
    frameworks: 'Methodologies & Compliance',
    tools: 'HR Software & ATS Tools',
    placeholderLanguages: 'Talent Acquisition, Employee Relations, Labor Law Compliance, Conflict Resolution',
    placeholderFrameworks: 'Onboarding Policies, Benefits Administration, Performance Management, Performance Audits',
    placeholderTools: 'Workday, BambooHR, LinkedIn Recruiter, MS Excel, ADP Payroll, Lever ATS'
  },
  engineering: {
    languages: 'Core Engineering Competencies',
    frameworks: 'Design Standards & Compliance',
    tools: 'Software & Instrumentation',
    placeholderLanguages: 'Circuit Design, Power Systems, CAD Drafting, Thermodynamics, Signal Processing',
    placeholderFrameworks: 'IEEE Standards, Six Sigma Green Belt, Lean Manufacturing, NEC Safety Codes',
    placeholderTools: 'MATLAB, AutoCAD, SolidWorks, Oscilloscopes, Spectrum Analyzers, LabVIEW'
  },
  general: {
    languages: 'Core Professional Competencies',
    frameworks: 'Methodologies & Operations',
    tools: 'Software, Systems & Platforms',
    placeholderLanguages: 'Project Management, Financial Analysis, Strategic Planning, Business Development',
    placeholderFrameworks: 'Agile Methodologies, Market Research, Client Account Management, Customer Retention',
    placeholderTools: 'Salesforce CRM, Microsoft Office Suite, Trello, Jira, Slack, HubSpot'
  }
};

export const ResumeBuilder: React.FC = () => {
  const { token, userApiKey } = useStore();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState('');
  const [parseSuccess, setParseSuccess] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<'tech' | 'hr' | 'engineering' | 'general'>('tech');
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Form States
  const [contact, setContact] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    location: '',
  });

  const [experience, setExperience] = useState<Array<{
    company: string;
    role: string;
    duration: string;
    details: string;
  }>>([{ company: '', role: '', duration: '', details: '' }]);

  const [education, setEducation] = useState<Array<{
    school: string;
    degree: string;
    duration: string;
  }>>([{ school: '', degree: '', duration: '' }]);

  const [skills, setSkills] = useState({
    languages: '',
    frameworks: '',
    tools: '',
  });

  const [projects, setProjects] = useState<Array<{
    title: string;
    tech: string;
    details: string;
  }>>([{ title: '', tech: '', details: '' }]);

  // Add/Remove Helpers
  const addExperience = () => setExperience([...experience, { company: '', role: '', duration: '', details: '' }]);
  const removeExperience = (index: number) => setExperience(experience.filter((_, i) => i !== index));

  const addEducation = () => setEducation([...education, { school: '', degree: '', duration: '' }]);
  const removeEducation = (index: number) => setEducation(education.filter((_, i) => i !== index));

  const addProject = () => setProjects([...projects, { title: '', tech: '', details: '' }]);
  const removeProject = (index: number) => setProjects(projects.filter((_, i) => i !== index));

  // AI parser upload handler
  const handleParseUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setParseError('');
    setParseSuccess(false);
    
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (file.type !== 'application/pdf') {
      setParseError('Only PDF files are supported for import.');
      return;
    }

    setIsParsing(true);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64String = reader.result as string;

        try {
          const response = await fetch('/api/parse-resume', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              pdfBase64: base64String,
              userApiKey
            })
          });

          const data = await response.json();
          if (!response.ok || !data.success) {
            throw new Error(data.error || data.message || 'Parsing failed.');
          }

          const parsed = data.data;

          if (parsed.contact) {
            setContact({
              name: parsed.contact.name || '',
              email: parsed.contact.email || '',
              phone: parsed.contact.phone || '',
              website: parsed.contact.website || '',
              location: parsed.contact.location || '',
            });
          }

          if (parsed.experience && Array.isArray(parsed.experience)) {
            setExperience(parsed.experience.length > 0 ? parsed.experience : [{ company: '', role: '', duration: '', details: '' }]);
          }

          if (parsed.education && Array.isArray(parsed.education)) {
            setEducation(parsed.education.length > 0 ? parsed.education : [{ school: '', degree: '', duration: '' }]);
          }

          if (parsed.projects && Array.isArray(parsed.projects)) {
            setProjects(parsed.projects.length > 0 ? parsed.projects : [{ title: '', tech: '', details: '' }]);
          }

          if (parsed.skills) {
            setSkills({
              languages: parsed.skills.languages || '',
              frameworks: parsed.skills.frameworks || '',
              tools: parsed.skills.tools || '',
            });

            const l = (parsed.skills.languages || '').toLowerCase();
            const f = (parsed.skills.frameworks || '').toLowerCase();
            const t = (parsed.skills.tools || '').toLowerCase();
            if (l.includes('recruiting') || f.includes('compliance') || f.includes('hiring')) {
              setSelectedPreset('hr');
            } else if (l.includes('cad') || t.includes('solidworks') || l.includes('matlab') || l.includes('circuit')) {
              setSelectedPreset('engineering');
            } else if (l.includes('javascript') || l.includes('python') || f.includes('react') || f.includes('next.js')) {
              setSelectedPreset('tech');
            } else {
              setSelectedPreset('general');
            }
          }

          setParseSuccess(true);
          setStep(1);
        } catch (apiErr: any) {
          setParseError(apiErr.message || 'API request failed.');
        } finally {
          setIsParsing(false);
        }
      };
    } catch (err: any) {
      setParseError('Failed to read file.');
      setIsParsing(false);
    }
  };

  // Generate ATS PDF using jsPDF (Strict Single Column Layout)
  const handleGeneratePDF = async () => {
    setIsGenerating(true);

    try {
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'pt',
        format: 'letter'
      });

      // Settings
      const margin = 54; // 0.75 in
      const pageWidth = doc.internal.pageSize.getWidth();
      const contentWidth = pageWidth - (margin * 2);
      let y = 54;

      // Helper to add lines with wrap text and page-break check
      const addText = (text: string, fontSize: number, isBold = false, spacing = 12) => {
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        doc.setFontSize(fontSize);

        const lines = doc.splitTextToSize(text, contentWidth);
        
        // Page break check
        if (y + (lines.length * spacing) > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          y = margin;
        }

        doc.text(lines, margin, y);
        y += (lines.length * spacing) + 4;
      };

      // Header (Centered Contact Info)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text(contact.name || 'Your Name', pageWidth / 2, y, { align: 'center' });
      y += 18;

      const subhead = [
        contact.email,
        contact.phone,
        contact.location,
        contact.website
      ].filter(Boolean).join('  |  ');
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.text(subhead, pageWidth / 2, y, { align: 'center' });
      y += 24;

      // Divider helper
      const addSectionHeading = (title: string) => {
        y += 8;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(title.toUpperCase(), margin, y);
        y += 4;
        
        // Draw thin section line
        doc.setLineWidth(0.5);
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, y, pageWidth - margin, y);
        y += 14;
      };

      // 1. Experience Section
      if (experience.some(exp => exp.company || exp.role)) {
        addSectionHeading('Experience');
        experience.forEach(exp => {
          if (!exp.company && !exp.role) return;
          
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.text(exp.role || 'Role', margin, y);
          
          doc.setFont('helvetica', 'normal');
          doc.text(exp.duration || 'Date range', pageWidth - margin, y, { align: 'right' });
          y += 12;

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9.5);
          doc.text(exp.company || 'Company', margin, y);
          y += 14;

          if (exp.details) {
            // Split bullet points
            const bulletPoints = exp.details.split('\n').filter(Boolean);
            bulletPoints.forEach(bullet => {
              const cleanedBullet = bullet.trim().startsWith('•') 
                ? bullet.trim() 
                : `•  ${bullet.trim()}`;
              addText(cleanedBullet, 9, false, 11);
            });
            y += 6;
          }
        });
      }

      // 2. Education Section
      if (education.some(edu => edu.school || edu.degree)) {
        addSectionHeading('Education');
        education.forEach(edu => {
          if (!edu.school && !edu.degree) return;

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.text(edu.degree || 'Degree', margin, y);

          doc.setFont('helvetica', 'normal');
          doc.text(edu.duration || 'Date range', pageWidth - margin, y, { align: 'right' });
          y += 12;

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9.5);
          doc.text(edu.school || 'School', margin, y);
          y += 18;
        });
      }

      // 3. Projects Section
      if (projects.some(proj => proj.title)) {
        addSectionHeading('Projects');
        projects.forEach(proj => {
          if (!proj.title) return;

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.text(proj.title, margin, y);
          
          if (proj.tech) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.text(`  [${proj.tech}]`, margin + doc.getTextWidth(proj.title) + 5, y);
          }
          y += 12;

          if (proj.details) {
            const bulletPoints = proj.details.split('\n').filter(Boolean);
            bulletPoints.forEach(bullet => {
              const cleanedBullet = bullet.trim().startsWith('•') 
                ? bullet.trim() 
                : `•  ${bullet.trim()}`;
              addText(cleanedBullet, 9, false, 11);
            });
            y += 6;
          }
        });
      }

      // 4. Skills Section
      if (skills.languages || skills.frameworks || skills.tools) {
        addSectionHeading('Technical Skills');
        const presetLabels = industryPresets[selectedPreset];
        if (skills.languages) {
          addText(`${presetLabels.languages}:  ${skills.languages}`, 9.5, false, 12);
        }
        if (skills.frameworks) {
          addText(`${presetLabels.frameworks}:  ${skills.frameworks}`, 9.5, false, 12);
        }
        if (skills.tools) {
          addText(`${presetLabels.tools}:  ${skills.tools}`, 9.5, false, 12);
        }
      }

      // Save PDF output to client download
      doc.save(`${contact.name.replace(/\s+/g, '_') || 'Resume'}_ATS.pdf`);

      // Optionally save to TiDB database if user is logged in
      if (token) {
        try {
          const pdfBase64 = doc.output('datauristring');
          await fetch('/api/resumes', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              resumeName: `${contact.name || 'Profile'} Resume`,
              parsedJson: { contact, experience, education, skills, projects },
              pdfBase64
            })
          });
        } catch (dbErr) {
          console.error('Failed to auto-save generated resume to cloud database:', dbErr);
        }
      }
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate ATS Word (.doc) using clean MS Word XML envelope
  const handleGenerateWord = () => {
    const escapeHtml = (text: string) => {
      if (!text) return '';
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    const name = escapeHtml(contact.name || 'Your Name');
    const email = escapeHtml(contact.email);
    const phone = escapeHtml(contact.phone);
    const website = escapeHtml(contact.website);
    const location = escapeHtml(contact.location);

    const subhead = [email, phone, location, website].filter(Boolean).join('  |  ');

    let experienceHtml = '';
    if (experience.some(exp => exp.company || exp.role)) {
      experienceHtml = `
        <h2>Experience</h2>
        ${experience.map(exp => {
          if (!exp.company && !exp.role) return '';
          const role = escapeHtml(exp.role || 'Role');
          const company = escapeHtml(exp.company || 'Company');
          const duration = escapeHtml(exp.duration || 'Date range');
          
          let bulletsHtml = '';
          if (exp.details) {
            const bulletPoints = exp.details.split('\n').filter(Boolean);
            bulletsHtml = `
              <ul>
                ${bulletPoints.map(bullet => {
                  const cleaned = bullet.trim().replace(/^•\s*/, '');
                  return `<li>${escapeHtml(cleaned)}</li>`;
                }).join('')}
              </ul>
            `;
          }

          return `
            <div class="entry">
              <table style="width: 100%; border: none; border-collapse: collapse; margin-bottom: 2pt;">
                <tr>
                  <td style="font-weight: bold; text-align: left; font-size: 10pt; font-family: Arial, sans-serif;">${role}</td>
                  <td style="text-align: right; color: #475569; font-size: 9.5pt; font-family: Arial, sans-serif;">${duration}</td>
                </tr>
                <tr>
                  <td colspan="2" style="font-style: italic; color: #334155; font-size: 9.5pt; font-family: Arial, sans-serif; padding-top: 1pt;">${company}</td>
                </tr>
              </table>
              ${bulletsHtml}
            </div>
          `;
        }).join('')}
      `;
    }

    let educationHtml = '';
    if (education.some(edu => edu.school || edu.degree)) {
      educationHtml = `
        <h2>Education</h2>
        ${education.map(edu => {
          if (!edu.school && !edu.degree) return '';
          const degree = escapeHtml(edu.degree || 'Degree');
          const school = escapeHtml(edu.school || 'School');
          const duration = escapeHtml(edu.duration || 'Date range');

          return `
            <div class="entry">
              <table style="width: 100%; border: none; border-collapse: collapse; margin-bottom: 2pt;">
                <tr>
                  <td style="font-weight: bold; text-align: left; font-size: 10pt; font-family: Arial, sans-serif;">${degree}</td>
                  <td style="text-align: right; color: #475569; font-size: 9.5pt; font-family: Arial, sans-serif;">${duration}</td>
                </tr>
                <tr>
                  <td colspan="2" style="color: #334155; font-size: 9.5pt; font-family: Arial, sans-serif; padding-top: 1pt;">${school}</td>
                </tr>
              </table>
            </div>
          `;
        }).join('')}
      `;
    }

    let projectsHtml = '';
    if (projects.some(proj => proj.title)) {
      projectsHtml = `
        <h2>Projects</h2>
        ${projects.map(proj => {
          if (!proj.title) return '';
          const title = escapeHtml(proj.title);
          const tech = proj.tech ? `<span style="font-weight: normal; font-size: 9pt; color: #475569; font-family: Arial, sans-serif;">  [${escapeHtml(proj.tech)}]</span>` : '';
          
          let bulletsHtml = '';
          if (proj.details) {
            const bulletPoints = proj.details.split('\n').filter(Boolean);
            bulletsHtml = `
              <ul>
                ${bulletPoints.map(bullet => {
                  const cleaned = bullet.trim().replace(/^•\s*/, '');
                  return `<li>${escapeHtml(cleaned)}</li>`;
                }).join('')}
              </ul>
            `;
          }

          return `
            <div class="entry">
              <div style="font-weight: bold; font-size: 10pt; font-family: Arial, sans-serif; margin-bottom: 2pt;">
                ${title}${tech}
              </div>
              ${bulletsHtml}
            </div>
          `;
        }).join('')}
      `;
    }

    let skillsHtml = '';
    if (skills.languages || skills.frameworks || skills.tools) {
      const presetLabels = industryPresets[selectedPreset];
      skillsHtml = `
        <h2>Technical Skills</h2>
        <table style="width: 100%; border: none; border-collapse: collapse;">
          ${skills.languages ? `
            <tr>
              <td style="font-weight: bold; width: 140pt; vertical-align: top; font-size: 9.5pt; font-family: Arial, sans-serif; padding-bottom: 3pt;">${escapeHtml(presetLabels.languages)}:</td>
              <td style="font-size: 9.5pt; font-family: Arial, sans-serif; padding-bottom: 3pt;">${escapeHtml(skills.languages)}</td>
            </tr>` : ''}
          ${skills.frameworks ? `
            <tr>
              <td style="font-weight: bold; width: 140pt; vertical-align: top; font-size: 9.5pt; font-family: Arial, sans-serif; padding-bottom: 3pt;">${escapeHtml(presetLabels.frameworks)}:</td>
              <td style="font-size: 9.5pt; font-family: Arial, sans-serif; padding-bottom: 3pt;">${escapeHtml(skills.frameworks)}</td>
            </tr>` : ''}
          ${skills.tools ? `
            <tr>
              <td style="font-weight: bold; width: 140pt; vertical-align: top; font-size: 9.5pt; font-family: Arial, sans-serif; padding-bottom: 3pt;">${escapeHtml(presetLabels.tools)}:</td>
              <td style="font-size: 9.5pt; font-family: Arial, sans-serif; padding-bottom: 3pt;">${escapeHtml(skills.tools)}</td>
            </tr>` : ''}
        </table>
      `;
    }

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <title>${name}_Resume_ATS</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          @page {
            size: 8.5in 11in;
            margin: 0.75in;
          }
          body {
            font-family: Arial, sans-serif;
            font-size: 9.5pt;
            line-height: 1.2;
            color: #1e293b;
          }
          h1 {
            font-size: 20pt;
            text-align: center;
            margin-top: 0px;
            margin-bottom: 4px;
            color: #0f172a;
            font-weight: bold;
          }
          .contact-info {
            text-align: center;
            font-size: 9.5pt;
            margin-bottom: 18px;
            color: #475569;
          }
          h2 {
            font-size: 11pt;
            text-transform: uppercase;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 2px;
            margin-top: 14px;
            margin-bottom: 8px;
            color: #0f172a;
            font-weight: bold;
          }
          .entry {
            margin-bottom: 10px;
          }
          ul {
            margin-top: 2px;
            margin-bottom: 2px;
            padding-left: 18px;
          }
          li {
            margin-bottom: 2px;
            font-size: 9pt;
            color: #334155;
          }
        </style>
      </head>
      <body>
        <h1>${name}</h1>
        <div class="contact-info">
          ${subhead}
        </div>
        ${experienceHtml}
        ${educationHtml}
        ${projectsHtml}
        ${skillsHtml}
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + htmlContent], {
      type: 'application/msword'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.replace(/\s+/g, '_') || 'Resume'}_ATS.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-[1600px] mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
          ATS Resume <span className="text-gradient">Creator</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Complete the steps to build a 100% compliant, single-column ATS resume designed to rank highly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Step navigation list */}
        <div className="lg:col-span-1 glass-card rounded-2xl p-4 h-fit space-y-2">
          {[
            { id: 1, label: 'Contact', icon: <User size={15} /> },
            { id: 2, label: 'Experience', icon: <Briefcase size={15} /> },
            { id: 3, label: 'Education', icon: <GraduationCap size={15} /> },
            { id: 4, label: 'Projects', icon: <FolderGit size={15} /> },
            { id: 5, label: 'Skills', icon: <Code size={15} /> },
          ].map(s => (
            <button
              key={s.id}
              onClick={() => setStep(s.id)}
              className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all duration-200 ${
                step === s.id
                  ? 'bg-slate-900 text-cyan-400 border border-slate-800'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/40'
              }`}
            >
              {s.icon}
              {s.label}
            </button>
          ))}
        </div>

        {/* Right: Step Inputs */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card rounded-2xl p-6 min-h-[350px]">
            {/* Step 1: Contact Info */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* AI Kickstart card */}
                <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 border border-cyan-500/20 rounded-2xl mb-6 relative overflow-hidden group">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                        <Sparkles size={14} className="animate-pulse" />
                        AI Auto-Fill Resume Parser
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed max-w-xl">
                        Upload an existing resume PDF to instantly extract your details, work history, education, projects, and skills. You can review and complete the remaining parts.
                      </p>
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isParsing}
                      className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow-md hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer shrink-0"
                    >
                      {isParsing ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          Parsing...
                        </>
                      ) : (
                        <>
                          <Upload size={13} />
                          Import PDF
                        </>
                      )}
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleParseUpload}
                      accept=".pdf"
                      className="hidden"
                    />
                  </div>
                  {parseError && (
                    <p className="text-rose-400 text-[10px] mt-2 font-medium">{parseError}</p>
                  )}
                  {parseSuccess && (
                    <p className="text-emerald-400 text-[10px] mt-2 font-medium">✓ Resume parsed successfully! All sections populated below.</p>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-200 border-b border-slate-900 pb-2.5 mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Full Name</label>
                    <input
                      type="text"
                      value={contact.name}
                      onChange={e => setContact({ ...contact, name: e.target.value })}
                      placeholder="John Doe"
                      className="w-full bg-slate-950/60 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Email</label>
                    <input
                      type="email"
                      value={contact.email}
                      onChange={e => setContact({ ...contact, email: e.target.value })}
                      placeholder="john@example.com"
                      className="w-full bg-slate-950/60 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={contact.phone}
                      onChange={e => setContact({ ...contact, phone: e.target.value })}
                      placeholder="(123) 456-7890"
                      className="w-full bg-slate-950/60 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Location</label>
                    <input
                      type="text"
                      value={contact.location}
                      onChange={e => setContact({ ...contact, location: e.target.value })}
                      placeholder="New York, NY"
                      className="w-full bg-slate-950/60 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Website / LinkedIn / GitHub</label>
                    <input
                      type="text"
                      value={contact.website}
                      onChange={e => setContact({ ...contact, website: e.target.value })}
                      placeholder="linkedin.com/in/johndoe"
                      className="w-full bg-slate-950/60 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Experience */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex justify-between items-center border-b border-slate-900 pb-2.5 mb-4">
                  <h3 className="text-base font-bold text-slate-200">Work Experience</h3>
                  <button
                    onClick={addExperience}
                    className="flex items-center gap-1 text-[11px] font-bold text-cyan-400 bg-cyan-500/5 border border-cyan-500/25 px-2.5 py-1 rounded-lg hover:bg-cyan-500/10 transition-colors cursor-pointer"
                  >
                    <Plus size={12} /> Add Role
                  </button>
                </div>

                {experience.map((exp, index) => (
                  <div key={index} className="p-4 bg-slate-950/40 border border-slate-900 rounded-2xl relative space-y-4">
                    {experience.length > 1 && (
                      <button
                        onClick={() => removeExperience(index)}
                        className="absolute top-4 right-4 text-slate-600 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Company</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={e => {
                            const newExp = [...experience];
                            newExp[index].company = e.target.value;
                            setExperience(newExp);
                          }}
                          placeholder="Acme Corp"
                          className="w-full bg-slate-950/60 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Job Title</label>
                        <input
                          type="text"
                          value={exp.role}
                          onChange={e => {
                            const newExp = [...experience];
                            newExp[index].role = e.target.value;
                            setExperience(newExp);
                          }}
                          placeholder="Software Engineer"
                          className="w-full bg-slate-950/60 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Date Range</label>
                        <input
                          type="text"
                          value={exp.duration}
                          onChange={e => {
                            const newExp = [...experience];
                            newExp[index].duration = e.target.value;
                            setExperience(newExp);
                          }}
                          placeholder="June 2023 - Present"
                          className="w-full bg-slate-950/60 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Bullet Details (One per line)</label>
                        <textarea
                          rows={4}
                          value={exp.details}
                          onChange={e => {
                            const newExp = [...experience];
                            newExp[index].details = e.target.value;
                            setExperience(newExp);
                          }}
                          placeholder="Designed and deployed microservices reducing lookup times by 15%&#10;Coordinated frontend migrations from angular to React"
                          className="w-full bg-slate-950/60 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none resize-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Step 3: Education */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex justify-between items-center border-b border-slate-900 pb-2.5 mb-4">
                  <h3 className="text-base font-bold text-slate-200">Education</h3>
                  <button
                    onClick={addEducation}
                    className="flex items-center gap-1 text-[11px] font-bold text-cyan-400 bg-cyan-500/5 border border-cyan-500/25 px-2.5 py-1 rounded-lg hover:bg-cyan-500/10 transition-colors cursor-pointer"
                  >
                    <Plus size={12} /> Add Education
                  </button>
                </div>

                {education.map((edu, index) => (
                  <div key={index} className="p-4 bg-slate-950/40 border border-slate-900 rounded-2xl relative space-y-4">
                    {education.length > 1 && (
                      <button
                        onClick={() => removeEducation(index)}
                        className="absolute top-4 right-4 text-slate-600 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">School / University</label>
                        <input
                          type="text"
                          value={edu.school}
                          onChange={e => {
                            const newEdu = [...education];
                            newEdu[index].school = e.target.value;
                            setEducation(newEdu);
                          }}
                          placeholder="Harvard University"
                          className="w-full bg-slate-950/60 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Date Range / Graduation</label>
                        <input
                          type="text"
                          value={edu.duration}
                          onChange={e => {
                            const newEdu = [...education];
                            newEdu[index].duration = e.target.value;
                            setEducation(newEdu);
                          }}
                          placeholder="2019 - 2023"
                          className="w-full bg-slate-950/60 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Degree & Major</label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={e => {
                            const newEdu = [...education];
                            newEdu[index].degree = e.target.value;
                            setEducation(newEdu);
                          }}
                          placeholder="B.S. in Computer Science"
                          className="w-full bg-slate-950/60 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Step 4: Projects */}
            {step === 4 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex justify-between items-center border-b border-slate-900 pb-2.5 mb-4">
                  <h3 className="text-base font-bold text-slate-200">Personal Projects</h3>
                  <button
                    onClick={addProject}
                    className="flex items-center gap-1 text-[11px] font-bold text-cyan-400 bg-cyan-500/5 border border-cyan-500/25 px-2.5 py-1 rounded-lg hover:bg-cyan-500/10 transition-colors cursor-pointer"
                  >
                    <Plus size={12} /> Add Project
                  </button>
                </div>

                {projects.map((proj, index) => (
                  <div key={index} className="p-4 bg-slate-950/40 border border-slate-900 rounded-2xl relative space-y-4">
                    {projects.length > 1 && (
                      <button
                        onClick={() => removeProject(index)}
                        className="absolute top-4 right-4 text-slate-600 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Project Title</label>
                        <input
                          type="text"
                          value={proj.title}
                          onChange={e => {
                            const newProj = [...projects];
                            newProj[index].title = e.target.value;
                            setProjects(newProj);
                          }}
                          placeholder="E-Commerce API"
                          className="w-full bg-slate-950/60 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Technologies Used</label>
                        <input
                          type="text"
                          value={proj.tech}
                          onChange={e => {
                            const newProj = [...projects];
                            newProj[index].tech = e.target.value;
                            setProjects(newProj);
                          }}
                          placeholder="Node.js, Express, MySQL"
                          className="w-full bg-slate-950/60 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Project Details (One per line)</label>
                        <textarea
                          rows={3}
                          value={proj.details}
                          onChange={e => {
                            const newProj = [...projects];
                            newProj[index].details = e.target.value;
                            setProjects(newProj);
                          }}
                          placeholder="Developed scalable server backends handling 50k transactions monthly&#10;Integrated JWT auth and Stripe checkout flows"
                          className="w-full bg-slate-950/60 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none resize-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Step 5: Skills */}
            {step === 5 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <h3 className="text-base font-bold text-slate-200 border-b border-slate-900 pb-2.5 mb-4">Technical & Core Skills</h3>
                
                {/* Industry Preset Selector */}
                <div className="mb-4">
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Select Industry Preset</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'tech', label: 'Technology' },
                      { id: 'hr', label: 'Human Resources' },
                      { id: 'engineering', label: 'Engineering' },
                      { id: 'general', label: 'General / Business' }
                    ].map(preset => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setSelectedPreset(preset.id as any)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                          selectedPreset === preset.id
                            ? 'bg-slate-900 text-cyan-400 border-slate-800'
                            : 'bg-slate-950/40 text-slate-400 border-slate-900 hover:text-slate-200'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
                      {industryPresets[selectedPreset].languages}
                    </label>
                    <input
                      type="text"
                      value={skills.languages}
                      onChange={e => setSkills({ ...skills, languages: e.target.value })}
                      placeholder={industryPresets[selectedPreset].placeholderLanguages}
                      className="w-full bg-slate-950/60 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
                      {industryPresets[selectedPreset].frameworks}
                    </label>
                    <input
                      type="text"
                      value={skills.frameworks}
                      onChange={e => setSkills({ ...skills, frameworks: e.target.value })}
                      placeholder={industryPresets[selectedPreset].placeholderFrameworks}
                      className="w-full bg-slate-950/60 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
                      {industryPresets[selectedPreset].tools}
                    </label>
                    <input
                      type="text"
                      value={skills.tools}
                      onChange={e => setSkills({ ...skills, tools: e.target.value })}
                      placeholder={industryPresets[selectedPreset].placeholderTools}
                      className="w-full bg-slate-950/60 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form Actions Footer */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setStep(prev => Math.max(1, prev - 1))}
              disabled={step === 1}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-slate-300 rounded-xl hover:text-slate-100 transition-colors cursor-pointer"
            >
              <ChevronLeft size={14} /> Back
            </button>

            {step < 5 ? (
              <button
                onClick={() => setStep(prev => Math.min(5, prev + 1))}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 text-xs font-bold rounded-xl hover:opacity-95 transition-all cursor-pointer"
              >
                Next <ChevronRight size={14} />
              </button>
            ) : (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleGenerateWord}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-slate-900 border border-slate-800 text-slate-100 text-xs font-bold rounded-xl hover:border-slate-700 shadow-md transition-all cursor-pointer"
                >
                  <Download size={14} className="text-cyan-400" />
                  Download ATS Word
                </button>
                <button
                  onClick={handleGeneratePDF}
                  disabled={isGenerating}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 text-xs font-bold rounded-xl hover:opacity-95 shadow-lg shadow-cyan-500/10 transition-all cursor-pointer"
                >
                  <Download size={14} />
                  {isGenerating ? 'Compiling PDF...' : 'Download ATS PDF'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
