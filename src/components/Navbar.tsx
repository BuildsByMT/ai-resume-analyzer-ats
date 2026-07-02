import React, { useState } from 'react';
import { useStore } from '../store';
import { SettingsModal } from './SettingsModal';
import { Settings, LogOut, FileText, BarChart3, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <nav className="glass-panel sticky top-0 z-40 w-full border-b border-slate-900 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('dashboard')} 
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="p-2 bg-gradient-to-tr from-cyan-500 to-emerald-500 rounded-xl text-slate-950 font-bold shadow-md shadow-cyan-500/10 group-hover:scale-105 transition-transform duration-300">
            <Sparkles size={18} />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-100">
            Resume<span className="text-gradient font-extrabold">Optimizer</span>
          </span>
        </div>

        {/* Navigation Tabs */}
        {user && (
          <div className="hidden md:flex items-center gap-1.5 bg-slate-950/60 p-1.5 border border-slate-900 rounded-xl">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'dashboard' || activeTab === 'analysis'
                  ? 'bg-slate-900 text-cyan-400 shadow-sm border border-slate-800'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 size={15} />
              ATS Analyzer
            </button>
            <button
              onClick={() => setActiveTab('creator')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'creator'
                  ? 'bg-slate-900 text-cyan-400 shadow-sm border border-slate-800'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText size={15} />
              ATS CV Creator
            </button>
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-3">


          {/* Settings Trigger */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition-all duration-300"
            title="Settings"
          >
            <Settings size={18} />
          </button>

          {/* User Session Handler */}
          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden lg:inline text-xs text-slate-400 border-r border-slate-800 pr-3 max-w-[150px] truncate">
                {user.email}
              </span>
              <button
                onClick={() => {
                  logout();
                  setActiveTab('login');
                }}
                className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 hover:border-rose-500/20 rounded-xl transition-all duration-300"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('login')}
                className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-300 ${
                  activeTab === 'login'
                    ? 'text-slate-100 bg-slate-900 border border-slate-800'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Log In
              </button>
              <button
                onClick={() => setActiveTab('signup')}
                className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-semibold px-4 py-2 rounded-xl text-xs transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Settings Modal Component */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </nav>
  );
};
