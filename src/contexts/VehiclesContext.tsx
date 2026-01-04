import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Vehicle, Inspection, mockVehicles, mockInspections } from '@/data/mockData';

interface VehiclesContextType {
  vehicles: Vehicle[];
  inspections: Inspection[];
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'createdAt'>) => Vehicle;
  addInspection: (inspection: Omit<Inspection, 'id'>) => Inspection;
  getEmployeeStats: (employeeId: string) => {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
  };
}

const VehiclesContext = createContext<VehiclesContextType | undefined>(undefined);

export function VehiclesProvider({ children }: { children: ReactNode }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);
  const [inspections, setInspections] = useState<Inspection[]>(mockInspections);

  const addVehicle = (vehicleData: Omit<Vehicle, 'id' | 'createdAt'>): Vehicle => {
    const newVehicle: Vehicle = {
      ...vehicleData,
      id: String(vehicles.length + 1),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setVehicles(prev => [...prev, newVehicle]);
    return newVehicle;
  };

  const addInspection = (inspectionData: Omit<Inspection, 'id'>): Inspection => {
    const newInspection: Inspection = {
      ...inspectionData,
      id: String(inspections.length + 1),
    };
    setInspections(prev => [...prev, newInspection]);
    return newInspection;
  };

  const getEmployeeStats = (employeeId: string) => {
    const employeeInspections = inspections.filter(i => i.employeeId === employeeId);
    return {
      total: employeeInspections.length,
      approved: employeeInspections.filter(i => i.status === 'approved').length,
      pending: employeeInspections.filter(i => i.status === 'pending' || i.status === 'in_progress').length,
      rejected: employeeInspections.filter(i => i.status === 'rejected').length,
    };
  };

  return (
    <VehiclesContext.Provider value={{ vehicles, inspections, addVehicle, addInspection, getEmployeeStats }}>
      {children}
    </VehiclesContext.Provider>
  );
}

export function useVehicles() {
  const context = useContext(VehiclesContext);
  if (context === undefined) {
    throw new Error('useVehicles must be used within a VehiclesProvider');
  }
  return context;
}
