import React, { useState } from 'react';
import { useStore } from '../store';
import { ChevronLeft, BarChart2, BookOpen, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';

interface AnalysisResultsProps {
  setActiveTab: (tab: string) => void;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ setActiveTab }) => {
  const { currentAnalysis } = useStore();
  const [activeSubTab, setActiveSubTab] = useState<'keywords' | 'formatting' | 'suggestions'>('keywords');

  if (!currentAnalysis) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4">
        <HelpCircle size={48} className="mx-auto text-slate-600 mb-4" />
        <h3 className="text-xl font-bold text-slate-200">No active analysis</h3>
        <p className="text-slate-500 text-sm mt-2">Please upload and scan a resume from the dashboard home.</p>
        <button
          onClick={() => setActiveTab('dashboard')}
          className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 hover:text-slate-100 transition-colors"
        >
          <ChevronLeft size={14} /> Back to Dashboard
        </button>
      </div>
    );
  }

  const { overallScore, breakdown, keywords, formattingIssues, rewritingSuggestions } = currentAnalysis;
  const scoreColor = overallScore >= 80 ? 'text-emerald-400' : overallScore >= 60 ? 'text-amber-400' : 'text-rose-400';
  const scoreBorderColor = overallScore >= 80 ? 'border-emerald-500/20' : overallScore >= 60 ? 'border-amber-500/20' : 'border-rose-500/20';

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Return Navigation */}
      <div className="mb-6">
        <button
          onClick={() => setActiveTab('dashboard')}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-900/60 border border-slate-800/80 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <ChevronLeft size={14} />
          Back to Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Score Summary Panel */}
        <div className="glass-card rounded-2xl p-6 flex flex-col items-center text-center h-fit">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-6">ATS Match Score</h3>

          {/* Radial score gauge */}
          <div className={`relative w-36 h-36 rounded-full border-8 flex items-center justify-center ${scoreBorderColor} mb-6`}>
            <div className="text-center">
              <span className={`text-4xl font-extrabold tracking-tight ${scoreColor}`}>{overallScore || 0}</span>
              <span className="text-slate-500 text-xs block mt-0.5">% Match</span>
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
        </div>

        {/* Right Side: Tabbed Details Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sub-tabs header selection */}
          <div className="flex bg-slate-950/60 p-1 border border-slate-900 rounded-xl">
            <button
              onClick={() => setActiveSubTab('keywords')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-1.5 ${
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
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-1.5 ${
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
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-1.5 ${
                activeSubTab === 'suggestions'
                  ? 'bg-slate-900 text-cyan-400 border border-slate-800/80 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen size={14} />
              AI Bullet Editor
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
                      <span key={i} className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium rounded-lg">
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
                      <span key={i} className="px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium rounded-lg">
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
                    <div key={i} className="flex gap-3 p-3.5 bg-rose-500/5 border border-rose-500/10 rounded-xl text-xs text-rose-400 leading-relaxed">
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
                  <div key={i} className="glass-card rounded-2xl p-5 space-y-3">
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
                      <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                        <span className="block text-[10px] font-semibold text-emerald-500 uppercase mb-1">ATS-Optimized</span>
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
        </div>
      </div>
    </div>
  );
};
