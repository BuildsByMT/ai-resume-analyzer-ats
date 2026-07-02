import React, { useState } from 'react';
import { useStore } from '../store';
import { X, Key, ShieldCheck } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { userApiKey, setUserApiKey } = useStore();
  const [apiKeyInput, setApiKeyInput] = useState(userApiKey || '');
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setUserApiKey(apiKeyInput.trim() || null);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="glass-card w-full max-w-md rounded-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-cyan-500/10 rounded-xl text-cyan-400">
            <Key size={22} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-100">API Key Configuration</h3>
            <p className="text-xs text-slate-400">Manage your private AI service key</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider">
              Google Gemini API Key
            </label>
            <input
              type="password"
              placeholder="Paste your Gemini API key here..."
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
            <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
              To operate 100% free of charge, get a free key from{' '}
              <a 
                href="https://aistudio.google.com/" 
                target="_blank" 
                rel="noreferrer" 
                className="text-cyan-400 hover:underline inline-flex items-center"
              >
                Google AI Studio
              </a>. Keys are stored locally in your browser's LocalStorage and never sent to our servers.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSave}
              disabled={isSaved}
              className="w-full bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-medium py-2.5 rounded-xl transition-all duration-300 hover:opacity-95 hover:shadow-lg hover:shadow-cyan-500/10 flex items-center justify-center gap-2"
            >
              {isSaved ? (
                <>
                  <ShieldCheck size={18} />
                  Saved Securely!
                </>
              ) : (
                'Save Settings'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
