import { useAuth } from '@/contexts/AuthContext';
import { AdminDashboard } from '@/components/dashboards/AdminDashboard';
import { EmployeeDashboard } from '@/components/dashboards/EmployeeDashboard';
import { AppLayout } from '@/components/AppLayout';

export default function Dashboard() {
  const { user } = useAuth();

  const getDashboardTitle = () => {
    switch (user?.role) {
      case 'admin':
        return 'Painel Administrativo';
      case 'employee':
        return 'Meu Painel';
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
