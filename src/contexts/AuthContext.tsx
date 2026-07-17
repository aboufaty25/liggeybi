import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'CANDIDAT' | 'RECRUTEUR' | 'ADMIN';
  image?: string;
  profile?: any;
  credits?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const safeGetItem = (key: string) => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  };
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(safeGetItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  const fetchMe = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        try { localStorage.removeItem('token'); } catch (e) {}
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.error("Auth error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, [token]);

  const login = (newToken: string, newUser: User) => {
    try { localStorage.setItem('token', newToken); } catch(e) {}
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    try { localStorage.removeItem('token'); } catch(e) {}
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading, refreshUser: fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
