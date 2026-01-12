import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Vehicle, Inspection, StatusHistoryEntry, mockVehicles, mockInspections } from '@/data/mockData';

export type VehicleUpdateData = Partial<Omit<Vehicle, 'id' | 'createdAt'>>;

interface VehiclesContextType {
  vehicles: Vehicle[];
  inspections: Inspection[];
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'createdAt'>) => Vehicle;
  addInspection: (inspection: Omit<Inspection, 'id'>) => Inspection;
  updateVehicle: (vehicleId: string, data: VehicleUpdateData) => void;
  updateInspectionStatus: (
    inspectionId: string, 
    newStatus: Inspection['status'],
    userId: string,
    userName: string,
    notes?: string
  ) => void;
  getEmployeeStats: (employeeId: string) => {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
  };
  getEmployeeStatsForCurrentMonth: (employeeId: string) => {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    approvalRate: number;
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

  const updateVehicle = (vehicleId: string, data: VehicleUpdateData) => {
    setVehicles(prev => 
      prev.map(vehicle => 
        vehicle.id === vehicleId ? { ...vehicle, ...data } : vehicle
      )
    );
    
    // Also update vehicle info in related inspections
    setInspections(prev =>
      prev.map(inspection => {
        if (inspection.vehicleId !== vehicleId) return inspection;
        return {
          ...inspection,
          vehicle: { ...inspection.vehicle, ...data },
        };
      })
    );
  };

  const updateInspectionStatus = (
    inspectionId: string, 
    newStatus: Inspection['status'],
    userId: string,
    userName: string,
    notes?: string
  ) => {
    setInspections(prev => 
      prev.map(inspection => {
        if (inspection.id !== inspectionId) return inspection;

        const historyEntry: StatusHistoryEntry = {
          id: String(Date.now()),
          previousStatus: inspection.status,
          newStatus,
          changedBy: userName,
          changedById: userId,
          changedAt: new Date().toISOString(),
          notes
        };

        return {
          ...inspection,
          status: newStatus,
          statusHistory: [...(inspection.statusHistory || []), historyEntry]
        };
      })
    );
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

  const getEmployeeStatsForCurrentMonth = (employeeId: string) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const employeeInspections = inspections.filter(i => {
      if (i.employeeId !== employeeId) return false;
      const inspectionDate = new Date(i.date);
      return inspectionDate.getMonth() === currentMonth && 
             inspectionDate.getFullYear() === currentYear;
    });

    const total = employeeInspections.length;
    const approved = employeeInspections.filter(i => i.status === 'approved').length;
    const pending = employeeInspections.filter(i => i.status === 'pending' || i.status === 'in_progress').length;
    const rejected = employeeInspections.filter(i => i.status === 'rejected').length;
    const approvalRate = total > 0 ? (approved / total) * 100 : 0;

    return { total, approved, pending, rejected, approvalRate };
  };

  return (
    <VehiclesContext.Provider value={{ vehicles, inspections, addVehicle, addInspection, updateVehicle, updateInspectionStatus, getEmployeeStats, getEmployeeStatsForCurrentMonth }}>
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
