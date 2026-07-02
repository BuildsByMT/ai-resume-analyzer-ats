import { create } from 'zustand';

interface User {
  id: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  userApiKey: string | null;
  historyResumes: any[];
  historyAnalyses: any[];
  currentAnalysis: any | null;
  theme: 'light' | 'dark';
  setAuth: (user: User | null, token: string | null) => void;
  logout: () => void;
  setUserApiKey: (key: string | null) => void;
  setHistory: (resumes: any[], analyses: any[]) => void;
  setCurrentAnalysis: (analysis: any | null) => void;
  toggleTheme: () => void;
}

export const useStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  userApiKey: localStorage.getItem('user_gemini_api_key'),
  historyResumes: [],
  historyAnalyses: [],
  currentAnalysis: null,
  theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'dark',

  setAuth: (user, token) => {
    if (user && token) {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      set({ user, token });
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      set({ user: null, token: null });
    }
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null, token: null, historyResumes: [], historyAnalyses: [], currentAnalysis: null });
  },

  setUserApiKey: (key) => {
    if (key) {
      localStorage.setItem('user_gemini_api_key', key);
      set({ userApiKey: key });
    } else {
      localStorage.removeItem('user_gemini_api_key');
      set({ userApiKey: null });
    }
  },

  setHistory: (resumes, analyses) => set({ historyResumes: resumes, historyAnalyses: analyses }),
  setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),
  toggleTheme: () => set((state) => {
    const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', nextTheme);
    if (nextTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    return { theme: nextTheme };
  }),
}));
