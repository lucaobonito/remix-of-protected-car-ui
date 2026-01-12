import { Car, ClipboardCheck, TrendingUp, DollarSign, Plus, Settings, Eye, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StatsCard } from '@/components/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { QuickActionsBar } from '@/components/QuickActionsBar';
import { AlertsCard, AlertItem } from '@/components/AlertsCard';
import { TeamPerformanceCard } from '@/components/TeamPerformanceCard';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { mockMonthlyStats } from '@/data/mockData';
import { useVehicles } from '@/contexts/VehiclesContext';

export function AdminDashboard() {
  const navigate = useNavigate();
  const { inspections } = useVehicles();
  const totalVehicles = mockMonthlyStats.reduce((acc, m) => acc + m.vehicles, 0);
  const totalInspections = mockMonthlyStats.reduce((acc, m) => acc + m.inspections, 0);
  const totalRevenue = mockMonthlyStats.reduce((acc, m) => acc + m.revenue, 0);
  const totalProfit = mockMonthlyStats.reduce((acc, m) => acc + m.profit, 0);

  // Calculate alerts
  const pendingInspections = inspections.filter(i => i.status === 'pending');
  const inProgressInspections = inspections.filter(i => i.status === 'in_progress');
  const approvedToday = inspections.filter(
    i => i.status === 'approved' && 
    new Date(i.date).toDateString() === new Date().toDateString()
  );

  const alerts: AlertItem[] = [];
  
  if (pendingInspections.length > 0) {
    alerts.push({
      type: 'warning',
      message: 'vistorias pendentes de análise',
      count: pendingInspections.length,
      actionLabel: 'Ver Pendentes',
      onClick: () => navigate('/inspections?status=pending'),
    });
  }
  
  if (inProgressInspections.length > 0) {
    alerts.push({
      type: 'info',
      message: 'vistorias em andamento',
      count: inProgressInspections.length,
      actionLabel: 'Acompanhar',
      onClick: () => navigate('/inspections?status=in_progress'),
    });
  }

  if (approvedToday.length > 0) {
    alerts.push({
      type: 'success',
      message: 'vistorias aprovadas hoje',
      count: approvedToday.length,
      actionLabel: 'Ver Detalhes',
      onClick: () => navigate('/inspections?status=approved'),
    });
  }

  const quickActions = [
    {
      label: 'Nova Vistoria',
      icon: <Plus className="h-4 w-4" />,
      onClick: () => navigate('/new-inspection'),
    },
    {
      label: 'Ver Veículos',
      icon: <Car className="h-4 w-4" />,
      onClick: () => navigate('/vehicles'),
      variant: 'outline' as const,
    },
    {
      label: 'Configurações',
      icon: <Settings className="h-4 w-4" />,
      onClick: () => navigate('/settings'),
      variant: 'outline' as const,
    },
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
      {/* Header with Quick Actions */}
      <QuickActionsBar
        title="Painel Administrativo"
        subtitle="Visão geral do sistema"
        actions={quickActions}
      />

      {/* Alerts Card */}
      {alerts.length > 0 && <AlertsCard alerts={alerts} />}

      {/* Stats Grid - Now Clickable */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatsCard
          title="Veículos Protegidos"
          value={totalVehicles}
          icon={<Car className="h-5 w-5 sm:h-6 sm:w-6" />}
          trend={{ value: 12.5, isPositive: true }}
          onClick={() => navigate('/vehicles')}
          actionLabel="Ver todos"
          onAction={() => navigate('/vehicles')}
        />
        <StatsCard
          title="Vistorias Realizadas"
          value={totalInspections}
          icon={<ClipboardCheck className="h-5 w-5 sm:h-6 sm:w-6" />}
          trend={{ value: 8.2, isPositive: true }}
          onClick={() => navigate('/inspections')}
          actionLabel="Ver todas"
          onAction={() => navigate('/inspections')}
        />
        <StatsCard
          title="Receita Total"
          value={`R$ ${(totalRevenue / 1000).toFixed(0)}k`}
          icon={<TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" />}
          trend={{ value: 15.3, isPositive: true }}
          onClick={() => navigate('/reports')}
          actionLabel="Relatórios"
          onAction={() => navigate('/reports')}
        />
        <StatsCard
          title="Lucro Total"
          value={`R$ ${(totalProfit / 1000).toFixed(0)}k`}
          icon={<DollarSign className="h-5 w-5 sm:h-6 sm:w-6" />}
          trend={{ value: 10.1, isPositive: true }}
          onClick={() => navigate('/reports')}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Vehicles Chart */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg font-semibold">Entrada de Veículos</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/vehicles')}
                className="gap-1 text-xs"
              >
                Ver mais
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] sm:h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockMonthlyStats}>
                  <defs>
                    <linearGradient id="colorVehicles" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis 
                    dataKey="month" 
                    className="text-xs" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    tickMargin={8}
                  />
                  <YAxis 
                    className="text-xs" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    tickMargin={8}
                    width={30}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="vehicles"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorVehicles)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Inspections Chart */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg font-semibold">Vistorias por Período</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/inspections')}
                className="gap-1 text-xs"
              >
                Ver mais
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] sm:h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockMonthlyStats}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis 
                    dataKey="month" 
                    className="text-xs" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    tickMargin={8}
                  />
                  <YAxis 
                    className="text-xs" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    tickMargin={8}
                    width={30}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="inspections" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Team Performance Card */}
        <TeamPerformanceCard />
      </div>

      {/* Revenue vs Profit Chart */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base sm:text-lg font-semibold">Receita vs Lucro Mensal</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/reports')}
              className="gap-1 text-xs"
            >
              Ver Relatórios
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] sm:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockMonthlyStats}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis 
                  dataKey="month" 
                  className="text-xs" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  tickMargin={8}
                />
                <YAxis 
                  className="text-xs" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  tickMargin={8}
                  width={40}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number) => `R$ ${(value / 1000).toFixed(1)}k`}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 3 }}
                  name="Receita"
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="hsl(var(--success))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--success))', strokeWidth: 2, r: 3 }}
                  name="Lucro"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Inspections Table */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base sm:text-lg font-semibold">Vistorias Recentes</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/inspections')}
              className="gap-1 text-xs"
            >
              Ver Todas
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 px-4 text-left text-xs sm:text-sm font-medium text-muted-foreground">Veículo</th>
                  <th className="py-3 px-4 text-left text-xs sm:text-sm font-medium text-muted-foreground hidden sm:table-cell">Placa</th>
                  <th className="py-3 px-4 text-left text-xs sm:text-sm font-medium text-muted-foreground hidden md:table-cell">Funcionário</th>
                  <th className="py-3 px-4 text-left text-xs sm:text-sm font-medium text-muted-foreground hidden lg:table-cell">Data</th>
                  <th className="py-3 px-4 text-left text-xs sm:text-sm font-medium text-muted-foreground">Status</th>
                  <th className="py-3 px-4 text-right text-xs sm:text-sm font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {inspections.slice(0, 5).map((inspection) => (
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
                    <td className="py-3 px-4 text-xs sm:text-sm text-foreground hidden md:table-cell">{inspection.employeeName}</td>
                    <td className="py-3 px-4 text-xs sm:text-sm text-muted-foreground hidden lg:table-cell">
                      {new Date(inspection.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(inspection.status)}</td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/inspections`)}
                        className="gap-1 h-7 text-xs"
                      >
                        <Eye className="h-3 w-3" />
                        <span className="hidden sm:inline">Detalhes</span>
                      </Button>
                    </td>
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
