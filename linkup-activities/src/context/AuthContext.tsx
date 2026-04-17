import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchMe } from '@/lib/api';
import supabase from '@/lib/supabase';

interface AuthUser {
  id: string;
  name?: string;
  email?: string;
  avatar?: string;
  bio?: string;
  interests?: string[];
  activities_hosted?: number;
  activities_joined?: number;
  streak?: number;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, refreshToken: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(!!localStorage.getItem('token'));

  // On mount: if a token exists in localStorage, fetch the user profile
  useEffect(() => {
    if (!token) { setIsLoading(false); return; }
    fetchMe()
      .then((data) => setUser(data))
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        setToken(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Listen only for sign-out events (e.g. session expired on Supabase side)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        setToken(null);
        setUser(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const login = async (accessToken: string, refreshToken: string) => {
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    setToken(accessToken);
    const data = await fetchMe();
    setUser(data);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
