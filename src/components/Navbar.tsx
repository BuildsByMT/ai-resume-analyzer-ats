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
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  return (
    <nav className="glass-panel sticky top-0 z-40 w-full border-b border-slate-900 px-3 py-3 sm:px-6 sm:py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={() => { window.location.hash = '#/dashboard'; }}
          className="flex items-center gap-1.5 sm:gap-2 cursor-pointer group"
        >
          <div className="p-1.5 sm:p-2 bg-gradient-to-tr from-cyan-500 to-emerald-500 rounded-xl text-slate-950 font-bold shadow-md shadow-cyan-500/10 group-hover:scale-105 transition-transform duration-300 shrink-0">
            <FileText size={16} className="sm:w-[18px] sm:h-[18px]" />
          </div>
          <span className="text-base sm:text-xl font-bold tracking-tight text-slate-100">
            Resume<span className="text-gradient font-extrabold">Optimizer</span>
          </span>
        </div>

        {/* Navigation Tabs (Desktop Only) */}
        {user && (
          <div className="hidden md:flex items-center gap-1.5 bg-slate-950/60 p-1.5 border border-slate-900 rounded-xl">
            <button
              onClick={() => { window.location.hash = '#/dashboard'; }}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2 cursor-pointer shrink-0 ${
                activeTab === 'dashboard' || activeTab === 'analysis'
                  ? 'bg-slate-900 text-cyan-400 shadow-sm border border-slate-800'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 size={15} />
              ATS Analyzer
            </button>
            <button
              onClick={() => { window.location.hash = '#/creator'; }}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2 cursor-pointer shrink-0 ${
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
        <div className="flex items-center gap-1.5 sm:gap-3">

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition-all duration-300 cursor-pointer shrink-0"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={15} className="sm:w-[18px] sm:h-[18px]" /> : <Moon size={15} className="sm:w-[18px] sm:h-[18px]" />}
          </button>

          {/* Settings Trigger */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition-all duration-300 cursor-pointer shrink-0"
            title="Settings"
          >
            <Settings size={15} className="sm:w-[18px] sm:h-[18px]" />
          </button>

          {/* User Session Handler */}
          {user ? (
            <div className="flex items-center gap-1.5 sm:gap-3">
              <span className="hidden lg:inline text-xs text-slate-400 border-r border-slate-800 pr-3 max-w-[150px] truncate">
                {user.email}
              </span>
              <button
                onClick={() => setIsLogoutConfirmOpen(true)}
                className="flex items-center gap-1.5 px-2 py-1.5 sm:px-3 sm:py-2 text-[10px] sm:text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 hover:border-rose-500/20 rounded-xl transition-all duration-300 shrink-0 cursor-pointer"
              >
                <LogOut size={13} className="sm:w-3.5 sm:h-3.5" />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => { window.location.hash = '#/login'; }}
                className={`px-2.5 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-semibold rounded-xl transition-all duration-300 shrink-0 cursor-pointer ${
                  activeTab === 'login'
                    ? 'text-slate-100 bg-slate-900 border border-slate-800'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Log In
              </button>
              <button
                onClick={() => { window.location.hash = '#/signup'; }}
                className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-semibold px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[10px] sm:text-xs transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 shrink-0 cursor-pointer"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Settings Modal Component */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Logout Confirmation Modal */}
      {isLogoutConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-card w-full max-w-sm rounded-2xl p-6 space-y-6 shadow-2xl border border-slate-900 animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-2">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-rose-500/10 text-rose-400 mb-3">
                <LogOut size={22} className="ml-0.5" />
              </div>
              <h3 className="text-lg font-bold text-slate-100">Confirm Logout</h3>
              <p className="text-xs text-slate-400">
                Are you sure you want to logout? You will need to sign in again to access your saved resume grades.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsLogoutConfirmOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-900 text-xs font-semibold text-slate-300 hover:text-slate-100 transition-all duration-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsLogoutConfirmOpen(false);
                  logout();
                  window.location.hash = '#/login';
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:shadow-lg hover:shadow-rose-500/10 text-slate-950 font-bold text-xs transition-all duration-300 cursor-pointer"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
