import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAudit } from '@/contexts/AuditContext';
import { Settings, Archive, Trash2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, subDays } from 'date-fns';
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

export function AuditRetentionSettings() {
  const { 
    logs, 
    retentionConfig, 
    updateRetentionConfig, 
    archiveOldLogs,
    getLogsToArchiveCount
  } = useAudit();
  const { toast } = useToast();
  const [isArchiveConfirmOpen, setIsArchiveConfirmOpen] = useState(false);
  const [localConfig, setLocalConfig] = useState(retentionConfig);

  const logsToArchive = getLogsToArchiveCount();
  const cutoffDate = subDays(new Date(), localConfig.retentionDays);

  const handleSave = () => {
    updateRetentionConfig(localConfig);
    toast({
      title: "Configurações salvas",
      description: "A política de retenção foi atualizada."
    });
  };

  const handleArchiveNow = () => {
    const archivedCount = archiveOldLogs();
    setIsArchiveConfirmOpen(false);
    if (archivedCount > 0) {
      toast({
        title: "Arquivamento concluído",
        description: `${archivedCount} registros foram arquivados.`
      });
    } else {
      toast({
        title: "Nada para arquivar",
        description: "Não há logs antigos para arquivar no momento."
      });
    }
  };

  const hasChanges = JSON.stringify(localConfig) !== JSON.stringify(retentionConfig);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Política de Retenção</CardTitle>
          </div>
          <CardDescription>
            Configure por quanto tempo os logs permanecem ativos antes de serem arquivados.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Retention Days */}
          <div className="space-y-2">
            <Label>Manter logs ativos por</Label>
            <Select 
              value={localConfig.retentionDays.toString()} 
              onValueChange={(v) => setLocalConfig(prev => ({ ...prev, retentionDays: parseInt(v) }))}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 dias</SelectItem>
                <SelectItem value="15">15 dias</SelectItem>
                <SelectItem value="30">30 dias</SelectItem>
                <SelectItem value="60">60 dias</SelectItem>
                <SelectItem value="90">90 dias</SelectItem>
                <SelectItem value="180">180 dias</SelectItem>
                <SelectItem value="365">365 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Auto Archive Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Arquivar automaticamente</Label>
              <p className="text-sm text-muted-foreground">
                Logs antigos serão arquivados ao acessar o sistema
              </p>
            </div>
            <Switch
              checked={localConfig.archiveEnabled}
              onCheckedChange={(checked) => setLocalConfig(prev => ({ ...prev, archiveEnabled: checked }))}
            />
          </div>

          {/* Auto Delete Archives */}
          <div className="space-y-2">
            <Label>Excluir arquivos após</Label>
            <Select 
              value={localConfig.autoDeleteArchiveAfterDays.toString()} 
              onValueChange={(v) => setLocalConfig(prev => ({ ...prev, autoDeleteArchiveAfterDays: parseInt(v) }))}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Nunca excluir</SelectItem>
                <SelectItem value="90">90 dias</SelectItem>
                <SelectItem value="180">180 dias</SelectItem>
                <SelectItem value="365">1 ano</SelectItem>
                <SelectItem value="730">2 anos</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Arquivos mais antigos que este período serão excluídos automaticamente.
            </p>
          </div>

          {/* Archive Preview */}
          {logsToArchive > 0 && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                  Próximo arquivamento: {logsToArchive} logs
                </p>
                <p className="text-xs text-muted-foreground">
                  Logs anteriores a {format(cutoffDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} serão arquivados.
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button 
              variant="outline" 
              onClick={() => setIsArchiveConfirmOpen(true)}
              disabled={logsToArchive === 0}
            >
              <Archive className="h-4 w-4 mr-2" />
              Arquivar Agora ({logsToArchive})
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges}>
              Salvar Configurações
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={isArchiveConfirmOpen} onOpenChange={setIsArchiveConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Arquivar Logs Antigos</AlertDialogTitle>
            <AlertDialogDescription>
              {logsToArchive} logs anteriores a {format(cutoffDate, "dd/MM/yyyy")} serão movidos para o arquivo.
              Os logs arquivados ainda poderão ser consultados, mas não aparecerão na timeline principal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchiveNow}>
              <Archive className="h-4 w-4 mr-2" />
              Arquivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
