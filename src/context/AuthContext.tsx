"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (user: string) => void;
  logout: () => void;
  user: string | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('fahrerLogbuchUser');
      if (storedUser) {
        setUser(storedUser);
      }
    } catch (error) {
      console.error("Could not access localStorage", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (username: string) => {
    try {
      localStorage.setItem('fahrerLogbuchUser', username);
      setUser(username);
    } catch (error) {
      console.error("Could not write to localStorage", error);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('fahrerLogbuchUser');
      setUser(null);
    } catch (error) {
      console.error("Could not remove from localStorage", error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, login, logout, user, isLoading }}>
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
