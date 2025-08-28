"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Tour } from '@/lib/types';
import { useAuth } from './AuthContext';

interface TourContextType {
  activeTour: Tour | null;
  startTour: (tour: Tour) => void;
  endTour: () => void;
  isLoading: boolean;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export function TourProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [activeTour, setActiveTour] = useState<Tour | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getStorageKey = useCallback(() => `fahrerLogbuchActiveTour_${user}`, [user]);

  useEffect(() => {
    setIsLoading(true);
    if (user) {
      try {
        const storedTour = localStorage.getItem(getStorageKey());
        if (storedTour) {
          setActiveTour(JSON.parse(storedTour));
        } else {
          setActiveTour(null);
        }
      } catch (error) {
        console.error("Could not access localStorage for tour", error);
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
    if (!user) return;
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(tour));
      setActiveTour(tour);
    } catch (error) {
      console.error("Could not write tour to localStorage", error);
    }
  };

  const endTour = () => {
    if (!user) return;
    try {
      localStorage.removeItem(getStorageKey());
      setActiveTour(null);
    } catch (error) {
      console.error("Could not remove tour from localStorage", error);
    }
  };

  return (
    <TourContext.Provider value={{ activeTour, startTour, endTour, isLoading }}>
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
