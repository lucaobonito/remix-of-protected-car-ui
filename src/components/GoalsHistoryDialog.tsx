import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  History, 
  ArrowUp, 
  ArrowDown, 
  Minus, 
  Calendar, 
  User, 
  FileSpreadsheet, 
  Trash2,
  AlertCircle,
  Target,
  Award
} from 'lucide-react';
import { useGoals, GoalsHistoryEntry, GoalsConfig } from '@/contexts/GoalsContext';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const periodLabels: Record<string, string> = {
  monthly: 'Mensal',
  quarterly: 'Trimestral',
  yearly: 'Anual',
};

interface GoalChangeProps {
  label: string;
  previousValue: number;
  newValue: number;
  suffix?: string;
  icon: React.ReactNode;
}

function GoalChange({ label, previousValue, newValue, suffix = '', icon }: GoalChangeProps) {
  const diff = newValue - previousValue;
  const isIncrease = diff > 0;
  const isDecrease = diff < 0;
  
  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-2 text-sm">
        {icon}
        <span className="text-muted-foreground">{label}:</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">{previousValue}{suffix}</span>
        {isIncrease ? (
          <ArrowUp className="h-3.5 w-3.5 text-success" />
        ) : isDecrease ? (
          <ArrowDown className="h-3.5 w-3.5 text-destructive" />
        ) : (
          <Minus className="h-3.5 w-3.5 text-muted-foreground" />
        )}
        <span className={isIncrease ? 'text-success font-medium' : isDecrease ? 'text-destructive font-medium' : ''}>
          {newValue}{suffix}
        </span>
        {diff !== 0 && (
          <Badge variant={isIncrease ? 'default' : 'destructive'} className="text-xs px-1.5 py-0">
            {isIncrease ? '+' : ''}{diff}{suffix}
          </Badge>
        )}
      </div>
    </div>
  );
}

interface PeriodChangesProps {
  period: 'monthly' | 'quarterly' | 'yearly';
  previousGoals: GoalsConfig;
  newGoals: GoalsConfig;
}

function PeriodChanges({ period, previousGoals, newGoals }: PeriodChangesProps) {
  const prev = previousGoals[period];
  const next = newGoals[period];
  
  return (
    <div className="space-y-1">
      <h5 className="text-sm font-medium text-foreground mb-2">{periodLabels[period]}</h5>
      <GoalChange 
        label="Mín. Vistorias" 
        previousValue={prev.minInspections} 
        newValue={next.minInspections}
        icon={<Target className="h-3.5 w-3.5 text-warning" />}
      />
      <GoalChange 
        label="Meta Vistorias" 
        previousValue={prev.targetInspections} 
        newValue={next.targetInspections}
        icon={<Target className="h-3.5 w-3.5 text-success" />}
      />
      <GoalChange 
        label="Mín. Aprovação" 
        previousValue={prev.minApprovalRate} 
        newValue={next.minApprovalRate}
        suffix="%"
        icon={<Award className="h-3.5 w-3.5 text-warning" />}
      />
      <GoalChange 
        label="Meta Aprovação" 
        previousValue={prev.targetApprovalRate} 
        newValue={next.targetApprovalRate}
        suffix="%"
        icon={<Award className="h-3.5 w-3.5 text-success" />}
      />
    </div>
  );
}

interface HistoryEntryCardProps {
  entry: GoalsHistoryEntry;
  isFirst: boolean;
}

