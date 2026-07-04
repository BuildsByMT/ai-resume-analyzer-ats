import React, { useState } from 'react';
import { useStore } from '../store';
import { ChevronLeft, BarChart2, BookOpen, AlertTriangle, CheckCircle, HelpCircle, Copy, Info, Layers, Building, CheckSquare, Sparkles } from 'lucide-react';

interface AnalysisResultsProps {}

export const AnalysisResults: React.FC<AnalysisResultsProps> = () => {
  const { currentAnalysis } = useStore();
  const [activeSubTab, setActiveSubTab] = useState<'keywords' | 'formatting' | 'suggestions' | 'optimization'>('keywords');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const pageOptimization = currentAnalysis?.pageOptimization || {
    estimatedPageCount: 1.0,
    lengthEvaluation: "Your resume appears to have a standard layout. We recommend maintaining a clean, full-page format.",
    lengthRecommendation: "Ensure all sections fit within complete page boundaries (exactly 1 or 2 pages) depending on your target role.",
    companyPreferences: [
      {
        companyType: "Tech Startups & Modern Tech",
        encouragedFormat: "1-page modern single-column layout. High-impact results prioritized.",
        suitability: "Highly Recommended"
      },
      {
        companyType: "Traditional Enterprises & Finance",
        encouragedFormat: "1-2 page classic layout. Highlights structured business metrics.",
        suitability: "Suitable"
      },
      {
        companyType: "Federal & Defense Contractors",
        encouragedFormat: "Detailed multi-page resume. Fully lists clearances and projects.",
        suitability: "Suitable"
      }
    ],
    structuralChecklist: [
      {
        section: "Professional Experience Descriptions",
        status: "success",
        feedback: "Found detailed job descriptions and bullet points."
      }
    ],
    technicalityFeedback: "The technicality level is standard. Ensure your technical toolset is referenced contextually inside job description bullet points."
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };

  if (!currentAnalysis) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4">
        <HelpCircle size={48} className="mx-auto text-slate-600 mb-4" />
        <h3 className="text-xl font-bold text-slate-200">No active analysis</h3>
        <p className="text-slate-500 text-sm mt-2">Please upload and scan a resume from the dashboard home.</p>
        <button
          onClick={() => { window.location.hash = '#/dashboard'; }}
          className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 hover:text-slate-100 transition-colors"
        >
          <ChevronLeft size={14} /> Back to Dashboard
        </button>
      </div>
    );
  }

  const { overallScore, breakdown, keywords, formattingIssues, rewritingSuggestions } = currentAnalysis;
  const scoreColor = overallScore >= 80 ? 'text-emerald-400' : overallScore >= 60 ? 'text-amber-400' : 'text-rose-400';

  return (
    <div className="max-w-[1600px] mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Return Navigation */}
      <div className="mb-6">
        <button
          onClick={() => { window.location.hash = '#/dashboard'; }}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-900/60 border border-slate-800/80 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <ChevronLeft size={14} />
          Back to Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Side: Score Summary Panel */}
        <div className="glass-card rounded-2xl p-6 flex flex-col items-center text-center h-fit">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-6">ATS Match Score</h3>

          {/* Radial score gauge (Animated SVG Circular Progress) */}
          <div className="relative w-36 h-36 flex items-center justify-center mb-6">
            <svg className="w-full h-full transform -rotate-90">
              {/* Background Circle */}
              <circle
                cx="72"
                cy="72"
                r="60"
                className="stroke-slate-900/60"
                strokeWidth="8"
                fill="transparent"
              />
              {/* Animated Foreground Progress Circle */}
              <circle
                cx="72"
                cy="72"
                r="60"
                className={`stroke-current ${scoreColor} animate-circle-fill`}
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={377}
                strokeDashoffset={377 - (377 * (overallScore || 0)) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute text-center">
              <span className={`text-4xl font-extrabold tracking-tight ${scoreColor}`}>{overallScore || 0}</span>
              <span className="text-slate-500 text-[10px] font-bold block uppercase mt-0.5">% Match</span>
            </div>
          </div>

          {/* Subscores breakdown list */}
          <div className="w-full space-y-4 text-left border-t border-slate-900 pt-6">
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-400">Keyword Density</span>
                <span className="text-slate-200">{breakdown?.keywordScore || 0}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-1.5">
                <div 
                  className="bg-cyan-500 h-1.5 rounded-full" 
                  style={{ width: `${breakdown?.keywordScore || 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-400">Experience Alignment</span>
                <span className="text-slate-200">{breakdown?.experienceScore || 0}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-1.5">
                <div 
                  className="bg-emerald-500 h-1.5 rounded-full" 
                  style={{ width: `${breakdown?.experienceScore || 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-400">Formatting Check</span>
                <span className="text-slate-200">{breakdown?.formattingScore || 0}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-1.5">
                <div 
                  className="bg-purple-500 h-1.5 rounded-full" 
                  style={{ width: `${breakdown?.formattingScore || 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Disclaimer Note */}
          <div className="mt-5 p-3 bg-slate-950/40 border border-slate-900/60 rounded-xl text-[10px] text-slate-500 leading-relaxed text-left flex items-start gap-1.5">
            <Info size={12} className="text-cyan-500 shrink-0 mt-0.5" />
            <span>
              Note: This score is a simulated estimate of standard ATS scanning filters. Official scanner algorithms may vary by vendor.
            </span>
          </div>
        </div>

        {/* Right Side: Tabbed Details Panel */}
        <div className="lg:col-span-3 space-y-6">
          {/* Sub-tabs header selection */}
          <div className="flex bg-slate-950/60 p-1 border border-slate-900 rounded-xl overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveSubTab('keywords')}
              className={`flex-1 shrink-0 py-2 px-4 text-xs font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-1.5 ${
                activeSubTab === 'keywords'
                  ? 'bg-slate-900 text-cyan-400 border border-slate-800/80 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart2 size={14} />
              Keywords & Skills
            </button>
            <button
              onClick={() => setActiveSubTab('formatting')}
              className={`flex-1 shrink-0 py-2 px-4 text-xs font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-1.5 ${
                activeSubTab === 'formatting'
                  ? 'bg-slate-900 text-cyan-400 border border-slate-800/80 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <AlertTriangle size={14} />
              ATS Formatting
            </button>
            <button
              onClick={() => setActiveSubTab('suggestions')}
              className={`flex-1 shrink-0 py-2 px-4 text-xs font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-1.5 ${
                activeSubTab === 'suggestions'
                  ? 'bg-slate-900 text-cyan-400 border border-slate-800/80 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen size={14} />
              AI Bullet Editor
            </button>
            <button
              onClick={() => setActiveSubTab('optimization')}
              className={`flex-1 shrink-0 py-2 px-4 text-xs font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-1.5 ${
                activeSubTab === 'optimization'
                  ? 'bg-slate-900 text-cyan-400 border border-slate-800/80 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers size={14} />
              Page & Content Guide
            </button>
          </div>

          {/* Sub-tab: Keywords & Skills */}
          {activeSubTab === 'keywords' && (
            <div className="glass-card rounded-2xl p-6 space-y-6 animate-in fade-in duration-200">
              <div>
                <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2 mb-3">
                  <CheckCircle size={15} className="text-emerald-400" />
                  Matched Keywords ({keywords?.matched?.length || 0})
                </h4>
                {keywords?.matched?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {keywords.matched.map((kw: string, i: number) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium rounded-lg animate-scale-in"
                        style={{ animationDelay: `${i * 40}ms` }}
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">No matched keywords identified.</p>
                )}
              </div>

              <div className="border-t border-slate-900 pt-6">
                <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2 mb-3">
                  <AlertTriangle size={15} className="text-rose-400" />
                  Missing Job Keywords ({keywords?.missing?.length || 0})
                </h4>
                {keywords?.missing?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {keywords.missing.map((kw: string, i: number) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium rounded-lg animate-scale-in"
                        style={{ animationDelay: `${i * 40}ms` }}
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">Perfect match! No missing keywords.</p>
                )}
              </div>
            </div>
          )}

          {/* Sub-tab: ATS Formatting */}
          {activeSubTab === 'formatting' && (
            <div className="glass-card rounded-2xl p-6 animate-in fade-in duration-200">
              <h4 className="text-sm font-semibold text-slate-300 mb-4">ATS Compatibility Checklist</h4>
              {formattingIssues && formattingIssues.length > 0 ? (
                <div className="space-y-3">
                  {formattingIssues.map((issue: string, i: number) => (
                    <div
                      key={i}
                      className="flex gap-3 p-3.5 bg-rose-500/5 border border-rose-500/10 rounded-xl text-xs text-rose-400 leading-relaxed animate-slide-up"
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                      <span>{issue}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <CheckCircle size={32} className="mx-auto text-emerald-400 mb-2" />
                  <p className="text-xs text-slate-400">Excellent! Your resume layout is 100% ATS-friendly.</p>
                </div>
              )}
            </div>
          )}

          {/* Sub-tab: AI Bullet Editor */}
          {activeSubTab === 'suggestions' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {rewritingSuggestions && rewritingSuggestions.length > 0 ? (
                rewritingSuggestions.map((item: any, i: number) => (
                  <div
                    key={i}
                    className="glass-card rounded-2xl p-5 space-y-3 animate-slide-up"
                    style={{ animationDelay: `${i * 150}ms` }}
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-widest px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded">
                        Suggestion #{i + 1}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                      <div className="p-3 bg-slate-950/60 border border-slate-900 rounded-xl">
                        <span className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Your Phrasing</span>
                        <p className="text-xs text-slate-400 leading-relaxed italic">"{item.original}"</p>
                      </div>
                      <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl relative">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-semibold text-emerald-500 uppercase">ATS-Optimized</span>
                          <button
                            onClick={() => handleCopy(item.suggested, i)}
                            className="text-[10px] font-semibold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 cursor-pointer bg-slate-900/60 px-2 py-0.5 rounded border border-slate-800"
                            title="Copy suggestion to clipboard"
                          >
                            {copiedIndex === i ? (
                              <span className="text-emerald-400">Copied!</span>
                            ) : (
                              <>
                                <Copy size={11} />
                                Copy
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed font-medium">"{item.suggested}"</p>
                      </div>
                    </div>

                    {item.reason && (
                      <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-950/30 p-2 rounded-lg border border-slate-900/60">
                        <span className="font-semibold text-slate-300">Reason:</span> {item.reason}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="glass-card rounded-2xl p-8 text-center">
                  <CheckCircle size={32} className="mx-auto text-emerald-400 mb-2" />
                  <p className="text-xs text-slate-400">Excellent content! The AI did not find any phrasing changes needed.</p>
                </div>
              )}
            </div>
          )}

          {/* Sub-tab: Page & Content Guide */}
          {activeSubTab === 'optimization' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Row 1: Page Length Assessment */}
              <div className="glass-card rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-xl animate-scale-in">
                    <Layers size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">Resume Page Length Optimization</h4>
                    <p className="text-[11px] text-slate-500">Evaluating page boundaries and density for modern recruitment standards</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 animate-slide-up">
                  <div className="md:col-span-1 p-5 bg-slate-950/60 border border-slate-900 rounded-2xl flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Estimated Length</span>
                    <div className="text-3xl font-extrabold text-cyan-400 mt-1">
                      {pageOptimization.estimatedPageCount} {pageOptimization.estimatedPageCount === 1 ? 'Page' : 'Pages'}
                    </div>
                    {pageOptimization.estimatedPageCount % 1 !== 0 ? (
                      <span className="mt-2.5 px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold rounded-full">
                        Partial Page Warning
                      </span>
                    ) : (
                      <span className="mt-2.5 px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-full">
                        Perfect Page Boundary
                      </span>
                    )}
                  </div>

                  <div className="md:col-span-2 space-y-3.5">
                    <div className="p-4 bg-slate-950/30 border border-slate-900/60 rounded-2xl text-xs text-slate-300 leading-relaxed">
                      <span className="font-bold text-slate-200 block mb-1">Layout Spacing Evaluation:</span>
                      {pageOptimization.lengthEvaluation}
                    </div>
                    <div className="p-4 bg-cyan-500/5 border border-cyan-500/10 rounded-2xl text-xs text-cyan-400 leading-relaxed">
                      <span className="font-bold text-cyan-300 block mb-1">Formatting Action Recommendation:</span>
                      {pageOptimization.lengthRecommendation}
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2: Company Preferences & Market Standards */}
              <div className="glass-card rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl animate-scale-in">
                    <Building size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">Company & Market Format Guidelines</h4>
                    <p className="text-[11px] text-slate-500">Corporate expectations and template preferences in the current job market</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  {pageOptimization.companyPreferences?.map((pref: any, i: number) => {
                    const suitabilityColors = 
                      pref.suitability?.toLowerCase().includes('highly') ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
                      pref.suitability?.toLowerCase().includes('require') || pref.suitability?.toLowerCase().includes('expansion') ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' :
                      'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400';
                    return (
                      <div 
                        key={i} 
                        className="p-4.5 bg-slate-950/60 border border-slate-900 rounded-2xl flex flex-col justify-between space-y-4 hover:border-slate-800 transition-colors duration-300 animate-slide-up"
                        style={{ animationDelay: `${i * 80}ms` }}
                      >
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-start gap-2">
                            <span className="text-xs font-bold text-slate-300">{pref.companyType}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">{pref.encouragedFormat}</p>
                        </div>
                        <span className={`self-start px-2 py-0.5 text-[9px] font-bold rounded-md border ${suitabilityColors}`}>
                          {pref.suitability}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Row 3: Section Checklist & Technicality */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Structural Checklist */}
                <div className="glass-card rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-3 mb-2 animate-scale-in">
                    <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
                      <CheckSquare size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-200">Section Completeness Check</h4>
                      <p className="text-[11px] text-slate-500">Checking for missing details or thin descriptions</p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-1">
                    {pageOptimization.structuralChecklist?.map((chk: any, i: number) => {
                      const statusColor = chk.status === 'success' ? 'text-emerald-400 bg-emerald-500/5 border-emerald-500/10' :
                                          chk.status === 'warning' ? 'text-amber-400 bg-amber-500/5 border-amber-500/10' :
                                          'text-rose-400 bg-rose-500/5 border-rose-500/10';
                      return (
                        <div 
                          key={i} 
                          className={`p-3.5 border rounded-xl flex gap-3 text-xs leading-relaxed transition-all duration-300 hover:bg-slate-900/40 animate-slide-up ${statusColor}`}
                          style={{ animationDelay: `${i * 100}ms` }}
                        >
                          {chk.status === 'success' ? <CheckCircle size={16} className="shrink-0 mt-0.5" /> : 
                           chk.status === 'warning' ? <AlertTriangle size={16} className="shrink-0 mt-0.5" /> : 
                           <AlertTriangle size={16} className="shrink-0 mt-0.5 text-rose-500" />}
                          <div>
                            <span className="font-bold block mb-0.5">{chk.section}</span>
                            <span className="opacity-80 block text-[11px]">{chk.feedback}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Technical Depth */}
                <div className="glass-card rounded-2xl p-6 space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-2 animate-scale-in">
                      <div className="p-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl">
                        <Sparkles size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-200">Resume Technicality Level</h4>
                        <p className="text-[11px] text-slate-500">Analyzing depth of professional/technical syntax</p>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-950/60 border border-slate-900 rounded-2xl text-xs text-slate-300 leading-relaxed animate-slide-up">
                      <span className="font-bold text-slate-200 block mb-1">AI Evaluator Notes:</span>
                      {pageOptimization.technicalityFeedback}
                    </div>
                  </div>

                  <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl text-[10px] text-rose-400 leading-relaxed flex items-start gap-2 animate-slide-up" style={{ animationDelay: '150ms' }}>
                    <Info size={12} className="shrink-0 mt-0.5 text-rose-500" />
                    <span>Avoid simply dumping technical terms in a list. Recruiter screening algorithms prefer tools mentioned contextually within project results.</span>
                  </div>
                </div>

              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};
