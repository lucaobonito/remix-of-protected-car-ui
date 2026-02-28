export type TicketType = 'guincho' | 'pneu' | 'bateria' | 'chaveiro' | 'outros';
export type TrackingStatus = 'aguardando' | 'a_caminho' | 'no_local' | 'concluido';
export type Priority = 'alta' | 'media' | 'baixa';

export interface AssistanceTicket {
  id: string;
  requesterName: string;
  vehicleBrand: string;
  vehicleModel: string;
  plate: string;
  status: 'atendido' | 'pendente';
  assignedTo: string | null;
  assignedToName: string | null;
  createdAt: string;
  description: string;
  type: TicketType;
  priority: Priority;
  location: string;
  closedAt: string | null;
  partnerId: string | null;
  partnerName: string | null;
  trackingStatus: TrackingStatus;
  estimatedArrival: number | null;
}

export interface Partner {
  id: string;
  name: string;
  services: TicketType[];
  region: string;
  phone: string;
  rating: number;
  active: boolean;
}

export const mockPartners: Partner[] = [
  {
    id: 'p1',
    name: 'Auto Socorro 24h',
    services: ['guincho', 'pneu', 'bateria'],
    region: 'São Paulo - Zona Sul',
    phone: '(11) 99999-1234',
    rating: 4.8,
    active: true,
  },
  {
    id: 'p2',
    name: 'Guinchos Rápido',
    services: ['guincho'],
    region: 'São Paulo - Zona Norte',
    phone: '(11) 99888-5678',
    rating: 4.5,
    active: true,
  },
  {
    id: 'p3',
    name: 'SOS Baterias',
    services: ['bateria', 'outros'],
    region: 'São Paulo - Centro',
    phone: '(11) 99777-9012',
    rating: 4.2,
    active: true,
  },
  {
    id: 'p4',
    name: 'Chaveiro Express',
    services: ['chaveiro'],
    region: 'São Paulo - Zona Oeste',
    phone: '(11) 99666-3456',
    rating: 4.9,
    active: true,
  },
  {
    id: 'p5',
    name: 'Mecânica Móvel Premium',
    services: ['pneu', 'bateria', 'outros'],
    region: 'São Paulo - Zona Leste',
    phone: '(11) 99555-7890',
    rating: 4.6,
    active: true,
  },
  {
    id: 'p6',
    name: 'Reboque Seguro',
    services: ['guincho', 'pneu'],
    region: 'Guarulhos',
    phone: '(11) 99444-1234',
    rating: 3.9,
    active: false,
  },
];

