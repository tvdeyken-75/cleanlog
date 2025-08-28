
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Tour } from '@/lib/types';
import { useAuth } from './AuthContext';

interface TourContextType {
  activeTour: Tour | null;
  isMaintenanceMode: boolean;
  startTour: (tour: Tour) => void;
  startMaintenanceMode: (vehicles: Omit<Tour, 'transport_order'>) => void;
  endTour: () => void;
  isLoading: boolean;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export function TourProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [activeTour, setActiveTour] = useState<Tour | null>(null);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const getStorageKey = useCallback((base: string) => {
    if (!user) return null;
    return `fahrerLogbuch${base}_${user}`;
  }, [user]);

  useEffect(() => {
    setIsLoading(true);
    if (user) {
      try {
        const tourKey = getStorageKey('ActiveTour');
        const maintenanceKey = getStorageKey('MaintenanceMode');
        
        const storedTour = tourKey ? localStorage.getItem(tourKey) : null;
        const storedMaintenance = maintenanceKey ? localStorage.getItem(maintenanceKey) : null;

        if (storedTour) {
          setActiveTour(JSON.parse(storedTour));
          setIsMaintenanceMode(false);
        } else if (storedMaintenance) {
          setActiveTour(JSON.parse(storedMaintenance));
          setIsMaintenanceMode(true);
        } else {
          setActiveTour(null);
          setIsMaintenanceMode(false);
        }
      } catch (error) {
        console.error("Could not access localStorage for tour/maintenance", error);
        setActiveTour(null);
        setIsMaintenanceMode(false);
      } finally {
        setIsLoading(false);
      }
    } else {
      setActiveTour(null);
      setIsMaintenanceMode(false);
      setIsLoading(false);
    }
  }, [user, getStorageKey]);

  const startTour = (tour: Tour) => {
    const tourKey = getStorageKey('ActiveTour');
    if (!tourKey) return;
    try {
      endTour(); // Clear any existing tour/maintenance
      localStorage.setItem(tourKey, JSON.stringify(tour));
      setActiveTour(tour);
      setIsMaintenanceMode(false);
    } catch (error) {
      console.error("Could not write tour to localStorage", error);
    }
  };
  
  const startMaintenanceMode = (vehicles: Omit<Tour, 'transport_order'>) => {
    const maintenanceKey = getStorageKey('MaintenanceMode');
    if (!maintenanceKey) return;
    try {
        endTour(); // Clear any existing tour/maintenance
        const maintenanceTour = { ...vehicles, transport_order: '' };
        localStorage.setItem(maintenanceKey, JSON.stringify(maintenanceTour));
        setActiveTour(maintenanceTour);
        setIsMaintenanceMode(true);
    } catch (error) {
        console.error("Could not write maintenance mode to localStorage", error);
    }
  };


  const endTour = () => {
    const tourKey = getStorageKey('ActiveTour');
    const maintenanceKey = getStorageKey('MaintenanceMode');
    try {
      if(tourKey) localStorage.removeItem(tourKey);
      if(maintenanceKey) localStorage.removeItem(maintenanceKey);
      setActiveTour(null);
      setIsMaintenanceMode(false);
    } catch (error) {
      console.error("Could not remove tour/maintenance from localStorage", error);
    }
  };

  return (
    <TourContext.Provider value={{ activeTour, isMaintenanceMode, startTour, startMaintenanceMode, endTour, isLoading }}>
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
