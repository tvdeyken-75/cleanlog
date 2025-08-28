
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Tour } from '@/lib/types';
import { useAuth } from './AuthContext';

interface TourContextType {
  activeTour: Tour | null;
  isMaintenanceMode: boolean; // This will now be derived, not a separate state
  startTour: (tour: Tour) => void;
  endTour: () => void;
  isLoading: boolean;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export function TourProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [activeTour, setActiveTour] = useState<Tour | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // We can derive maintenance mode from the activeTour object
  const isMaintenanceMode = activeTour ? !activeTour.transport_order : false;

  const getStorageKey = useCallback((base: string) => {
    if (!user) return null;
    // Simplified to one key for tour/maintenance session per user
    return `fahrerLogbuchActiveSession_${user}`;
  }, [user]);

  useEffect(() => {
    setIsLoading(true);
    if (user) {
      try {
        const sessionKey = getStorageKey('');
        const storedSession = sessionKey ? localStorage.getItem(sessionKey) : null;

        if (storedSession) {
          setActiveTour(JSON.parse(storedSession));
        } else {
          setActiveTour(null);
        }
      } catch (error) {
        console.error("Could not access localStorage for session", error);
        setActiveTour(null);
      } finally {
        setIsLoading(false);
      }
    } else {
      setActiveTour(null);
      setIsLoading(false);
    }
  }, [user, getStorageKey]);

  const startTour = (tour: Tour) => {
    const sessionKey = getStorageKey('');
    if (!sessionKey) return;
    try {
      localStorage.setItem(sessionKey, JSON.stringify(tour));
      setActiveTour(tour);
    } catch (error) {
      console.error("Could not write tour to localStorage", error);
    }
  };

  const endTour = () => {
    const sessionKey = getStorageKey('');
    try {
      if(sessionKey) localStorage.removeItem(sessionKey);
      setActiveTour(null);
    } catch (error) {
      console.error("Could not remove session from localStorage", error);
    }
  };

  return (
    <TourContext.Provider value={{ activeTour, isMaintenanceMode, startTour, endTour, isLoading }}>
      {children}
    </TourContext.Provider>
  );
}

export function useTour() {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
}
