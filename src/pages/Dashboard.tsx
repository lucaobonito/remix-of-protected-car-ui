import { useAuth } from '@/contexts/AuthContext';
import { AdminDashboard } from '@/components/dashboards/AdminDashboard';
import { EmployeeDashboard } from '@/components/dashboards/EmployeeDashboard';
import { ClientDashboard } from '@/components/dashboards/ClientDashboard';
import { AppLayout } from '@/components/AppLayout';

export default function Dashboard() {
  const { user } = useAuth();

  const getDashboardTitle = () => {
    switch (user?.role) {
      case 'admin':
        return 'Painel Administrativo';
      case 'employee':
        return 'Meu Painel';
      case 'client':
        return 'Meus Veículos';
      default:
        return 'Dashboard';
    }
  };

  const renderDashboard = () => {
    switch (user?.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'employee':
        return <EmployeeDashboard />;
      case 'client':
        return <ClientDashboard />;
      default:
        return null;
    }
  };

  return (
    <AppLayout title={getDashboardTitle()}>
      {renderDashboard()}
    </AppLayout>
  );
}
