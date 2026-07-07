import { useEffect } from 'react';
import { useStore } from './store';
import { Navbar } from './components/Navbar';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { AnalysisResults } from './components/AnalysisResults';
import { ResumeBuilder } from './components/ResumeBuilder';
import { BarChart3, FileText } from 'lucide-react';
import { Chatbot } from './components/Chatbot';
import { Toast } from './components/Toast';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';

function App() {
  const { user } = useStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active tab/path name for navbar and mobile menu styling
  let activeTab = 'dashboard';
  const path = location.pathname.substring(1);
  if (path === 'login' || path === 'signup' || path === 'creator' || path === 'analysis') {
    activeTab = path;
  }

  // Apply saved theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, []);

  // Auto-initialize TiDB Database Tables on mount
  useEffect(() => {
    const initDb = async () => {
      try {
        await fetch('/api/db/init');
      } catch (err) {
        console.error('Failed to initialize database tables on startup:', err);
      }
    };
    initDb();
  }, []);

  // Protect tabs - redirect to login if not authenticated
  useEffect(() => {
    if (!user && (activeTab === 'dashboard' || activeTab === 'creator' || activeTab === 'analysis')) {
      // Allow guest usage for dashboard/analysis, but restrict history and creator if desired.
      // For this app, we allow Guest Mode for dashboard & analysis, but restrict saving.
    }
  }, [user, activeTab]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative antialiased overflow-x-hidden select-none">
      {/* Dynamic Background Glowing Highlights */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-cyan-500/5 to-emerald-500/5 rounded-full blur-3xl pointer-events-none bg-glow-glow"></div>
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-gradient-to-tr from-purple-500/5 to-blue-500/5 rounded-full blur-3xl pointer-events-none bg-glow-glow"></div>

      {/* Navigation Header */}
      <Navbar activeTab={activeTab} />

      {/* Main Container Layout */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6 relative z-10">
        <div key={location.pathname} className="animate-slide-up">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Auth mode="login" />} />
            <Route path="/signup" element={<Auth mode="signup" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analysis" element={<AnalysisResults />} />
            <Route path="/creator" element={<ResumeBuilder />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="w-full text-center py-6 border-t border-slate-950 text-[10px] text-slate-600 font-semibold tracking-wider uppercase pb-24 md:pb-6">
        © 2026 Resume Optimizer Dashboard. All rights reserved. Powered by TiDB Cloud & Gemini AI.
      </footer>

      {/* Mobile Bottom Navigation Bar */}
      {user && (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-slate-950/80 backdrop-blur-lg border-t border-slate-900 px-6 py-2.5 flex items-center justify-around">
          <button
            onClick={() => { navigate('/dashboard'); }}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors duration-300 ${
              activeTab === 'dashboard' || activeTab === 'analysis'
                ? 'text-cyan-400'
                : 'text-slate-500 hover:text-slate-400'
            }`}
          >
            <BarChart3 size={20} />
            <span className="text-[10px] font-bold">ATS Analyzer</span>
          </button>

          <button
            onClick={() => { navigate('/creator'); }}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors duration-300 ${
              activeTab === 'creator'
                ? 'text-cyan-400'
                : 'text-slate-500 hover:text-slate-400'
            }`}
          >
            <FileText size={20} />
            <span className="text-[10px] font-bold">ATS CV Creator</span>
          </button>
        </div>
      )}

      {/* Floating Chatbot Assistant */}
      {user && <Chatbot />}

      {/* Global Toast Notification */}
      <Toast />
    </div>
  );
}

export default App;