export const mockAssistanceData: AssistanceTicket[] = [
  {
    id: 'a1',
    requesterName: 'João Mendes',
    vehicleBrand: 'Toyota',
    vehicleModel: 'Corolla',
    plate: 'ABC-1234',
    status: 'atendido',
    assignedTo: '2',
    assignedToName: 'Ana Santos',
    createdAt: '2025-02-20',
    description: 'Pneu furado na rodovia',
    type: 'pneu',
    priority: 'alta',
    location: 'Rodovia Anhanguera, km 32',
    closedAt: '2025-02-20',
    partnerId: 'p1',
    partnerName: 'Auto Socorro 24h',
    trackingStatus: 'concluido',
    estimatedArrival: null,
  },
  {
    id: 'a2',
    requesterName: 'Maria Oliveira',
    vehicleBrand: 'Honda',
    vehicleModel: 'Civic',
    plate: 'DEF-5678',
    status: 'pendente',
    assignedTo: null,
    assignedToName: null,
    createdAt: '2025-02-22',
    description: 'Bateria descarregada',
    type: 'bateria',
    priority: 'media',
    location: 'Av. Paulista, 1500',
    closedAt: null,
    partnerId: null,
    partnerName: null,
    trackingStatus: 'aguardando',
    estimatedArrival: null,
  },
  {
    id: 'a3',
    requesterName: 'Pedro Souza',
    vehicleBrand: 'Fiat',
    vehicleModel: 'Argo',
    plate: 'GHI-9012',
    status: 'pendente',
    assignedTo: '3',
    assignedToName: 'Lucas Pereira',
    createdAt: '2025-02-23',
    description: 'Problema no motor',
    type: 'guincho',
    priority: 'alta',
    location: 'Rua Augusta, 200',
    closedAt: null,
    partnerId: 'p2',
    partnerName: 'Guinchos Rápido',
    trackingStatus: 'a_caminho',
    estimatedArrival: 25,
  },
  {
    id: 'a4',
    requesterName: 'Carla Ferreira',
    vehicleBrand: 'Chevrolet',
    vehicleModel: 'Onix',
    plate: 'JKL-3456',
    status: 'atendido',
    assignedTo: '2',
    assignedToName: 'Ana Santos',
    createdAt: '2025-02-18',
    description: 'Chaveiro - chave trancada dentro do veículo',
    type: 'chaveiro',
    priority: 'media',
    location: 'Shopping Morumbi',
    closedAt: '2025-02-18',
    partnerId: 'p4',
    partnerName: 'Chaveiro Express',
    trackingStatus: 'concluido',
    estimatedArrival: null,
  },
  {
    id: 'a5',
    requesterName: 'Roberto Lima',
    vehicleBrand: 'Volkswagen',
    vehicleModel: 'Gol',
    plate: 'MNO-7890',
    status: 'pendente',
    assignedTo: null,
    assignedToName: null,
    createdAt: '2025-02-24',
    description: 'Guincho - veículo não liga',
    type: 'guincho',
    priority: 'alta',
    location: 'Marginal Tietê, sentido Castello Branco',
    closedAt: null,
    partnerId: null,
    partnerName: null,
    trackingStatus: 'aguardando',
    estimatedArrival: null,
  },
  {
    id: 'a6',
    requesterName: 'Fernanda Costa',
    vehicleBrand: 'Hyundai',
    vehicleModel: 'HB20',
    plate: 'PQR-1234',
    status: 'atendido',
    assignedTo: '3',
    assignedToName: 'Lucas Pereira',
    createdAt: '2025-02-17',
    description: 'Troca de pneu na estrada',
    type: 'pneu',
    priority: 'media',
    location: 'Via Dutra, km 180',
    closedAt: '2025-02-17',
    partnerId: 'p1',
    partnerName: 'Auto Socorro 24h',
    trackingStatus: 'concluido',
    estimatedArrival: null,
  },
  {
    id: 'a7',
    requesterName: 'Lucas Almeida',
    vehicleBrand: 'Renault',
    vehicleModel: 'Kwid',
    plate: 'STU-5678',
    status: 'pendente',
    assignedTo: null,
    assignedToName: null,
    createdAt: '2025-02-25',
    description: 'Colisão leve - precisa de guincho',
    type: 'guincho',
    priority: 'alta',
    location: 'Av. Brasil, 3000',
    closedAt: null,
    partnerId: null,
    partnerName: null,
    trackingStatus: 'aguardando',
    estimatedArrival: null,
  },
  {
    id: 'a8',
    requesterName: 'Juliana Martins',
    vehicleBrand: 'Ford',
    vehicleModel: 'Ka',
    plate: 'VWX-9012',
    status: 'atendido',
    assignedTo: '1',
    assignedToName: 'Carlos Silva',
    createdAt: '2025-02-19',
    description: 'Vidro elétrico travado',
    type: 'outros',
    priority: 'baixa',
    location: 'Rua Oscar Freire, 900',
    closedAt: '2025-02-19',
    partnerId: 'p5',
    partnerName: 'Mecânica Móvel Premium',
    trackingStatus: 'concluido',
    estimatedArrival: null,
  },
  {
    id: 'a9',
    requesterName: 'André Barbosa',
    vehicleBrand: 'Jeep',
    vehicleModel: 'Renegade',
    plate: 'YZA-3456',
    status: 'pendente',
    assignedTo: '1',
    assignedToName: 'Carlos Silva',
    createdAt: '2025-02-24',
    description: 'Superaquecimento do motor',
    type: 'guincho',
    priority: 'alta',
    location: 'Rodovia dos Bandeirantes, km 50',
    closedAt: null,
    partnerId: 'p2',
    partnerName: 'Guinchos Rápido',
    trackingStatus: 'no_local',
    estimatedArrival: 0,
  },
  {
    id: 'a10',
    requesterName: 'Patrícia Rocha',
    vehicleBrand: 'Nissan',
    vehicleModel: 'Kicks',
    plate: 'BCD-7890',
    status: 'pendente',
    assignedTo: null,
    assignedToName: null,
    createdAt: '2025-02-25',
    description: 'Pane elétrica',
    type: 'outros',
    priority: 'media',
    location: 'Av. Interlagos, 1200',
    closedAt: null,
    partnerId: null,
    partnerName: null,
    trackingStatus: 'aguardando',
    estimatedArrival: null,
  },
];

export const typeLabels: Record<TicketType, string> = {
  guincho: 'Guincho',
  pneu: 'Pneu',
  bateria: 'Bateria',
  chaveiro: 'Chaveiro',
  outros: 'Outros',
};

export const priorityLabels: Record<Priority, string> = {
  alta: 'Alta',
  media: 'Média',
  baixa: 'Baixa',
};

export const trackingLabels: Record<TrackingStatus, string> = {
  aguardando: 'Aguardando',
  a_caminho: 'A Caminho',
  no_local: 'No Local',
  concluido: 'Concluído',
};
