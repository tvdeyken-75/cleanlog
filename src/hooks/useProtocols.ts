"use client";
import { useState, useEffect, useCallback } from 'react';
import type { Protocol, CleaningProtocol, FuelProtocol } from '@/lib/types';

type NewProtocol = Omit<CleaningProtocol, 'id' | 'driverId' | 'end_time' | 'type'> | Omit<FuelProtocol, 'id' | 'driverId' | 'end_time' | 'type'>;

export function useProtocols(userId: string | null) {
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [vehicles, setVehicles] = useState<{truck: string[], trailer: string[]}>({ truck: [], trailer: [] });
  const [isLoading, setIsLoading] = useState(true);

  const getProtocolsStorageKey = useCallback(() => `fahrerLogbuchProtocols_v3_${userId}`, [userId]);
  const getVehiclesStorageKey = () => `fahrerLogbuchVehicles_v1`;

  useEffect(() => {
    // Load vehicles (global for all users)
    try {
      const storedVehicles = localStorage.getItem(getVehiclesStorageKey());
      if (storedVehicles) {
        setVehicles(JSON.parse(storedVehicles));
      }
    } catch (error) {
      console.error("Could not access localStorage for vehicles", error);
    }

    // Load protocols (user-specific)
    if (userId) {
      setIsLoading(true);
      try {
        const storedProtocols = localStorage.getItem(getProtocolsStorageKey());
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
  }, [userId, getProtocolsStorageKey]);

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
        localStorage.setItem(getProtocolsStorageKey(), JSON.stringify(updatedProtocols));
      } catch (error) {
        console.error("Could not write protocols to localStorage", error);
      }
      return updatedProtocols;
    });
  };

  const addVehicle = (type: 'truck' | 'trailer', licensePlate: string) => {
    setVehicles(prevVehicles => {
        const newVehicles = { ...prevVehicles };
        if (!newVehicles[type].includes(licensePlate)) {
            newVehicles[type] = [...newVehicles[type], licensePlate];
            try {
                localStorage.setItem(getVehiclesStorageKey(), JSON.stringify(newVehicles));
            } catch (error) {
                console.error("Could not write vehicles to localStorage", error);
            }
        }
        return newVehicles;
    });
  };

  const getUniqueLicensePlates = (type: 'truck' | 'trailer'): string[] => {
    const key = type === 'truck' ? 'truck_license_plate' : 'trailer_license_plate';
    const protocolPlates = protocols.map(p => p[key]);
    const adminPlates = vehicles[type];
    return [...new Set([...protocolPlates, ...adminPlates])];
  };

  return { protocols, addProtocol, isLoading, getUniqueLicensePlates, addVehicle };
}
