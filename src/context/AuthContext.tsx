


"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { User, UserRole } from '@/lib/types';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  user: string | null;
  userRoles: UserRole[] | null;
  isLoading: boolean;
  addUser: (newUser: User) => boolean;
  getUsers: () => User[];
  updateUser: (username: string, updatedData: Partial<User>) => void;
  deleteUser: (username: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const defaultAdmin: User = { username: 'admin', password: 'admin123', role: ['admin'] };
const defaultDriver: User = { username: 'demo', password: 'demo123', role: ['driver'] };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<string | null>(null);
  const [userRoles, setUserRoles] = useState<UserRole[] | null>(null);
  const [users, setUsers] = useState<User[]>([defaultAdmin, defaultDriver]);
  const [isLoading, setIsLoading] = useState(true);
  
  const getUsersStorageKey = () => 'fahrerchecklisteUsers_v1';
  const getSessionUserKey = () => 'fahrerchecklisteSessionUser_v1';
  const getSessionRoleKey = () => 'fahrerchecklisteSessionRole_v1';

  useEffect(() => {
    try {
      // Load users
      const storedUsers = localStorage.getItem(getUsersStorageKey());
      if (storedUsers) {
        const parsedUsers = JSON.parse(storedUsers);
        // Ensure admin always exists
        if (!parsedUsers.find((u: User) => u.username === 'admin')) {
          setUsers([defaultAdmin, ...parsedUsers.filter((u:User) => u.username !== 'admin')]);
        } else {
          setUsers(parsedUsers.map((u:User) => ({...u, role: Array.isArray(u.role) ? u.role : [u.role]})));
        }
      } else {
        setUsers([defaultAdmin, defaultDriver]);
        localStorage.setItem(getUsersStorageKey(), JSON.stringify([defaultAdmin, defaultDriver]));
      }

      // Load active session
      const storedUser = localStorage.getItem(getSessionUserKey());
      const storedRolesJSON = localStorage.getItem(getSessionRoleKey());
      if (storedUser && storedRolesJSON) {
        setUser(storedUser);
        const storedRoles = JSON.parse(storedRolesJSON);
        setUserRoles(Array.isArray(storedRoles) ? storedRoles : [storedRoles]);
      }
    } catch (error) {
      console.error("Could not access localStorage", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveUsers = (updatedUsers: User[]) => {
    setUsers(updatedUsers);
    try {
      localStorage.setItem(getUsersStorageKey(), JSON.stringify(updatedUsers));
    } catch (error) {
      console.error("Could not write users to localStorage", error);
    }
  }

  const login = (username: string, password: string): boolean => {
    const foundUser = users.find(u => u.username === username && u.password === password);
    if (foundUser) {
      try {
        localStorage.setItem(getSessionUserKey(), foundUser.username);
        localStorage.setItem(getSessionRoleKey(), JSON.stringify(foundUser.role));
        setUser(foundUser.username);
        setUserRoles(foundUser.role);
        return true;
      } catch (error) {
        console.error("Could not write to localStorage", error);
        return false;
      }
    }
    return false;
  };

  const logout = () => {
    try {
      localStorage.removeItem(getSessionUserKey());
      localStorage.removeItem(getSessionRoleKey());
      setUser(null);
      setUserRoles(null);
    } catch (error) {
      console.error("Could not remove from localStorage", error);
    }
  };

  const addUser = (newUser: User): boolean => {
    if (users.some(u => u.username === newUser.username)) {
      return false; // User already exists
    }
    const updatedUsers = [...users, newUser];
    saveUsers(updatedUsers);
    return true;
  }

  const getUsers = (): User[] => {
    return users;
  }

  const updateUser = (username: string, updatedData: Partial<User>) => {
    const updatedUsers = users.map(u => {
      if (u.username === username) {
        const updatedUser = { ...u, ...updatedData };
        // If the password is not provided in updatedData, keep the old one
        if (!updatedData.password) {
            updatedUser.password = u.password;
        }
        return updatedUser;
      }
      return u;
    });
    saveUsers(updatedUsers);
  };

  const deleteUser = (username: string) => {
    // Prevent deleting the main admin
    if (username === 'admin') return;

    const updatedUsers = users.filter(u => u.username !== username);
    saveUsers(updatedUsers);

    // If the deleted user is the currently logged-in user, log them out
    if (user === username) {
        logout();
    }
  };


  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, login, logout, user, userRoles, isLoading, addUser, getUsers, updateUser, deleteUser }}>
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
