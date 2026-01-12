import { AuditLogEntry } from '@/types/audit';
import { AuditActionBadge, AuditEntityBadge } from './AuditBadge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw, 
  LogIn, 
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible';

interface AuditTimelineProps {
  logs: AuditLogEntry[];
  showEntity?: boolean;
  maxItems?: number;
}

const actionIcons = {
  CREATE: Plus,
  UPDATE: Edit,
  DELETE: Trash2,
  STATUS_CHANGE: RefreshCw,
  LOGIN: LogIn,
  LOGOUT: LogOut,
};

const actionColors = {
  CREATE: 'bg-green-500',
  UPDATE: 'bg-amber-500',
  DELETE: 'bg-red-500',
  STATUS_CHANGE: 'bg-blue-500',
  LOGIN: 'bg-slate-500',
  LOGOUT: 'bg-slate-400',
};

export function AuditTimeline({ logs, showEntity = true, maxItems }: AuditTimelineProps) {
  const displayLogs = maxItems ? logs.slice(0, maxItems) : logs;

  if (displayLogs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum registro de auditoria encontrado.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {displayLogs.map((log, index) => (
        <AuditTimelineItem 
          key={log.id} 
          log={log} 
          showEntity={showEntity}
          isLast={index === displayLogs.length - 1}
        />
      ))}
      {maxItems && logs.length > maxItems && (
        <p className="text-sm text-muted-foreground text-center">
          + {logs.length - maxItems} eventos anteriores
        </p>
      )}
    </div>
  );
}

interface AuditTimelineItemProps {
  log: AuditLogEntry;
  showEntity: boolean;
  isLast: boolean;
}

function AuditTimelineItem({ log, showEntity, isLast }: AuditTimelineItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = actionIcons[log.action];
  const colorClass = actionColors[log.action];
  const hasChanges = log.changes && log.changes.length > 0;

  return (
    <div className="flex gap-4">
      {/* Timeline indicator */}
      <div className="flex flex-col items-center">
        <div className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full text-white",
          colorClass
        )}>
          <Icon className="h-4 w-4" />
        </div>
        {!isLast && (
          <div className="w-0.5 flex-1 bg-border mt-2" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-4">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-foreground">{log.userName}</span>
                <AuditActionBadge action={log.action} />
                {showEntity && <AuditEntityBadge entity={log.entity} />}
              </div>
              <p className="text-sm text-muted-foreground">
                {log.entityDescription}
              </p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(log.timestamp), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>

            {hasChanges && (
              <CollapsibleTrigger className="p-1 hover:bg-muted rounded">
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform",
                  isOpen && "rotate-180"
                )} />
              </CollapsibleTrigger>
            )}
          </div>

          {hasChanges && (
            <CollapsibleContent className="mt-3">
              <div className="rounded-lg border bg-muted/50 p-3 space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase">Alterações</p>
                {log.changes!.map((change, idx) => (
                  <div key={idx} className="text-sm">
                    <span className="font-medium">{change.field}:</span>
                    <span className="text-destructive line-through ml-2">{change.previousValue}</span>
                    <span className="mx-2">→</span>
                    <span className="text-green-600">{change.newValue}</span>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          )}
        </Collapsible>
      </div>
    </div>
  );
}
