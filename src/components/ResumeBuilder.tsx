import React, { useState } from 'react';
import { useStore } from '../store';
import { jsPDF } from 'jspdf';
import { ChevronRight, ChevronLeft, Download, Plus, Trash2, Upload, Loader2, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const { token, userApiKey, currentAnalysis, showToast } = useStore();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState('');
  const [parseSuccess, setParseSuccess] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<'tech' | 'hr' | 'engineering' | 'general'>('tech');
  const [visitedSteps, setVisitedSteps] = useState<Record<number, boolean>>({});

  const isContactValid = () => {
    let filledCount = 0;
    if (contact.name?.trim()) filledCount++;
    if (contact.email?.trim()) filledCount++;
    if (contact.phone?.trim()) filledCount++;
    if (contact.location?.trim()) filledCount++;
    if (contact.website?.trim()) filledCount++;
    return filledCount >= 3;
  };

  const isExperienceValid = () => {
    if (!experience || experience.length === 0) return false;
    return experience.some(exp => {
      let filledCount = 0;
      if (exp.company?.trim()) filledCount++;
      if (exp.role?.trim()) filledCount++;
      if (exp.duration?.trim()) filledCount++;
      if (exp.details?.trim()) filledCount++;
      return filledCount >= 3;
    });
  };

  const isEducationValid = () => {
    if (!education || education.length === 0) return false;
    return education.some(edu => {
      let filledCount = 0;
      if (edu.school?.trim()) filledCount++;
      if (edu.degree?.trim()) filledCount++;
      if (edu.duration?.trim()) filledCount++;
      return filledCount >= 2;
    });
  };

  const isProjectsValid = () => {
    if (!projects || projects.length === 0) return false;
    return projects.some(proj => {
      let filledCount = 0;
      if (proj.title?.trim()) filledCount++;
      if (proj.tech?.trim()) filledCount++;
      if (proj.details?.trim()) filledCount++;
      return filledCount >= 2;
    });
  };

  const isSkillsValid = () => {
    let filledCount = 0;
    if (skills.languages?.trim()) filledCount++;
    if (skills.frameworks?.trim()) filledCount++;
    if (skills.tools?.trim()) filledCount++;
    return filledCount >= 2;
  };

  const isStepValid = (stepId: number) => {
    if (stepId === 1) return isContactValid();
    if (stepId === 2) return isExperienceValid();
    if (stepId === 3) return isEducationValid();
    if (stepId === 4) return isProjectsValid();
    if (stepId === 5) return isSkillsValid();
    return true;
  };

  const handleSetStep = (newStep: number) => {
    setVisitedSteps(prev => ({ ...prev, [step]: true }));
    setStep(newStep);
  };
  
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
          showToast('AI Resume has been uploaded successfully!', 'success');
          setStep(1);
          setVisitedSteps({});
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

      // Helper to dynamically check page break and reset height
      const checkPageBreak = (neededHeight: number) => {
        const pageHeight = doc.internal.pageSize.getHeight();
        if (y + neededHeight > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
      };


      // Helper to draw clean bullet points with a hanging indent
      const addBullet = (bulletText: string) => {
        const indent = 12; // Indentation offset for bullet details
        const cleanText = bulletText.trim().replace(/^•\s*/, '');
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        
        const wrappedLines = doc.splitTextToSize(cleanText, contentWidth - indent);
        const lineHeight = 11.5;
        const neededHeight = wrappedLines.length * lineHeight;
        
        if (y + neededHeight > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          y = margin;
        }
        
        // Draw the bullet character
        doc.text('•', margin, y);
        
        // Draw the indented multiline text block
        wrappedLines.forEach((line: string, index: number) => {
          doc.text(line, margin + indent, y + (index * lineHeight));
        });
        
        y += neededHeight + 4;
      };

      // Helper to draw skills with bold labels and properly aligned values
      const addSkillLine = (label: string, value: string) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        const labelWidth = doc.getTextWidth(`${label}: `);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        const wrappedValues = doc.splitTextToSize(value, contentWidth - labelWidth);
        
        const lineHeight = 12;
        const neededHeight = wrappedValues.length * lineHeight;
        
        if (y + neededHeight > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          y = margin;
        }
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.text(`${label}:`, margin, y);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        wrappedValues.forEach((line: string, index: number) => {
          doc.text(line, margin + labelWidth, y + (index * lineHeight));
        });
        
        y += neededHeight + 4;
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
        // Pre-check for section header page break
        checkPageBreak(30);

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

          checkPageBreak(30);
          
          const durationText = exp.duration || 'Date range';
          const durationWidth = doc.getTextWidth(durationText);
          
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          
          const maxRoleWidth = contentWidth - durationWidth - 15;
          const wrappedRole = doc.splitTextToSize(exp.role || 'Role', maxRoleWidth);
          
          wrappedRole.forEach((line: string, index: number) => {
            doc.text(line, margin, y + (index * 12));
          });
          
          doc.setFont('helvetica', 'normal');
          doc.text(durationText, pageWidth - margin, y, { align: 'right' });
          
          y += (wrappedRole.length * 12);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9.5);
          doc.text(exp.company || 'Company', margin, y);
          y += 14;

          if (exp.details) {
            const bulletPoints = exp.details.split('\n').filter(Boolean);
            bulletPoints.forEach(bullet => {
              addBullet(bullet);
            });
            y += 2;
          }
        });
      }

      // 2. Education Section
      if (education.some(edu => edu.school || edu.degree)) {
        addSectionHeading('Education');
        education.forEach(edu => {
          if (!edu.school && !edu.degree) return;

          checkPageBreak(30);

          const durationText = edu.duration || 'Date range';
          const durationWidth = doc.getTextWidth(durationText);
          
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          
          const maxDegreeWidth = contentWidth - durationWidth - 15;
          const wrappedDegree = doc.splitTextToSize(edu.degree || 'Degree', maxDegreeWidth);
          
          wrappedDegree.forEach((line: string, index: number) => {
            doc.text(line, margin, y + (index * 12));
          });

          doc.setFont('helvetica', 'normal');
          doc.text(durationText, pageWidth - margin, y, { align: 'right' });
          
          y += (wrappedDegree.length * 12);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9.5);
          doc.text(edu.school || 'School', margin, y);
          y += 16;
        });
      }

      // 3. Projects Section
      if (projects.some(proj => proj.title)) {
        addSectionHeading('Projects');
        projects.forEach(proj => {
          if (!proj.title) return;

          checkPageBreak(25);

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          const titleText = proj.title;
          const titleWidth = doc.getTextWidth(titleText);
          const techText = proj.tech ? ` [${proj.tech}]` : '';
          
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          const techWidth = doc.getTextWidth(techText);
          
          const totalWidth = titleWidth + (proj.tech ? techWidth + 5 : 0);
          
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          
          if (totalWidth > contentWidth) {
            doc.text(titleText, margin, y);
            y += 11;
            if (proj.tech) {
              doc.setFont('helvetica', 'normal');
              doc.setFontSize(8.5);
              doc.text(`[${proj.tech}]`, margin, y);
              y += 11;
            }
          } else {
            doc.text(titleText, margin, y);
            if (proj.tech) {
              doc.setFont('helvetica', 'normal');
              doc.setFontSize(8.5);
              doc.text(`[${proj.tech}]`, margin + titleWidth + 5, y);
            }
            y += 12;
          }

          if (proj.details) {
            const bulletPoints = proj.details.split('\n').filter(Boolean);
            bulletPoints.forEach(bullet => {
              addBullet(bullet);
            });
            y += 2;
          }
        });
      }

      // 4. Skills Section
      if (skills.languages || skills.frameworks || skills.tools) {
        addSectionHeading('Technical Skills');
        const presetLabels = industryPresets[selectedPreset];
        if (skills.languages) {
          addSkillLine(presetLabels.languages, skills.languages);
        }
        if (skills.frameworks) {
          addSkillLine(presetLabels.frameworks, skills.frameworks);
        }
        if (skills.tools) {
          addSkillLine(presetLabels.tools, skills.tools);
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

      {/* Horizontal Wavy Stepper */}
      <div className="glass-card rounded-2xl p-4 mb-6 relative overflow-hidden flex justify-center border border-slate-900 shadow-lg">
        <div className="w-full max-w-2xl px-2">
          <svg viewBox="0 0 500 135" className="w-full h-auto overflow-visible select-none">
            <defs>
              <linearGradient id="stepperGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>

            {/* Inactive background wave path */}
            <path
              d="M 50,70 C 100,70 100,100 150,100 C 200,100 200,70 250,70 C 300,70 300,45 350,45 L 450,45"
              fill="none"
              className="stroke-slate-800"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Active animated foreground wave path */}
            <path
              d="M 50,70 C 100,70 100,100 150,100 C 200,100 200,70 250,70 C 300,70 300,45 350,45 L 450,45"
              fill="none"
              stroke="url(#stepperGradient)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="415"
              strokeDashoffset={415 - (415 * (step - 1) / 4)}
              className="transition-all duration-700 ease-in-out"
            />

            {/* Step Nodes and Labels */}
            {[
              { id: 1, label: 'Contact', tooltip: 'Organization & Contact', cx: 50, cy: 70 },
              { id: 2, label: 'Experience', tooltip: 'Work Experience', cx: 150, cy: 100 },
              { id: 3, label: 'Education', tooltip: 'Academic History', cx: 250, cy: 70 },
              { id: 4, label: 'Projects', tooltip: 'Key Projects & Details', cx: 350, cy: 45 },
              { id: 5, label: 'Skills', tooltip: 'Technical Skills', cx: 450, cy: 45 }
            ].map((s) => {
              const isActive = step === s.id;
              const isVisited = visitedSteps[s.id] || step > s.id;
              const isValid = isStepValid(s.id);
              const isCompleted = isVisited && isValid;
              const isInvalid = isVisited && !isValid;

              return (
                <g key={s.id} className="group/node cursor-pointer" onClick={() => handleSetStep(s.id)}>
                  {/* Pulsating Ring for Active Step */}
                  {isActive && (
                    <circle
                      cx={s.cx}
                      cy={s.cy}
                      r="12"
                      className="fill-cyan-500/20 stroke-none animate-pulse"
                    />
                  )}

                  {/* Node Dot / Circle */}
                  {isCompleted ? (
                    <>
                      <circle cx={s.cx} cy={s.cy} r="9" className="fill-emerald-500 stroke-none" />
                      <path
                        d={`M ${s.cx - 3.5},${s.cy} l 2.5,2.5 l 4.5,-4.5`}
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </>
                  ) : isInvalid ? (
                    <>
                      <circle cx={s.cx} cy={s.cy} r="9" className="fill-rose-500 stroke-none" />
                      <path
                        d={`M ${s.cx - 2.5},${s.cy - 2.5} L ${s.cx + 2.5},${s.cy + 2.5} M ${s.cx + 2.5},${s.cy - 2.5} L ${s.cx - 2.5},${s.cy + 2.5}`}
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </>
                  ) : isActive ? (
                    <circle
                      cx={s.cx}
                      cy={s.cy}
                      r="7"
                      className="fill-cyan-400 stroke-slate-950 stroke-[2] shadow-lg shadow-cyan-500/20"
                    />
                  ) : (
                    <circle
                      cx={s.cx}
                      cy={s.cy}
                      r="6"
                      className="fill-slate-800 hover:fill-slate-700 stroke-slate-700 stroke-[1.5] transition-colors duration-200"
                    />
                  )}

                  {/* Label Text */}
                  <text
                    x={s.cx}
                    y={s.cy + 22}
                    textAnchor="middle"
                    className={`text-[9px] font-bold tracking-tight select-none transition-colors duration-300 ${
                      isActive
                        ? 'fill-cyan-400 font-extrabold'
                        : isCompleted
                        ? 'fill-emerald-400 font-bold'
                        : isInvalid
                        ? 'fill-rose-400 font-bold'
                        : 'fill-slate-500 hover:fill-slate-400'
                    }`}
                  >
                    {s.label}
                  </text>

                  {/* Floating Speech Bubble Tooltip */}
                  <g
                    className={`transition-all duration-300 transform origin-bottom ${
                      isActive
                        ? 'opacity-100 scale-100 translate-y-0'
                        : 'opacity-0 scale-95 translate-y-1 group-hover/node:opacity-100 group-hover/node:scale-100 group-hover/node:translate-y-0 pointer-events-none'
                    }`}
                  >
                    {/* Bubble SVG Path pointing down */}
                    <path
                      d={`M ${s.cx - 48},${s.cy - 36} h 96 a 3,3 0 0 1 3,3 v 10 a 3,3 0 0 1 -3,3 h -44 l -4,5 l -4,-5 h -44 a 3,3 0 0 1 -3,-3 v -10 a 3,3 0 0 1 3,-3 z`}
                      className={`stroke-2 ${
                        isInvalid
                          ? 'fill-slate-900 stroke-rose-400 shadow-md'
                          : isActive
                          ? 'fill-slate-900 stroke-cyan-400 shadow-md'
                          : 'fill-slate-950 stroke-slate-800 shadow-md'
                      } transition-colors duration-300`}
                    />
                    <text
                      x={s.cx}
                      y={s.cy - 26}
                      textAnchor="middle"
                      className={`text-[7.5px] font-extrabold select-none antialiased ${
                        isInvalid
                          ? 'fill-rose-400'
                          : isActive
                          ? 'fill-cyan-400'
                          : 'fill-slate-400'
                      }`}
                    >
                      {isInvalid ? '⚠️ Action Required' : s.tooltip}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Step Inputs */}
        <div className={`${currentAnalysis ? 'lg:col-span-3' : 'lg:col-span-4'} space-y-6`}>
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
              onClick={() => handleSetStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-slate-300 rounded-xl hover:text-slate-100 transition-colors cursor-pointer"
            >
              <ChevronLeft size={14} /> Back
            </button>

            {step < 5 ? (
              <button
                onClick={() => handleSetStep(Math.min(5, step + 1))}
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

        {/* Right Sidebar: AI Optimization Assistant */}
        {currentAnalysis && (
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-card rounded-2xl p-5 border border-cyan-500/20 relative overflow-hidden h-fit">
              <div className="absolute -right-10 -top-10 w-24 h-24 bg-gradient-to-tr from-cyan-500/10 to-emerald-500/10 rounded-full blur-2xl"></div>
              
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-900">
                <Sparkles size={16} className="text-cyan-400 animate-pulse shrink-0" />
                <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider">AI CV Assistant</h3>
              </div>

              {!token ? (
                <div className="text-center py-4 space-y-3">
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Log in or Sign up to unlock interactive suggestions that auto-apply directly to your CV creator forms!
                  </p>
                  <button
                    onClick={() => { navigate('/login'); }}
                    className="w-full bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold py-2 rounded-xl text-xs cursor-pointer shadow-md"
                  >
                    Log In / Sign Up
                  </button>
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto no-scrollbar">
                  {/* Missing Keywords */}
                  {currentAnalysis.keywords?.missing?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Add Missing Keywords</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {currentAnalysis.keywords.missing.map((kw: string, i: number) => (
                          <button
                            key={i}
                            onClick={() => {
                              const currentSkills = skills.languages ? `${skills.languages}, ${kw}` : kw;
                              setSkills({ ...skills, languages: currentSkills });
                            }}
                            className="px-2 py-1 bg-slate-950 hover:bg-slate-900 border border-slate-900 text-slate-300 hover:text-cyan-400 rounded-lg text-[9px] font-medium transition-colors flex items-center gap-1 cursor-pointer"
                            title="Click to add to Skills"
                          >
                            + {kw}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bullet Rewriting Suggestions */}
                  {currentAnalysis.rewritingSuggestions?.length > 0 && (
                    <div className="space-y-3 pt-2 border-t border-slate-900">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Optimize Bullets</h4>
                      {currentAnalysis.rewritingSuggestions.map((item: any, i: number) => {
                        const isAlreadyApplied = experience.length > 0 &&
                          (experience[experience.length - 1].details || '').includes(item.suggested);

                        return (
                          <div key={i} className="p-2.5 bg-slate-950/60 border border-slate-900 rounded-xl space-y-2 text-[10px]">
                            <div>
                              <span className="text-slate-500 font-semibold uppercase block text-[8px] mb-0.5">AI Suggestion</span>
                              <p className="text-slate-200 font-medium leading-relaxed italic">"{item.suggested}"</p>
                            </div>
                            
                            <button
                              disabled={isAlreadyApplied}
                              onClick={() => {
                                if (experience.length > 0) {
                                  const lastIndex = experience.length - 1;
                                  const newExp = [...experience];
                                  const currentDetails = newExp[lastIndex].details || '';
                                  if (!currentDetails.includes(item.suggested)) {
                                    newExp[lastIndex].details = currentDetails
                                      ? `${currentDetails.trim()}\n•  ${item.suggested}`
                                      : `•  ${item.suggested}`;
                                    setExperience(newExp);
                                  }
                                }
                              }}
                              className={`w-full font-semibold py-1.5 rounded-lg text-[9px] text-center transition-all ${
                                isAlreadyApplied
                                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 cursor-not-allowed'
                                  : 'bg-cyan-500/5 hover:bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 cursor-pointer'
                              }`}
                            >
                              {isAlreadyApplied ? '✓ Applied' : 'Apply to Latest Role'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
