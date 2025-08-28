"use client";
import { useState, useEffect, useCallback } from 'react';
import type { Protocol, CleaningProtocol, FuelProtocol } from '@/lib/types';

type NewProtocol = Omit<CleaningProtocol, 'id' | 'driverId' | 'end_time' | 'type'> | Omit<FuelProtocol, 'id' | 'driverId' | 'end_time' | 'type'>;

export function useProtocols(userId: string | null) {
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getStorageKey = useCallback(() => `fahrerLogbuchProtocols_v2_${userId}`, [userId]);

  useEffect(() => {
    if (userId) {
      setIsLoading(true);
      try {
        const storedProtocols = localStorage.getItem(getStorageKey());
        if (storedProtocols) {
          setProtocols(JSON.parse(storedProtocols));
        } else {
          setProtocols([]);
        }
      } catch (error) {
        console.error("Could not access localStorage or parse protocols", error);
        setProtocols([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      setProtocols([]);
      setIsLoading(false);
    }
  }, [userId, getStorageKey]);

  const addProtocol = (newProtocol: NewProtocol, type: 'cleaning' | 'fuel') => {
    if (!userId) return;
    
    const protocolWithMetadata: Protocol = {
      ...newProtocol,
      id: new Date().toISOString() + Math.random(),
      driverId: userId,
      end_time: new Date().toISOString(),
      type: type,
    } as Protocol;

    setProtocols(prevProtocols => {
      const updatedProtocols = [protocolWithMetadata, ...prevProtocols];
      try {
        localStorage.setItem(getStorageKey(), JSON.stringify(updatedProtocols));
      } catch (error) {
        console.error("Could not write protocols to localStorage", error);
      }
      return updatedProtocols;
    });
  };

  const getUniqueLicensePlates = (type: 'truck' | 'trailer'): string[] => {
    const key = type === 'truck' ? 'truck_license_plate' : 'trailer_license_plate';
    const allPlates = protocols.map(p => p[key]);
    const truckPlates = protocols
        .filter(p => p.type === 'cleaning' || p.type === 'fuel')
        .map(p => p.truck_license_plate);
    const trailerPlates = protocols
        .filter(p => p.type === 'cleaning' || p.type === 'fuel')
        .map(p => p.trailer_license_plate);
    
    const plates = type === 'truck' ? truckPlates : trailerPlates;
    return [...new Set(plates)];
  };

  return { protocols, addProtocol, isLoading, getUniqueLicensePlates };
}
