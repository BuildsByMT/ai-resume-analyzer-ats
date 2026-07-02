import { useState, useEffect } from 'react';
import { useStore } from './store';
import { Navbar } from './components/Navbar';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { AnalysisResults } from './components/AnalysisResults';
import { ResumeBuilder } from './components/ResumeBuilder';

function App() {
  const { user } = useStore();
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Handle URL Hash routing e.g., #/dashboard, #/login
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#/login') {
        setActiveTab('login');
      } else if (hash === '#/signup') {
        setActiveTab('signup');
      } else if (hash === '#/creator') {
        setActiveTab('creator');
      } else if (hash === '#/analysis') {
        setActiveTab('analysis');
      } else {
        // Fallback to dashboard and set default hash if empty
        setActiveTab('dashboard');
        if (!hash || hash === '#/') {
          window.location.hash = '#/dashboard';
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Run initial check on mount

    return () => window.removeEventListener('hashchange', handleHashChange);
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
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10 animate-in fade-in duration-300">
        {activeTab === 'login' && <Auth mode="login" />}
        {activeTab === 'signup' && <Auth mode="signup" />}
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'analysis' && <AnalysisResults />}
        {activeTab === 'creator' && <ResumeBuilder />}
      </main>

      {/* Footer Branding */}
      <footer className="w-full text-center py-6 border-t border-slate-950 text-[10px] text-slate-600 font-semibold tracking-wider uppercase">
        © 2026 Resume Optimizer Dashboard. All rights reserved. Powered by TiDB Cloud & Gemini AI.
      </footer>
    </div>
  );
}

export default App;
