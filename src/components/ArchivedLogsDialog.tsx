import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AuditTimeline } from '@/components/AuditTimeline';
import { ArchivedAuditBatch, AuditAction, AuditEntity } from '@/types/audit';
import { Search, Download, Archive } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface ArchivedLogsDialogProps {
  batch: ArchivedAuditBatch | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ArchivedLogsDialog({ batch, open, onOpenChange }: ArchivedLogsDialogProps) {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState<AuditEntity | 'all'>('all');
  const [actionFilter, setActionFilter] = useState<AuditAction | 'all'>('all');

  const filteredLogs = useMemo(() => {
    if (!batch) return [];
    
    return batch.logs.filter(log => {
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch = 
          log.entityDescription.toLowerCase().includes(searchLower) ||
          log.userName.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      if (entityFilter !== 'all' && log.entity !== entityFilter) {
        return false;
      }

      if (actionFilter !== 'all' && log.action !== actionFilter) {
        return false;
      }

      return true;
    });
  }, [batch, search, entityFilter, actionFilter]);

  const handleExport = () => {
    if (!batch) return;

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
    link.download = `arquivo_${batch.id}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();

    toast({
      title: "Exportação concluída",
      description: `${filteredLogs.length} registros exportados do arquivo.`
    });
  };

  if (!batch) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Archive className="h-5 w-5 text-muted-foreground" />
            <DialogTitle>Arquivo de Logs</DialogTitle>
          </div>
          <DialogDescription>
            Arquivado em {format(new Date(batch.archivedAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} • 
            {' '}{batch.logsCount} registros do período {format(new Date(batch.dateFrom), 'dd/MM/yyyy')} - {format(new Date(batch.dateTo), 'dd/MM/yyyy')}
          </DialogDescription>
        </DialogHeader>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 py-2">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={entityFilter} onValueChange={(v) => setEntityFilter(v as AuditEntity | 'all')}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Entidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="INSPECTION">Vistoria</SelectItem>
              <SelectItem value="VEHICLE">Veículo</SelectItem>
              <SelectItem value="USER">Usuário</SelectItem>
              <SelectItem value="GOAL">Meta</SelectItem>
              <SelectItem value="SESSION">Sessão</SelectItem>
            </SelectContent>
          </Select>
          <Select value={actionFilter} onValueChange={(v) => setActionFilter(v as AuditAction | 'all')}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Ação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="CREATE">Criação</SelectItem>
              <SelectItem value="UPDATE">Edição</SelectItem>
              <SelectItem value="DELETE">Exclusão</SelectItem>
              <SelectItem value="STATUS_CHANGE">Status</SelectItem>
              <SelectItem value="LOGIN">Login</SelectItem>
              <SelectItem value="LOGOUT">Logout</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport} disabled={filteredLogs.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto pr-2 -mr-2">
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 mb-4">
            <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-2">
              <Archive className="h-4 w-4" />
              Estes são logs arquivados. Mostrando {filteredLogs.length} de {batch.logsCount} registros.
            </p>
          </div>
          <AuditTimeline logs={filteredLogs} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
