import { Notification } from '@/types/notifications';

export const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Nova vistoria pendente',
    message: 'Veículo ABC-1234 aguarda aprovação de vistoria.',
    type: 'warning',
    read: false,
    createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 min atrás
    link: '/inspections',
  },
  {
    id: '2',
    title: 'Vistoria aprovada',
    message: 'A vistoria do veículo XYZ-5678 foi aprovada com sucesso.',
    type: 'success',
    read: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 min atrás
    link: '/inspections',
  },
  {
    id: '3',
    title: 'Alerta de vencimento',
    message: 'O veículo DEF-9012 está com a vistoria vencida há 5 dias.',
    type: 'error',
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
    link: '/vehicles',
  },
  {
    id: '4',
    title: 'Novo usuário cadastrado',
    message: 'O funcionário João Silva foi adicionado ao sistema.',
    type: 'info',
    read: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 dia atrás
    link: '/users',
  },
  {
    id: '5',
    title: 'Sistema atualizado',
    message: 'Novas funcionalidades disponíveis na versão 2.1.0.',
    type: 'info',
    read: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 dias atrás
  },
];
