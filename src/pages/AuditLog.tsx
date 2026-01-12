import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAudit } from '@/contexts/AuditContext';
import { AuditTimeline } from '@/components/AuditTimeline';
import { AuditAction, AuditEntity, AuditFilters } from '@/types/audit';
import { Search, Download, FileText, Users, Activity, Calendar, Trash2 } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

export default function AuditLog() {
  const { logs, clearLogs } = useAudit();
  const { toast } = useToast();
  const [isClearOpen, setIsClearOpen] = useState(false);
  const [filters, setFilters] = useState<AuditFilters>({
    search: '',
    entity: 'all',
    action: 'all',
    userId: 'all',
    dateFrom: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    dateTo: format(new Date(), 'yyyy-MM-dd'),
  });

  // Get unique users from logs
  const uniqueUsers = useMemo(() => {
    const users = new Map<string, string>();
    logs.forEach(log => {
      if (!users.has(log.userId)) {
        users.set(log.userId, log.userName);
      }
    });
    return Array.from(users.entries());
  }, [logs]);

  // Filter logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          log.entityDescription.toLowerCase().includes(searchLower) ||
          log.userName.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Entity filter
      if (filters.entity !== 'all' && log.entity !== filters.entity) {
        return false;
      }

      // Action filter
      if (filters.action !== 'all' && log.action !== filters.action) {
        return false;
      }

      // User filter
      if (filters.userId !== 'all' && log.userId !== filters.userId) {
        return false;
      }

      // Date range filter
      const logDate = new Date(log.timestamp);
      const fromDate = startOfDay(new Date(filters.dateFrom));
      const toDate = endOfDay(new Date(filters.dateTo));
      if (!isWithinInterval(logDate, { start: fromDate, end: toDate })) {
        return false;
      }

      return true;
    });
  }, [logs, filters]);

  // Stats
  const stats = useMemo(() => {
    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);

    return {
      total: logs.length,
      today: logs.filter(log => 
        isWithinInterval(new Date(log.timestamp), { start: todayStart, end: todayEnd })
      ).length,
      critical: logs.filter(log => log.action === 'DELETE').length,
      uniqueUsers: new Set(logs.map(log => log.userId)).size,
    };
  }, [logs]);

  const handleExport = () => {
    const csvContent = [
      ['Data', 'Usuário', 'Ação', 'Entidade', 'Descrição'].join(','),
      ...filteredLogs.map(log => [
        format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm'),
        log.userName,
        log.action,
        log.entity,
        `"${log.entityDescription.replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `audit_logs_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();

    toast({
      title: "Exportação concluída",
      description: `${filteredLogs.length} registros exportados.`
    });
  };

  const handleClearLogs = () => {
    clearLogs();
    setIsClearOpen(false);
    toast({
      title: "Logs limpos",
      description: "Todos os registros de auditoria foram removidos."
    });
  };

  return (
    <AppLayout title="Logs de Auditoria">
      <div className="space-y-6 animate-fade-in">
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <span className="text-muted-foreground">
              {filteredLogs.length} de {logs.length} registros
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport} disabled={filteredLogs.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
            <Button variant="destructive" onClick={() => setIsClearOpen(true)} disabled={logs.length === 0}>
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar Logs
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Calendar className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.today}</p>
                  <p className="text-sm text-muted-foreground">Hoje</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <Activity className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.critical}</p>
                  <p className="text-sm text-muted-foreground">Exclusões</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Users className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.uniqueUsers}</p>
                  <p className="text-sm text-muted-foreground">Usuários</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="lg:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
              <Select 
                value={filters.entity} 
                onValueChange={(v) => setFilters(prev => ({ ...prev, entity: v as AuditEntity | 'all' }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Entidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas entidades</SelectItem>
                  <SelectItem value="INSPECTION">Vistoria</SelectItem>
                  <SelectItem value="VEHICLE">Veículo</SelectItem>
                  <SelectItem value="USER">Usuário</SelectItem>
                  <SelectItem value="GOAL">Meta</SelectItem>
                  <SelectItem value="SESSION">Sessão</SelectItem>
                </SelectContent>
              </Select>
              <Select 
                value={filters.action} 
                onValueChange={(v) => setFilters(prev => ({ ...prev, action: v as AuditAction | 'all' }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Ação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas ações</SelectItem>
                  <SelectItem value="CREATE">Criação</SelectItem>
                  <SelectItem value="UPDATE">Edição</SelectItem>
                  <SelectItem value="DELETE">Exclusão</SelectItem>
                  <SelectItem value="STATUS_CHANGE">Alteração de Status</SelectItem>
                  <SelectItem value="LOGIN">Login</SelectItem>
                  <SelectItem value="LOGOUT">Logout</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              />
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Timeline de Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <AuditTimeline logs={filteredLogs} />
          </CardContent>
        </Card>
      </div>

      {/* Clear Logs Confirmation */}
      <AlertDialog open={isClearOpen} onOpenChange={setIsClearOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Limpar Logs de Auditoria</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover todos os {logs.length} registros de auditoria? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleClearLogs} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Limpar Tudo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
