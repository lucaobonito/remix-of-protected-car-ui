import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAudit } from '@/contexts/AuditContext';
import { AuditTimeline } from './AuditTimeline';
import { Download, History } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EmployeeActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

export function EmployeeActivityDialog({ open, onOpenChange, userId }: EmployeeActivityDialogProps) {
  const { getLogsByUser } = useAudit();
  const userLogs = getLogsByUser(userId);

  const handleExport = () => {
    if (userLogs.length === 0) return;
    
    const csvContent = [
      ['Data', 'Hora', 'Ação', 'Entidade', 'Descrição'].join(','),
      ...userLogs.map(log => [
        format(new Date(log.timestamp), 'dd/MM/yyyy', { locale: ptBR }),
        format(new Date(log.timestamp), 'HH:mm', { locale: ptBR }),
        log.action,
        log.entity,
        `"${log.entityDescription.replace(/"/g, '""')}"`,
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `minhas-atividades-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <div className="flex items-center justify-between gap-4">
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Histórico de Atividades
            </DialogTitle>
            {userLogs.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={handleExport}
              >
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            )}
          </div>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          {userLogs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>Nenhuma atividade registrada.</p>
              <p className="text-sm mt-1">Suas ações no sistema aparecerão aqui.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                {userLogs.length} atividade{userLogs.length !== 1 ? 's' : ''} registrada{userLogs.length !== 1 ? 's' : ''}
              </p>
              <AuditTimeline 
                logs={userLogs} 
                showEntity={true}
                personalizedView
              />
            </>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
