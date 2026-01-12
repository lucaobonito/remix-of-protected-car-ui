import { ClipboardCheck, CheckCircle, Clock, XCircle, Plus, Target, Trophy, Eye, ListTodo, Medal, ArrowRight } from 'lucide-react';
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
import { useGoals } from '@/contexts/GoalsContext';
import { useAchievements, EmployeeStats } from '@/contexts/AchievementsContext';
import { useGoalAchievementAlert } from '@/hooks/useGoalAchievementAlert';
import { useAchievementCheck } from '@/hooks/useAchievementCheck';
import { Progress } from '@/components/ui/progress';
import { AchievementBadge } from '@/components/AchievementBadge';
import { AchievementsDialog } from '@/components/AchievementsDialog';
import { achievements } from '@/data/achievements';
import { QuickActionsBar } from '@/components/QuickActionsBar';
import { AlertsCard, AlertItem } from '@/components/AlertsCard';

export function EmployeeDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { inspections, getEmployeeStats, getEmployeeStatsForCurrentMonth } = useVehicles();
  const { goals } = useGoals();
  const { getEmployeeAchievements, getTotalPoints, isAchievementUnlocked, getProgress } = useAchievements();
  
  const employeeId = user?.id || '2';
  const stats = getEmployeeStats(employeeId);
  const monthlyStats = getEmployeeStatsForCurrentMonth(employeeId);
  
  // Prepare stats for achievement system
  const achievementStats: EmployeeStats = {
    ...stats,
    approvalRate: stats.total > 0 ? (stats.approved / stats.total) * 100 : 0,
    currentStreak: 0, // TODO: Calculate actual streak
    monthlyGoalsMet: monthlyStats.total >= goals.monthly.targetInspections && 
                     monthlyStats.approvalRate >= goals.monthly.targetApprovalRate,
  };
  
  // Hook que verifica e dispara alertas de metas atingidas
  useGoalAchievementAlert(employeeId, monthlyStats);
  
  // Hook que verifica e desbloqueia conquistas
  useAchievementCheck(employeeId, achievementStats);
  
  const employeeAchievements = getEmployeeAchievements(employeeId);
  const totalPoints = getTotalPoints(employeeId);
  
  const employeeInspections = inspections.filter(i => i.employeeId === employeeId);
  const pendingInspections = employeeInspections.filter(i => i.status === 'pending');
  
  const monthlyGoals = goals.monthly;
  const inspectionsProgress = Math.min((monthlyStats.total / monthlyGoals.targetInspections) * 100, 100);
  const approvalProgress = Math.min((monthlyStats.approvalRate / monthlyGoals.targetApprovalRate) * 100, 100);
  const remainingForGoal = Math.max(0, monthlyGoals.targetInspections - monthlyStats.total);

  const chartData = [
    { name: 'Aprovadas', value: stats.approved, fill: 'hsl(var(--success))' },
    { name: 'Pendentes', value: stats.pending, fill: 'hsl(var(--warning))' },
    { name: 'Rejeitadas', value: stats.rejected, fill: 'hsl(var(--destructive))' },
  ];

  // Find next achievement
  const nextAchievement = achievements.find(
    a => !isAchievementUnlocked(employeeId, a.id) && 
         getProgress(employeeId, a, achievementStats) > 0
  );
  const nextAchievementProgress = nextAchievement 
    ? getProgress(employeeId, nextAchievement, achievementStats) 
    : 0;

  // Build alerts
  const alerts: AlertItem[] = [];
  
  if (pendingInspections.length > 0) {
    alerts.push({
      type: 'warning',
      message: 'vistorias aguardando sua análise',
      count: pendingInspections.length,
      actionLabel: 'Ver Agora',
      onClick: () => navigate('/inspections?status=pending'),
    });
  }
  
  if (remainingForGoal > 0) {
    alerts.push({
      type: 'info',
      message: `vistorias para atingir a meta`,
      count: remainingForGoal,
      actionLabel: 'Nova Vistoria',
      onClick: () => navigate('/new-inspection'),
    });
  }

  if (nextAchievement && nextAchievementProgress >= 70) {
    alerts.push({
      type: 'success',
      message: `${Math.round(nextAchievementProgress)}% para "${nextAchievement.name}"`,
      actionLabel: 'Ver Conquistas',
      onClick: () => {},
    });
  }

  const quickActions = [
    {
      label: 'Nova Vistoria',
      icon: <Plus className="h-4 w-4" />,
      onClick: () => navigate('/new-inspection'),
    },
    {
      label: 'Minhas Pendentes',
      icon: <ListTodo className="h-4 w-4" />,
      onClick: () => navigate('/inspections?status=pending'),
      variant: 'outline' as const,
    },
    {
      label: 'Ver Ranking',
      icon: <Medal className="h-4 w-4" />,
      onClick: () => navigate('/rankings'),
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
        title={`Olá, ${user?.name?.split(' ')[0]}!`}
        subtitle="Confira seu desempenho e vistorias pendentes"
        actions={quickActions}
      />

      {/* Alerts Card */}
      {alerts.length > 0 && <AlertsCard title="Próximas Ações" alerts={alerts} />}

      {/* Stats Grid - Now Clickable */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatsCard
          title="Total de Vistorias"
          value={stats.total}
          icon={<ClipboardCheck className="h-5 w-5 sm:h-6 sm:w-6" />}
          onClick={() => navigate('/inspections')}
        />
        <StatsCard
          title="Aprovadas"
          value={stats.approved}
          icon={<CheckCircle className="h-5 w-5 sm:h-6 sm:w-6" />}
          onClick={() => navigate('/inspections?status=approved')}
        />
        <StatsCard
          title="Pendentes"
          value={stats.pending}
          icon={<Clock className="h-5 w-5 sm:h-6 sm:w-6" />}
          onClick={() => navigate('/inspections?status=pending')}
          actionLabel="Ver pendentes"
          onAction={() => navigate('/inspections?status=pending')}
        />
        <StatsCard
          title="Rejeitadas"
          value={stats.rejected}
          icon={<XCircle className="h-5 w-5 sm:h-6 sm:w-6" />}
          onClick={() => navigate('/inspections?status=rejected')}
        />
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Achievements Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Minhas Conquistas
              </CardTitle>
              <AchievementsDialog employeeId={employeeId} stats={achievementStats} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Points Summary */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10">
              <div>
                <p className="text-2xl font-bold text-primary">{totalPoints}</p>
                <p className="text-xs text-muted-foreground">Pontos Totais</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-foreground">
                  {employeeAchievements.length}<span className="text-muted-foreground">/{achievements.length}</span>
                </p>
                <p className="text-xs text-muted-foreground">Desbloqueadas</p>
              </div>
            </div>

            {/* Recent Badges */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Badges</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {achievements.slice(0, 6).map((achievement) => {
                  const unlocked = isAchievementUnlocked(employeeId, achievement.id);
                  const progress = getProgress(employeeId, achievement, achievementStats);
                  return (
                    <AchievementBadge
                      key={achievement.id}
                      achievement={achievement}
                      unlocked={unlocked}
                      progress={progress}
                      size="sm"
                    />
                  );
                })}
              </div>
            </div>

            {/* Next Achievement */}
            {nextAchievement && (
              <div className="pt-2 border-t space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Próxima conquista</p>
                <div className="flex items-center gap-2">
                  <AchievementBadge
                    achievement={nextAchievement}
                    unlocked={false}
                    progress={nextAchievementProgress}
                    size="sm"
                    showTooltip={false}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{nextAchievement.name}</p>
                    <Progress value={nextAchievementProgress} className="h-1.5 mt-1" />
                  </div>
                  <span className="text-xs text-muted-foreground">{Math.round(nextAchievementProgress)}%</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Goals Progress Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Progresso das Metas
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Inspections Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Vistorias</span>
                <span className="font-medium">
                  {monthlyStats.total}/{monthlyGoals.targetInspections}
                </span>
              </div>
              <Progress value={inspectionsProgress} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className={monthlyStats.total >= monthlyGoals.minInspections ? 'text-success' : ''}>
                  Mín: {monthlyGoals.minInspections} {monthlyStats.total >= monthlyGoals.minInspections && '✓'}
                </span>
                <span className={monthlyStats.total >= monthlyGoals.targetInspections ? 'text-success' : ''}>
                  Alvo: {monthlyGoals.targetInspections} {monthlyStats.total >= monthlyGoals.targetInspections && '✓'}
                </span>
              </div>
            </div>

            {/* Approval Rate Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Taxa de Aprovação</span>
                <span className="font-medium">
                  {monthlyStats.approvalRate.toFixed(0)}%
                </span>
              </div>
              <Progress value={approvalProgress} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className={monthlyStats.approvalRate >= monthlyGoals.minApprovalRate ? 'text-success' : ''}>
                  Mín: {monthlyGoals.minApprovalRate}% {monthlyStats.approvalRate >= monthlyGoals.minApprovalRate && '✓'}
                </span>
                <span className={monthlyStats.approvalRate >= monthlyGoals.targetApprovalRate ? 'text-success' : ''}>
                  Alvo: {monthlyGoals.targetApprovalRate}% {monthlyStats.approvalRate >= monthlyGoals.targetApprovalRate && '✓'}
                </span>
              </div>
            </div>

            {/* Achievement Status with Action */}
            <div className="pt-2 border-t space-y-2">
              {monthlyStats.total >= monthlyGoals.targetInspections && monthlyStats.approvalRate >= monthlyGoals.targetApprovalRate ? (
                <Badge variant="success" className="w-full justify-center py-1">
                  🏆 Todas as metas atingidas!
                </Badge>
              ) : monthlyStats.total >= monthlyGoals.minInspections && monthlyStats.approvalRate >= monthlyGoals.minApprovalRate ? (
                <Badge variant="pending" className="w-full justify-center py-1">
                  🎯 Metas mínimas atingidas
                </Badge>
              ) : (
                <>
                  <Badge variant="muted" className="w-full justify-center py-1">
                    Continue trabalhando nas metas
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full gap-2"
                    onClick={() => navigate('/new-inspection')}
                  >
                    <Plus className="h-4 w-4" />
                    Iniciar Vistoria
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Performance Chart */}
        <Card className="lg:col-span-1">
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
      </div>

      {/* Monthly Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base sm:text-lg font-semibold">Resumo do Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div 
              className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-success/10 cursor-pointer hover:bg-success/20 transition-colors"
              onClick={() => navigate('/inspections?status=approved')}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-success" />
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Taxa de Aprovação</p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">
                    {monthlyStats.approvalRate.toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>
            
            <div 
              className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-primary/10 cursor-pointer hover:bg-primary/20 transition-colors"
              onClick={() => navigate('/inspections')}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <ClipboardCheck className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Vistorias do Mês</p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">
                    {monthlyStats.total} <span className="text-sm font-normal hidden sm:inline">vistorias</span>
                  </p>
                </div>
              </div>
            </div>

            <div 
              className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-warning/10 cursor-pointer hover:bg-warning/20 transition-colors"
              onClick={() => navigate('/inspections?status=pending')}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-warning" />
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Aguardando Ação</p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.pending}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* My Inspections Table */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base sm:text-lg font-semibold">Minhas Vistorias</CardTitle>
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
                  <th className="py-3 px-4 text-left text-xs sm:text-sm font-medium text-muted-foreground hidden md:table-cell">Proprietário</th>
                  <th className="py-3 px-4 text-left text-xs sm:text-sm font-medium text-muted-foreground hidden lg:table-cell">Data</th>
                  <th className="py-3 px-4 text-left text-xs sm:text-sm font-medium text-muted-foreground">Status</th>
                  <th className="py-3 px-4 text-right text-xs sm:text-sm font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {employeeInspections.slice(0, 5).map((inspection) => (
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
