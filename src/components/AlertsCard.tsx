import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AlertItem {
  type: 'warning' | 'danger' | 'success' | 'info';
  icon?: ReactNode;
  message: string;
  count?: number;
  actionLabel: string;
  onClick: () => void;
}

interface AlertsCardProps {
  title?: string;
  alerts: AlertItem[];
  className?: string;
}

const alertStyles = {
  warning: 'bg-warning/10 text-warning border-warning/20',
  danger: 'bg-destructive/10 text-destructive border-destructive/20',
  success: 'bg-success/10 text-success border-success/20',
  info: 'bg-primary/10 text-primary border-primary/20',
};

const dotStyles = {
  warning: 'bg-warning',
  danger: 'bg-destructive',
  success: 'bg-success',
  info: 'bg-primary',
};

export function AlertsCard({ title = "Atenção Necessária", alerts, className }: AlertsCardProps) {
  if (alerts.length === 0) return null;

  return (
    <Card className={cn("border-warning/20", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {alerts.map((alert, index) => (
          <div
            key={index}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg border transition-all hover:shadow-sm",
              alertStyles[alert.type]
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={cn("h-2 w-2 rounded-full shrink-0", dotStyles[alert.type])} />
              {alert.icon && <span className="shrink-0">{alert.icon}</span>}
              <span className="text-sm font-medium text-foreground truncate">
                {alert.count !== undefined && (
                  <span className="font-bold">{alert.count} </span>
                )}
                {alert.message}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={alert.onClick}
              className="shrink-0 gap-1 text-xs hover:bg-background/50"
            >
              {alert.actionLabel}
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
