

"use client";
import { useState, useEffect, useCallback } from 'react';
import type { Protocol, CleaningProtocol, FuelProtocol, PauseProtocol, LoadingProtocol, DeliveryProtocol, EmergencyProtocol, MaintenanceProtocol, ExpenseProtocol, Vehicle, Tour, Customer } from '@/lib/types';

type NewProtocolPayload = 
    Omit<CleaningProtocol, 'id' | 'driverId' | 'end_time' | 'type'> | 
    Omit<FuelProtocol, 'id' | 'driverId' | 'end_time' | 'type'> | 
    Omit<PauseProtocol, 'id' | 'driverId' | 'end_time' | 'type'> | 
    Omit<LoadingProtocol, 'id' | 'driverId' | 'end_time' | 'type' | 'loading_protocol_number'> | 
    Omit<DeliveryProtocol, 'id' | 'driverId' | 'end_time' | 'type'> | 
    Omit<EmergencyProtocol, 'id' | 'driverId' | 'end_time' | 'type'> |
    Omit<MaintenanceProtocol, 'id' | 'driverId' | 'end_time' | 'type'> |
    Omit<ExpenseProtocol, 'id' | 'driverId' | 'end_time' | 'type'>;
    
type ProtocolType = Protocol['type'];

export function useProtocols(userId: string | null) {
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [vehicles, setVehicles] = useState<{truck: Vehicle[], trailer: Vehicle[]}>({ truck: [], trailer: [] });
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getProtocolsStorageKey = useCallback(() => `fahrerchecklisteProtocols_v4_${userId}`, [userId]);
  const getVehiclesStorageKey = () => `fahrerchecklisteVehicles_v2`;
  const getToursStorageKey = () => `fahrerchecklisteTours_v1`;
  const getCustomersStorageKey = () => `fahrerchecklisteCustomers_v1`;

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
    
    // Load tours (global for all users)
    try {
        const storedTours = localStorage.getItem(getToursStorageKey());
        if (storedTours) {
            setTours(JSON.parse(storedTours));
        }
    } catch (error) {
        console.error("Could not access localStorage for tours", error);
    }
    
    // Load customers (global for all users)
    try {
        const storedCustomers = localStorage.getItem(getCustomersStorageKey());
        if (storedCustomers) {
            setCustomers(JSON.parse(storedCustomers));
        }
    } catch (error) {
        console.error("Could not access localStorage for customers", error);
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

  const saveVehicles = (newVehiclesState: {truck: Vehicle[], trailer: Vehicle[]}) => {
    setVehicles(newVehiclesState);
    try {
        localStorage.setItem(getVehiclesStorageKey(), JSON.stringify(newVehiclesState));
    } catch (error) {
        console.error("Could not write vehicles to localStorage", error);
    }
  }

  const saveTours = (newTours: Tour[]) => {
      setTours(newTours);
      try {
          localStorage.setItem(getToursStorageKey(), JSON.stringify(newTours));
      } catch(error) {
          console.error("Could not write tours to localStorage", error);
      }
  }
  
  const saveCustomers = (newCustomers: Customer[]) => {
    setCustomers(newCustomers);
    try {
        localStorage.setItem(getCustomersStorageKey(), JSON.stringify(newCustomers));
    } catch(error) {
        console.error("Could not write customers to localStorage", error);
    }
  }

  const addProtocol = (newProtocol: NewProtocolPayload, type: ProtocolType) => {
    if (!userId) return;
    
    let protocolWithMetadata: Protocol;
    const baseMetadata = {
        id: new Date().toISOString() + Math.random(),
        driverId: userId,
        start_time: (newProtocol as any).start_time || new Date().toISOString(),
        end_time: new Date().toISOString(),
    };

    if (type === 'loading') {
        const loadingPayload = newProtocol as Omit<LoadingProtocol, 'id' | 'driverId' | 'end_time' | 'type' | 'loading_protocol_number'>;
        const loadingProtocolsCount = protocols.filter(p => p.type === 'loading' && p.transport_order === loadingPayload.transport_order).length;
        const nextId = (loadingProtocolsCount + 1).toString().padStart(2, '0');
        const loadingProtocolNumber = `${loadingPayload.transport_order}-${nextId}`;

        protocolWithMetadata = {
            ...loadingPayload,
            ...baseMetadata,
            type: 'loading',
            loading_protocol_number: loadingProtocolNumber
        } as LoadingProtocol;
    } else {
        protocolWithMetadata = {
          ...newProtocol,
          ...baseMetadata,
          type: type,
        } as Protocol;
    }


    setProtocols(prevProtocols => {
      const updatedProtocols = [...prevProtocols, protocolWithMetadata];
      try {
        localStorage.setItem(getProtocolsStorageKey(), JSON.stringify(updatedProtocols));
      } catch (error) {
        console.error("Could not write protocols to localStorage", error);
      }
      return updatedProtocols;
    });
  };
  
  const addTour = (newTour: Tour) => {
      const updatedTours = [...tours, newTour];
      saveTours(updatedTours);
  }

  const addVehicle = (type: 'truck' | 'trailer', newVehicle: Omit<Vehicle, 'active'>): boolean => {
    const currentVehicles = vehicles[type];
    if (currentVehicles.some(v => v.license_plate === newVehicle.license_plate)) {
        return false; // Already exists
    }
    const vehicleWithStatus: Vehicle = { ...newVehicle, active: true };
    const newVehiclesState = { 
        ...vehicles, 
        [type]: [...currentVehicles, vehicleWithStatus]
    };
    saveVehicles(newVehiclesState);
    return true;
  };
  
  const addCustomer = (newCustomer: Customer): boolean => {
    if (customers.some(c => c.name === newCustomer.name)) {
        return false; // Already exists
    }
    const updatedCustomers = [...customers, newCustomer];
    saveCustomers(updatedCustomers);
    return true;
  }

  const updateVehicle = (type: 'truck' | 'trailer', originalLicensePlate: string, updatedVehicleData: Omit<Vehicle, 'active'>) => {
     const newVehiclesState = { ...vehicles };
     const index = newVehiclesState[type].findIndex(v => v.license_plate === originalLicensePlate);
     
     if (index !== -1) {
         // Preserve the active status
         const currentActiveStatus = newVehiclesState[type][index].active;
         newVehiclesState[type][index] = { ...updatedVehicleData, active: currentActiveStatus };
         saveVehicles(newVehiclesState);
     }
  };
  
  const updateVehicleStatus = (type: 'truck' | 'trailer', licensePlate: string, active: boolean) => {
    const newVehiclesState = { ...vehicles };
    const index = newVehiclesState[type].findIndex(v => v.license_plate === licensePlate);

    if (index !== -1) {
        newVehiclesState[type][index].active = active;
        saveVehicles(newVehiclesState);
    }
  };


  const getUniqueLicensePlates = (type: 'truck' | 'trailer', onlyActive: boolean = false): string[] => {
    const key = type === 'truck' ? 'truck_license_plate' : 'trailer_license_plate';
    const protocolPlates = protocols.map(p => p[key]).filter((p): p is string => !!p);
    
    let adminPlates = vehicles[type];
    if (onlyActive) {
      adminPlates = adminPlates.filter(v => v.active);
    }
    
    const adminPlateStrings = adminPlates.map(v => v.license_plate);
    return [...new Set([...protocolPlates, ...adminPlateStrings])];
  };

  return { protocols, addProtocol, isLoading, getUniqueLicensePlates, addVehicle, vehicles, updateVehicle, updateVehicleStatus, tours, addTour, customers, addCustomer };
}

    