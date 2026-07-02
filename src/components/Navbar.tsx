import React, { useState } from 'react';
import { useStore } from '../store';
import { SettingsModal } from './SettingsModal';
import { Settings, LogOut, FileText, BarChart3, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab }) => {
  const { user, logout, theme, toggleTheme } = useStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <nav className="glass-panel sticky top-0 z-40 w-full border-b border-slate-900 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={() => { window.location.hash = '#/dashboard'; }}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="p-2 bg-gradient-to-tr from-cyan-500 to-emerald-500 rounded-xl text-slate-950 font-bold shadow-md shadow-cyan-500/10 group-hover:scale-105 transition-transform duration-300">
            <FileText size={18} />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-100">
            Resume<span className="text-gradient font-extrabold">Optimizer</span>
          </span>
        </div>

        {/* Navigation Tabs */}
        {user && (
          <div className="flex items-center gap-1 bg-slate-950/60 p-1 border border-slate-900 rounded-xl max-w-[180px] xs:max-w-[240px] sm:max-w-xs md:max-w-none overflow-x-auto no-scrollbar">
            <button
              onClick={() => { window.location.hash = '#/dashboard'; }}
              className={`px-2.5 py-1 md:px-4 md:py-1.5 rounded-lg text-[10px] md:text-sm font-semibold transition-all duration-300 flex items-center gap-1 md:gap-2 shrink-0 cursor-pointer ${
                activeTab === 'dashboard' || activeTab === 'analysis'
                  ? 'bg-slate-900 text-cyan-400 shadow-sm border border-slate-800'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 size={13} className="md:w-3.5 md:h-3.5" />
              ATS Analyzer
            </button>
            <button
              onClick={() => { window.location.hash = '#/creator'; }}
              className={`px-2.5 py-1 md:px-4 md:py-1.5 rounded-lg text-[10px] md:text-sm font-semibold transition-all duration-300 flex items-center gap-1 md:gap-2 shrink-0 cursor-pointer ${
                activeTab === 'creator'
                  ? 'bg-slate-900 text-cyan-400 shadow-sm border border-slate-800'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText size={13} className="md:w-3.5 md:h-3.5" />
              ATS CV Creator
            </button>
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-3">


          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition-all duration-300 cursor-pointer"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Settings Trigger */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition-all duration-300 cursor-pointer"
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
                  window.location.hash = '#/login';
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
                onClick={() => { window.location.hash = '#/login'; }}
                className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-300 ${
                  activeTab === 'login'
                    ? 'text-slate-100 bg-slate-900 border border-slate-800'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Log In
              </button>
              <button
                onClick={() => { window.location.hash = '#/signup'; }}
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