function HistoryEntryCard({ entry, isFirst }: HistoryEntryCardProps) {
  const date = new Date(entry.timestamp);
  
  return (
    <Card className={isFirst ? 'border-primary/50 bg-primary/5' : ''}>
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {date.toLocaleDateString('pt-BR', { 
                  day: '2-digit', 
                  month: 'short', 
                  year: 'numeric' 
                })}
              </span>
              <span className="text-muted-foreground">
                às {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              <span>{entry.changedBy}</span>
            </div>
          </div>
          <div className="flex gap-1.5">
            {entry.changedPeriods.map(period => (
              <Badge key={period} variant="outline" className="text-xs">
                {periodLabels[period]}
              </Badge>
            ))}
          </div>
        </div>
        
        {entry.note && (
          <div className="bg-muted/50 rounded-md p-2 text-sm text-muted-foreground italic">
            "{entry.note}"
          </div>
        )}
        
        <Separator />
        
        <div className="grid gap-4 md:grid-cols-3">
          {entry.changedPeriods.map(period => (
            <PeriodChanges 
              key={period}
              period={period}
              previousGoals={entry.previousGoals}
              newGoals={entry.newGoals}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function GoalsHistoryDialog() {
  const { goalsHistory, clearHistory } = useGoals();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [periodFilter, setPeriodFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  const filteredHistory = useMemo(() => {
    let filtered = [...goalsHistory];
    
    // Filtrar por período alterado
    if (periodFilter !== 'all') {
      filtered = filtered.filter(entry => 
        entry.changedPeriods.includes(periodFilter as 'monthly' | 'quarterly' | 'yearly')
      );
    }
    
    // Filtrar por data
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case '7days':
          filterDate.setDate(now.getDate() - 7);
          break;
        case '30days':
          filterDate.setDate(now.getDate() - 30);
          break;
        case '90days':
          filterDate.setDate(now.getDate() - 90);
          break;
      }
      
      filtered = filtered.filter(entry => 
        new Date(entry.timestamp) >= filterDate
      );
    }
    
    return filtered;
  }, [goalsHistory, periodFilter, dateFilter]);

  const handleExportHistory = () => {
    if (goalsHistory.length === 0) {
      toast({
        title: "Sem dados",
        description: "Não há histórico para exportar.",
        variant: "destructive"
      });
      return;
    }
    
    const wb = XLSX.utils.book_new();
    
    const data: (string | number)[][] = [
      ['HISTÓRICO DE ALTERAÇÕES DE METAS'],
      [],
      ['Data', 'Hora', 'Alterado Por', 'Períodos Alterados', 'Nota'],
      ...goalsHistory.map(entry => {
        const date = new Date(entry.timestamp);
        return [
          date.toLocaleDateString('pt-BR'),
          date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          entry.changedBy,
          entry.changedPeriods.map(p => periodLabels[p]).join(', '),
          entry.note || ''
        ];
      }),
      [],
      ['DETALHES DAS ALTERAÇÕES'],
      [],
      ['Data', 'Período', 'Mín. Vistorias (Antes)', 'Mín. Vistorias (Depois)', 'Meta Vistorias (Antes)', 'Meta Vistorias (Depois)', 'Mín. Aprovação (Antes)', 'Mín. Aprovação (Depois)', 'Meta Aprovação (Antes)', 'Meta Aprovação (Depois)'],
    ];
    
    goalsHistory.forEach(entry => {
      const date = new Date(entry.timestamp).toLocaleDateString('pt-BR');
      entry.changedPeriods.forEach(period => {
        const prev = entry.previousGoals[period];
        const next = entry.newGoals[period];
        data.push([
          date,
          periodLabels[period],
          prev.minInspections,
          next.minInspections,
          prev.targetInspections,
          next.targetInspections,
          prev.minApprovalRate + '%',
          next.minApprovalRate + '%',
          prev.targetApprovalRate + '%',
          next.targetApprovalRate + '%'
        ]);
      });
    });
    
    const ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = [
      { wch: 12 }, { wch: 8 }, { wch: 20 }, { wch: 25 }, { wch: 40 },
      { wch: 20 }, { wch: 22 }, { wch: 22 }, { wch: 22 }, { wch: 22 }
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, 'Histórico de Metas');
    XLSX.writeFile(wb, `historico-metas-${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast({
      title: "Exportado com sucesso",
      description: "O histórico foi exportado para Excel."
    });
  };

  const handleClearHistory = () => {
    clearHistory();
    toast({
      title: "Histórico limpo",
      description: "Todo o histórico de alterações foi removido."
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <History className="h-4 w-4" />
          Ver Histórico
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Histórico de Alterações de Metas
          </DialogTitle>
          <DialogDescription>
            Visualize todas as alterações feitas nas metas ao longo do tempo.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col sm:flex-row justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos períodos</SelectItem>
                <SelectItem value="monthly">Mensal</SelectItem>
                <SelectItem value="quarterly">Trimestral</SelectItem>
                <SelectItem value="yearly">Anual</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Data" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo período</SelectItem>
                <SelectItem value="7days">Últimos 7 dias</SelectItem>
                <SelectItem value="30days">Últimos 30 dias</SelectItem>
                <SelectItem value="90days">Últimos 90 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExportHistory}>
              <FileSpreadsheet className="h-4 w-4" />
              Exportar
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                  Limpar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Limpar histórico?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Todo o histórico de alterações de metas será permanentemente removido.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearHistory} className="bg-destructive hover:bg-destructive/90">
                    Limpar histórico
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <ScrollArea className="h-[400px] pr-4">
          {filteredHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h4 className="text-lg font-medium text-muted-foreground">Nenhum histórico encontrado</h4>
              <p className="text-sm text-muted-foreground/70 max-w-sm mt-1">
                {goalsHistory.length === 0 
                  ? "As alterações de metas serão registradas aqui automaticamente."
                  : "Tente ajustar os filtros para ver mais resultados."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHistory.map((entry, index) => (
                <HistoryEntryCard 
                  key={entry.id} 
                  entry={entry} 
                  isFirst={index === 0}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="text-xs text-muted-foreground text-center">
          {filteredHistory.length} de {goalsHistory.length} alterações
        </div>
      </DialogContent>
    </Dialog>
  );
}