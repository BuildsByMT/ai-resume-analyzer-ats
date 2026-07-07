import { create } from 'zustand';

interface User {
  id: string;
  email: string;
}

export interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
  visible: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  userApiKey: string | null;
  historyResumes: any[];
  historyAnalyses: any[];
  currentAnalysis: any | null;
  theme: 'light' | 'dark';
  toast: ToastState | null;
  isAnalyzing: boolean;
  analysisError: string | null;
  setAuth: (user: User | null, token: string | null) => void;
  logout: () => void;
  setUserApiKey: (key: string | null) => void;
  setHistory: (resumes: any[], analyses: any[]) => void;
  setCurrentAnalysis: (analysis: any | null) => void;
  toggleTheme: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
  fetchHistory: () => Promise<void>;
  triggerAnalysis: (pdfBase64: string, jobTitle: string, jobDescription: string) => Promise<void>;
}

export const useStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  userApiKey: localStorage.getItem('user_gemini_api_key'),
  historyResumes: [],
  historyAnalyses: [],
  currentAnalysis: null,
  theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'dark',
  toast: null,
  isAnalyzing: false,
  analysisError: null,

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
    set({ user: null, token: null, historyResumes: [], historyAnalyses: [], currentAnalysis: null, isAnalyzing: false, analysisError: null });
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
  showToast: (message, type = 'success') => {
    set({ toast: { message, type, visible: true } });
  },
  hideToast: () => set((state) => {
    if (state.toast) {
      return { toast: { ...state.toast, visible: false } };
    }
    return {};
  }),

  fetchHistory: async () => {
    const { token } = useStore.getState();
    if (!token) return;
    try {
      const response = await fetch('/api/resumes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        set({ historyResumes: data.resumes || [], historyAnalyses: data.analyses || [] });
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  },

  triggerAnalysis: async (pdfBase64: string, jobTitle: string, jobDescription: string) => {
    const { token, userApiKey } = useStore.getState();
    set({ isAnalyzing: true, analysisError: null });

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          pdfBase64,
          jobTitle,
          jobDescription,
          userApiKey
        })
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Serverless API error output:", text);
        throw new Error("API call timed out or failed. Please check your Vercel logs and ensure your DATABASE_URL does not point to the restricted /sys database.");
      }

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.error || resData.message || 'Analysis failed. Please check your Gemini API key and try again.');
      }

      set({ currentAnalysis: resData.data, isAnalyzing: false });
      
      // Update history in the background
      await useStore.getState().fetchHistory();

      useStore.getState().showToast('AI Resume analyzed successfully!', 'success');

      // Only redirect if user is still on Dashboard
      const currentPath = window.location.pathname;
      if (currentPath === '/dashboard' || currentPath === '/' || !currentPath) {
        window.history.pushState(null, '', '/analysis');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    } catch (error: any) {
      console.error("Background analysis failed:", error);
      set({ isAnalyzing: false, analysisError: error.message || 'Analysis failed.' });
      useStore.getState().showToast(error.message || 'Analysis failed.', 'error');
    }
  },
}));
