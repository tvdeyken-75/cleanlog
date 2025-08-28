"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

type UserRole = 'driver' | 'admin';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (user: string, role: UserRole) => void;
  logout: () => void;
  user: string | null;
  userRole: UserRole | null;
  isLoading: boolean;
  getAdminPassword: () => string;
  changeAdminPassword: (newPass: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('fahrerLogbuchUser');
      const storedRole = localStorage.getItem('fahrerLogbuchUserRole') as UserRole;
      if (storedUser && storedRole) {
        setUser(storedUser);
        setUserRole(storedRole);
      }
    } catch (error) {
      console.error("Could not access localStorage", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (username: string, role: UserRole) => {
    try {
      localStorage.setItem('fahrerLogbuchUser', username);
      localStorage.setItem('fahrerLogbuchUserRole', role);
      setUser(username);
      setUserRole(role);
    } catch (error) {
      console.error("Could not write to localStorage", error);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('fahrerLogbuchUser');
      localStorage.removeItem('fahrerLogbuchUserRole');
      setUser(null);
      setUserRole(null);
    } catch (error) {
      console.error("Could not remove from localStorage", error);
    }
  };

  const getAdminPassword = useCallback(() => {
    try {
        return localStorage.getItem('fahrerLogbuchAdminPassword') || 'admin123';
    } catch (error) {
        console.error("Could not access localStorage", error);
        return 'admin123';
    }
  }, []);

  const changeAdminPassword = (newPass: string) => {
    try {
        localStorage.setItem('fahrerLogbuchAdminPassword', newPass);
    } catch (error) {
        console.error("Could not write to localStorage", error);
    }
  };


  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, login, logout, user, userRole, isLoading, getAdminPassword, changeAdminPassword }}>
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
