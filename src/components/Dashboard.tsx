import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store';
import { Upload, Briefcase, Play, Loader2, History, Trash2, ShieldAlert, User, ExternalLink } from 'lucide-react';

interface DashboardProps {}

export const Dashboard: React.FC<DashboardProps> = () => {
  const { token, user, userApiKey, historyAnalyses, setHistory, setCurrentAnalysis } = useStore();
  
  const [file, setFile] = useState<File | null>(null);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [dragOver, setDragOver] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch history if user is logged in
  const fetchHistory = async () => {
    if (!token) return;
    try {
      const response = await fetch('/api/resumes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setHistory(data.resumes || [], data.analyses || []);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [token]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
        setErrorMsg('');
      } else {
        setErrorMsg('Only PDF files are supported.');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setErrorMsg('');
      } else {
        setErrorMsg('Only PDF files are supported.');
      }
    }
  };

  const handleDeleteHistoryItem = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!token) return;
    if (!confirm('Are you sure you want to delete this history item?')) return;
    
    try {
      const response = await fetch('/api/resumes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'delete', id })
      });
      const data = await response.json();
      if (data.success) {
        fetchHistory();
      }
    } catch (err) {
      console.error('Error deleting history item:', err);
    }
  };

  const handleAnalyze = async () => {
    setErrorMsg('');
    if (!file) {
      setErrorMsg('Please upload a resume PDF file.');
      return;
    }

    // Backend will return error if both environment key and user key are missing

    setIsLoading(true);

    try {
      // Read file as Base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64String = reader.result as string;

        try {
          const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify({
              pdfBase64: base64String,
              jobTitle,
              jobDescription,
              userApiKey
            })
          });

          const contentType = response.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            // It returned a non-JSON page (likely 500 error or timeout)
            const text = await response.text();
            console.error("Serverless API error output:", text);
            throw new Error("API call timed out or failed. Please check your Vercel logs and ensure your DATABASE_URL does not point to the restricted /sys database.");
          }

          const resData = await response.json();
          if (!response.ok || !resData.success) {
            throw new Error(resData.message || 'Analysis failed. Please check your Gemini API key and try again.');
          }

          setCurrentAnalysis(resData.data);
          window.location.hash = '#/analysis';
        } catch (apiErr: any) {
          setErrorMsg(apiErr.message || 'API request failed.');
          setIsLoading(false);
        }
      };
    } catch (err: any) {
      setErrorMsg('Failed to process file.');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Overview Head */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
          AI Resume <span className="text-gradient">ATS Analyzer</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Upload your resume, paste the target job description, and get instant, industry-grade optimization feedback.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Uploader & Form */}
        <div className="lg:col-span-2 space-y-6">
          {errorMsg && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm font-medium animate-in fade-in duration-200">
              {errorMsg}
            </div>
          )}

          {/* Upload Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`glass-card rounded-2xl p-8 text-center border-2 border-dashed cursor-pointer transition-all duration-300 ${
              dragOver 
                ? 'border-cyan-500 bg-cyan-500/5 scale-[1.01]' 
                : file 
                  ? 'border-emerald-500/40 bg-emerald-500/5' 
                  : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900/20'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf"
              className="hidden"
            />
            <div className="mx-auto w-12 h-12 rounded-xl bg-slate-950 flex items-center justify-center text-slate-400 mb-4 shadow-inner">
              <Upload size={22} className={file ? 'text-emerald-400' : 'text-slate-400'} />
            </div>

            {file ? (
              <div>
                <h4 className="text-emerald-400 font-semibold text-sm">{file.name}</h4>
                <p className="text-slate-500 text-xs mt-1">PDF Resume Loaded ({(file.size / 1024 / 1024).toFixed(2)} MB)</p>
              </div>
            ) : (
              <div>
                <h4 className="text-slate-200 font-semibold text-sm">Drag & drop your resume PDF</h4>
                <p className="text-slate-500 text-xs mt-1">or click to browse from files (Max 5MB)</p>
              </div>
            )}
          </div>

          {/* Form Parameters */}
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Target Job Title (Optional)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Briefcase size={16} />
                </span>
                <input
                  type="text"
                  placeholder="e.g. Frontend Engineer, Product Manager"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-900 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Target Job Description (Recommended)
              </label>
              <textarea
                placeholder="Paste the job description here to analyze specific keyword density, skill alignments, and experience matching..."
                rows={6}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-900 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors resize-none"
              />
            </div>

            <div className="pt-2">
              <button
                onClick={handleAnalyze}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold py-3.5 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Analyzing Resume with AI (Gemini)...
                  </>
                ) : (
                  <>
                    <Play size={16} />
                    Run ATS Scoring & Analysis
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Sidebar Panel Group */}
        <div className="space-y-6">
          {/* History logs Card */}
          <div className="glass-card rounded-2xl p-6 h-fit">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-900">
              <History size={18} className="text-cyan-400" />
              <h3 className="font-bold text-slate-200 text-sm uppercase tracking-wider">Analysis History</h3>
            </div>

            {!user ? (
              <div className="text-center py-6">
                <ShieldAlert size={24} className="mx-auto text-slate-500 mb-2" />
                <p className="text-xs text-slate-400 leading-relaxed">
                  Log in or sign up to save your resume scans and build an optimization history track.
                </p>
              </div>
            ) : historyAnalyses.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No previous scans found.</p>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto no-scrollbar">
                {historyAnalyses.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      // Fetch full data or set tab directly
                      setCurrentAnalysis({
                        overallScore: item.overall_score,
                        // Note: We can expand this, but for now we set the tab
                      });
                      window.location.hash = '#/analysis';
                    }}
                    className="p-3 bg-slate-950/60 border border-slate-900 hover:border-slate-800 rounded-xl flex items-center justify-between cursor-pointer group transition-all duration-200"
                  >
                    <div className="min-w-0 pr-2">
                      <h5 className="text-xs font-semibold text-slate-200 truncate">{item.job_title}</h5>
                      <span className="text-[10px] text-slate-500">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        item.overall_score >= 80 
                          ? 'bg-emerald-500/10 text-emerald-400' 
                          : item.overall_score >= 60 
                            ? 'bg-amber-500/10 text-amber-400' 
                            : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {item.overall_score}%
                      </span>
                      <button
                        onClick={(e) => handleDeleteHistoryItem(e, item.id)}
                        className="text-slate-600 hover:text-rose-400 p-1 rounded hover:bg-rose-500/5 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Founder Profile Card */}
          <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-gradient-to-tr from-cyan-500/10 to-emerald-500/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-300"></div>
            
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-900">
              <User size={18} className="text-cyan-400" />
              <h3 className="font-bold text-slate-200 text-sm uppercase tracking-wider">Founder Profile</h3>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-100">Muzammil Tanveer</h4>
                <p className="text-xs text-cyan-400 font-medium mt-0.5">Software Engineer & AI Developer</p>
              </div>
              
              <p className="text-xs text-slate-400 leading-relaxed">
                Software Engineering student, freelance AI Video Creator, Academic Research Specialist, and Full-Stack Developer.
              </p>

              <div className="pt-2">
                <a
                  href="https://muzammil-murex.vercel.app/"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-slate-100 font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all duration-300 cursor-pointer"
                >
                  View Personal Portfolio
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
