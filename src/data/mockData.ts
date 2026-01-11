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

export interface StatusHistoryEntry {
  id: string;
  previousStatus: Inspection['status'];
  newStatus: Inspection['status'];
  changedBy: string;
  changedById: string;
  changedAt: string;
  notes?: string;
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
  statusHistory?: StatusHistoryEntry[];
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
  { id: '9', plate: 'YZA-3456', brand: 'Nissan', model: 'Kicks', year: 2023, color: 'Prata', ownerId: '11', ownerName: 'Amanda Silva', status: 'pending', createdAt: '2024-06-01' },
  { id: '10', plate: 'BCD-7890', brand: 'Jeep', model: 'Renegade', year: 2022, color: 'Verde', ownerId: '12', ownerName: 'Bruno Cardoso', status: 'pending', createdAt: '2024-06-02' },
  { id: '11', plate: 'EFG-1234', brand: 'Peugeot', model: '208', year: 2021, color: 'Preto', ownerId: '13', ownerName: 'Camila Nunes', status: 'expired', createdAt: '2024-05-28' },
  { id: '12', plate: 'HIJ-5678', brand: 'Citroën', model: 'C3', year: 2020, color: 'Branco', ownerId: '14', ownerName: 'Daniel Rocha', status: 'expired', createdAt: '2024-05-20' },
  { id: '13', plate: 'KLM-9012', brand: 'Kia', model: 'Sportage', year: 2023, color: 'Azul', ownerId: '15', ownerName: 'Eduarda Martins', status: 'pending', createdAt: '2024-06-03' },
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
    statusHistory: [
      {
        id: '1',
        previousStatus: 'pending',
        newStatus: 'in_progress',
        changedBy: 'Admin User',
        changedById: '1',
        changedAt: '2024-01-16T09:00:00.000Z',
        notes: 'Iniciando análise do veículo'
      },
      {
        id: '2',
        previousStatus: 'in_progress',
        newStatus: 'approved',
        changedBy: 'Admin User',
        changedById: '1',
        changedAt: '2024-01-16T14:30:00.000Z',
        notes: 'Veículo em conformidade total'
      }
    ],
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
  {
    id: '8',
    vehicleId: '9',
    vehicle: mockVehicles[8],
    employeeId: '2',
    employeeName: 'Ana Santos',
    status: 'pending',
    date: '2024-06-01',
    photos: [],
    checklist: { exterior: false, interior: false, engine: false, tires: false, documents: false, lights: false },
    notes: 'Aguardando documentação',
  },
  {
    id: '9',
    vehicleId: '10',
    vehicle: mockVehicles[9],
    employeeId: '2',
    employeeName: 'Ana Santos',
    status: 'in_progress',
    date: '2024-06-02',
    photos: [],
    checklist: { exterior: true, interior: true, engine: false, tires: false, documents: true, lights: false },
  },
  {
    id: '10',
    vehicleId: '11',
    vehicle: mockVehicles[10],
    employeeId: '2',
    employeeName: 'Ana Santos',
    status: 'rejected',
    date: '2024-05-28',
    photos: [],
    checklist: { exterior: true, interior: false, engine: true, tires: true, documents: true, lights: true },
    notes: 'Avarias não declaradas no para-choque',
  },
  {
    id: '11',
    vehicleId: '12',
    vehicle: mockVehicles[11],
    employeeId: '2',
    employeeName: 'Ana Santos',
    status: 'rejected',
    date: '2024-05-20',
    photos: [],
    checklist: { exterior: false, interior: true, engine: true, tires: true, documents: true, lights: true },
    notes: 'Vidro trincado não informado',
  },
  {
    id: '12',
    vehicleId: '13',
    vehicle: mockVehicles[12],
    employeeId: '2',
    employeeName: 'Ana Santos',
    status: 'pending',
    date: '2024-06-03',
    photos: [],
    checklist: { exterior: false, interior: false, engine: false, tires: false, documents: false, lights: false },
    notes: 'Cliente reagendou',
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

