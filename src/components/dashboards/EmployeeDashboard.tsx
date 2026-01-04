import { ClipboardCheck, CheckCircle, Clock, XCircle, Plus } from 'lucide-react';
import { StatsCard } from '@/components/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { useVehicles } from '@/contexts/VehiclesContext';

export function EmployeeDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { inspections, getEmployeeStats } = useVehicles();
  const stats = getEmployeeStats(user?.id || '2');
  
  const employeeInspections = inspections.filter(i => i.employeeId === (user?.id || '2'));

  const chartData = [
    { name: 'Aprovadas', value: stats.approved, fill: 'hsl(var(--success))' },
    { name: 'Pendentes', value: stats.pending, fill: 'hsl(var(--warning))' },
    { name: 'Rejeitadas', value: stats.rejected, fill: 'hsl(var(--destructive))' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Aprovada</Badge>;
      case 'pending':
        return <Badge variant="pending">Pendente</Badge>;
      case 'in_progress':
        return <Badge variant="warning">Em Andamento</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeitada</Badge>;
      default:
        return <Badge variant="muted">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Welcome Message */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Olá, {user?.name?.split(' ')[0]}!</h2>
          <p className="text-sm text-muted-foreground">Confira seu desempenho e vistorias pendentes</p>
        </div>
        <Button onClick={() => navigate('/new-inspection')} className="gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Nova Vistoria
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatsCard
          title="Total de Vistorias"
          value={stats.total}
          icon={<ClipboardCheck className="h-5 w-5 sm:h-6 sm:w-6" />}
        />
        <StatsCard
          title="Aprovadas"
          value={stats.approved}
          icon={<CheckCircle className="h-5 w-5 sm:h-6 sm:w-6" />}
        />
        <StatsCard
          title="Pendentes"
          value={stats.pending}
          icon={<Clock className="h-5 w-5 sm:h-6 sm:w-6" />}
        />
        <StatsCard
          title="Rejeitadas"
          value={stats.rejected}
          icon={<XCircle className="h-5 w-5 sm:h-6 sm:w-6" />}
        />
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Performance Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg font-semibold">Meu Desempenho</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] sm:h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={true} vertical={false} />
                  <XAxis 
                    type="number" 
                    className="text-xs" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    className="text-xs" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    width={70}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg font-semibold">Resumo do Mês</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-success/10">
              <div className="flex items-center gap-2 sm:gap-3">
                <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-success" />
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Taxa de Aprovação</p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">
                    {stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-primary/10">
              <div className="flex items-center gap-2 sm:gap-3">
                <ClipboardCheck className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Média Semanal</p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">
                    {Math.round(stats.total / 4)} <span className="text-sm font-normal hidden sm:inline">vistorias</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-warning/10">
              <div className="flex items-center gap-2 sm:gap-3">
                <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-warning" />
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Aguardando Ação</p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.pending}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Inspections Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base sm:text-lg font-semibold">Minhas Vistorias</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 px-4 text-left text-xs sm:text-sm font-medium text-muted-foreground">Veículo</th>
                  <th className="py-3 px-4 text-left text-xs sm:text-sm font-medium text-muted-foreground hidden sm:table-cell">Placa</th>
                  <th className="py-3 px-4 text-left text-xs sm:text-sm font-medium text-muted-foreground hidden md:table-cell">Proprietário</th>
                  <th className="py-3 px-4 text-left text-xs sm:text-sm font-medium text-muted-foreground hidden lg:table-cell">Data</th>
                  <th className="py-3 px-4 text-left text-xs sm:text-sm font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {employeeInspections.map((inspection) => (
                  <tr key={inspection.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <span className="text-xs sm:text-sm font-medium text-foreground">
                          {inspection.vehicle.brand} {inspection.vehicle.model}
                        </span>
                        <span className="text-xs text-muted-foreground block sm:hidden">
                          {inspection.vehicle.plate}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs sm:text-sm text-muted-foreground hidden sm:table-cell">{inspection.vehicle.plate}</td>
                    <td className="py-3 px-4 text-xs sm:text-sm text-foreground hidden md:table-cell">{inspection.vehicle.ownerName}</td>
                    <td className="py-3 px-4 text-xs sm:text-sm text-muted-foreground hidden lg:table-cell">
                      {new Date(inspection.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(inspection.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
