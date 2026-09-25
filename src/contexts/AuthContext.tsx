import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setToken, removeToken } from '../services/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface UserProfile {
  persona_type?: string;
  education_level?: string;
  field_of_study?: string;
  current_status?: string;
  occupation?: string;
  target_goal?: string;
  experience_level?: string;
  technical_skills?: string[];
  soft_skills?: string[];
  practical_skills?: string[];
  interests?: string[];
  work_preference?: string;
  daily_learning_hours?: number;
  budget_constraint?: string;
  has_smartphone?: number;
  has_computer?: number;
  preferred_language?: string;
  location?: string;
  bio?: string;
  completion_pct?: number;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  activeGoal: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string, personaType?: string) => Promise<void>;
  logout: () => void;
  switchDemoPersona: (persona: 'arun' | 'muthu' | 'priya' | 'sneha' | 'kavita' | 'deepak' | 'admin') => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeGoal, setActiveGoal] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const data = await api.getCurrentUser();
      setUser(data.user);
      setProfile(data.profile);
      setActiveGoal(data.activeGoal);
    } catch (err) {
      console.warn('Failed to fetch user session:', err);
      setUser(null);
      setProfile(null);
      setActiveGoal(null);
      removeToken();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('cs_token');
    if (token) {
      refreshUser();
    } else {
      // Default auto-login to Arun (College Student) for immediate demo readiness!
      switchDemoPersona('arun').finally(() => setIsLoading(false));
    }
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password: pass });
      setToken(res.token);
      await refreshUser();
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, pass: string, personaType?: string) => {
    setIsLoading(true);
    try {
      const res = await api.register({ name, email, password: pass, personaType });
      setToken(res.token);
      await refreshUser();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    removeToken();
    setUser(null);
    setProfile(null);
    setActiveGoal(null);
  };

  const switchDemoPersona = async (persona: 'arun' | 'muthu' | 'priya' | 'sneha' | 'kavita' | 'deepak' | 'admin') => {
    setIsLoading(true);
    try {
      const res = await api.demoLogin(persona);
      setToken(res.token);
      await refreshUser();
    } catch (err) {
      console.error('Demo persona switch failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        activeGoal,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        switchDemoPersona,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
