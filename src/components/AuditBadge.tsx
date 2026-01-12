import { Badge } from '@/components/ui/badge';
import { AuditAction, AuditEntity } from '@/types/audit';
import { 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw, 
  LogIn, 
  LogOut,
  Car,
  ClipboardCheck,
  Users,
  Target,
  Key
} from 'lucide-react';

interface AuditActionBadgeProps {
  action: AuditAction;
}

export function AuditActionBadge({ action }: AuditActionBadgeProps) {
  const config = {
    CREATE: { label: 'Criação', variant: 'success' as const, icon: Plus },
    UPDATE: { label: 'Edição', variant: 'warning' as const, icon: Edit },
    DELETE: { label: 'Exclusão', variant: 'destructive' as const, icon: Trash2 },
    STATUS_CHANGE: { label: 'Alteração de Status', variant: 'default' as const, icon: RefreshCw },
    LOGIN: { label: 'Login', variant: 'secondary' as const, icon: LogIn },
    LOGOUT: { label: 'Logout', variant: 'muted' as const, icon: LogOut },
  };

  const { label, variant, icon: Icon } = config[action];

  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}

interface AuditEntityBadgeProps {
  entity: AuditEntity;
}

export function AuditEntityBadge({ entity }: AuditEntityBadgeProps) {
  const config = {
    VEHICLE: { label: 'Veículo', icon: Car },
    INSPECTION: { label: 'Vistoria', icon: ClipboardCheck },
    USER: { label: 'Usuário', icon: Users },
    GOAL: { label: 'Meta', icon: Target },
    SESSION: { label: 'Sessão', icon: Key },
  };

  const { label, icon: Icon } = config[entity];

  return (
    <Badge variant="outline" className="gap-1">
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}
