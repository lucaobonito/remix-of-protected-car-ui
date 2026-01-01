export interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  ownerId: string;
  ownerName: string;
  status: 'protected' | 'pending' | 'expired';
  createdAt: string;
}

export interface Inspection {
  id: string;
  vehicleId: string;
  vehicle: Vehicle;
  employeeId: string;
  employeeName: string;
  status: 'pending' | 'in_progress' | 'approved' | 'rejected';
  date: string;
  photos: string[];
  checklist: {
    exterior: boolean;
    interior: boolean;
    engine: boolean;
    tires: boolean;
    documents: boolean;
    lights: boolean;
  };
  notes?: string;
}

export interface MonthlyStats {
  month: string;
  vehicles: number;
  inspections: number;
  revenue: number;
  profit: number;
}

export const mockVehicles: Vehicle[] = [
  { id: '1', plate: 'ABC-1234', brand: 'Toyota', model: 'Corolla', year: 2022, color: 'Prata', ownerId: '3', ownerName: 'João Oliveira', status: 'protected', createdAt: '2024-01-15' },
  { id: '2', plate: 'DEF-5678', brand: 'Honda', model: 'Civic', year: 2021, color: 'Preto', ownerId: '4', ownerName: 'Maria Costa', status: 'protected', createdAt: '2024-02-20' },
  { id: '3', plate: 'GHI-9012', brand: 'Volkswagen', model: 'Golf', year: 2023, color: 'Branco', ownerId: '5', ownerName: 'Pedro Lima', status: 'pending', createdAt: '2024-03-10' },
  { id: '4', plate: 'JKL-3456', brand: 'Ford', model: 'Ka', year: 2020, color: 'Vermelho', ownerId: '6', ownerName: 'Ana Souza', status: 'protected', createdAt: '2024-01-25' },
  { id: '5', plate: 'MNO-7890', brand: 'Chevrolet', model: 'Onix', year: 2022, color: 'Azul', ownerId: '7', ownerName: 'Carlos Mendes', status: 'expired', createdAt: '2023-11-05' },
  { id: '6', plate: 'PQR-1234', brand: 'Hyundai', model: 'HB20', year: 2021, color: 'Cinza', ownerId: '8', ownerName: 'Fernanda Reis', status: 'protected', createdAt: '2024-04-01' },
  { id: '7', plate: 'STU-5678', brand: 'Fiat', model: 'Argo', year: 2023, color: 'Branco', ownerId: '9', ownerName: 'Roberto Alves', status: 'protected', createdAt: '2024-03-22' },
  { id: '8', plate: 'VWX-9012', brand: 'Renault', model: 'Kwid', year: 2022, color: 'Laranja', ownerId: '10', ownerName: 'Juliana Ferreira', status: 'pending', createdAt: '2024-05-15' },
];

export const mockInspections: Inspection[] = [
  {
    id: '1',
    vehicleId: '1',
    vehicle: mockVehicles[0],
    employeeId: '2',
    employeeName: 'Ana Santos',
    status: 'approved',
    date: '2024-01-16',
    photos: [],
    checklist: { exterior: true, interior: true, engine: true, tires: true, documents: true, lights: true },
    notes: 'Veículo em excelente estado',
  },
  {
    id: '2',
    vehicleId: '2',
    vehicle: mockVehicles[1],
    employeeId: '2',
    employeeName: 'Ana Santos',
    status: 'approved',
    date: '2024-02-21',
    photos: [],
    checklist: { exterior: true, interior: true, engine: true, tires: true, documents: true, lights: true },
  },
  {
    id: '3',
    vehicleId: '3',
    vehicle: mockVehicles[2],
    employeeId: '11',
    employeeName: 'Lucas Pereira',
    status: 'pending',
    date: '2024-03-11',
    photos: [],
    checklist: { exterior: false, interior: false, engine: false, tires: false, documents: false, lights: false },
  },
  {
    id: '4',
    vehicleId: '4',
    vehicle: mockVehicles[3],
    employeeId: '2',
    employeeName: 'Ana Santos',
    status: 'approved',
    date: '2024-01-26',
    photos: [],
    checklist: { exterior: true, interior: true, engine: true, tires: true, documents: true, lights: true },
  },
  {
    id: '5',
    vehicleId: '6',
    vehicle: mockVehicles[5],
    employeeId: '11',
    employeeName: 'Lucas Pereira',
    status: 'in_progress',
    date: '2024-04-02',
    photos: [],
    checklist: { exterior: true, interior: true, engine: false, tires: false, documents: true, lights: false },
  },
  {
    id: '6',
    vehicleId: '7',
    vehicle: mockVehicles[6],
    employeeId: '2',
    employeeName: 'Ana Santos',
    status: 'approved',
    date: '2024-03-23',
    photos: [],
    checklist: { exterior: true, interior: true, engine: true, tires: true, documents: true, lights: true },
  },
  {
    id: '7',
    vehicleId: '8',
    vehicle: mockVehicles[7],
    employeeId: '11',
    employeeName: 'Lucas Pereira',
    status: 'rejected',
    date: '2024-05-16',
    photos: [],
    checklist: { exterior: true, interior: false, engine: false, tires: true, documents: true, lights: true },
    notes: 'Danos no interior não declarados',
  },
];

export const mockMonthlyStats: MonthlyStats[] = [
  { month: 'Jan', vehicles: 45, inspections: 42, revenue: 67500, profit: 23625 },
  { month: 'Fev', vehicles: 52, inspections: 48, revenue: 78000, profit: 27300 },
  { month: 'Mar', vehicles: 61, inspections: 58, revenue: 91500, profit: 32025 },
  { month: 'Abr', vehicles: 58, inspections: 55, revenue: 87000, profit: 30450 },
  { month: 'Mai', vehicles: 72, inspections: 68, revenue: 108000, profit: 37800 },
  { month: 'Jun', vehicles: 85, inspections: 80, revenue: 127500, profit: 44625 },
];

export const getEmployeeStats = (employeeId: string) => {
  const employeeInspections = mockInspections.filter(i => i.employeeId === employeeId);
  return {
    total: employeeInspections.length,
    approved: employeeInspections.filter(i => i.status === 'approved').length,
    pending: employeeInspections.filter(i => i.status === 'pending' || i.status === 'in_progress').length,
    rejected: employeeInspections.filter(i => i.status === 'rejected').length,
  };
};

