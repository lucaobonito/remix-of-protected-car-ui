import { Car, ClipboardCheck, TrendingUp, DollarSign } from 'lucide-react';
import { StatsCard } from '@/components/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { mockMonthlyStats, mockInspections } from '@/data/mockData';

export function AdminDashboard() {
  const totalVehicles = mockMonthlyStats.reduce((acc, m) => acc + m.vehicles, 0);
  const totalInspections = mockMonthlyStats.reduce((acc, m) => acc + m.inspections, 0);
  const totalRevenue = mockMonthlyStats.reduce((acc, m) => acc + m.revenue, 0);
  const totalProfit = mockMonthlyStats.reduce((acc, m) => acc + m.profit, 0);

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
    <div className="space-y-6 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Veículos Protegidos"
          value={totalVehicles}
          icon={<Car className="h-6 w-6" />}
          trend={{ value: 12.5, isPositive: true }}
        />
        <StatsCard
          title="Vistorias Realizadas"
          value={totalInspections}
          icon={<ClipboardCheck className="h-6 w-6" />}
          trend={{ value: 8.2, isPositive: true }}
        />
        <StatsCard
          title="Receita Total"
          value={`R$ ${(totalRevenue / 1000).toFixed(0)}k`}
          icon={<TrendingUp className="h-6 w-6" />}
          trend={{ value: 15.3, isPositive: true }}
        />
        <StatsCard
          title="Lucro Total"
          value={`R$ ${(totalProfit / 1000).toFixed(0)}k`}
          icon={<DollarSign className="h-6 w-6" />}
          trend={{ value: 10.1, isPositive: true }}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Vehicles Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Entrada de Veículos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={mockMonthlyStats}>
                <defs>
                  <linearGradient id="colorVehicles" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
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
          </CardContent>
        </Card>

        {/* Inspections Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Vistorias por Período</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={mockMonthlyStats}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="inspections" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue vs Profit Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Receita vs Lucro Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={mockMonthlyStats}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => `R$ ${(value / 1000).toFixed(1)}k`}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  name="Receita"
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="hsl(var(--success))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--success))', strokeWidth: 2, r: 4 }}
                  name="Lucro"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Inspections Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Vistorias Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">Veículo</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">Placa</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">Funcionário</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">Data</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {mockInspections.slice(0, 5).map((inspection) => (
                  <tr key={inspection.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 text-sm font-medium text-foreground">
                      {inspection.vehicle.brand} {inspection.vehicle.model}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{inspection.vehicle.plate}</td>
                    <td className="py-3 px-4 text-sm text-foreground">{inspection.employeeName}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
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
