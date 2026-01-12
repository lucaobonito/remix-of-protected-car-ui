import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface QuickAction {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost';
}

interface QuickActionsBarProps {
  title: string;
  subtitle?: string;
  actions: QuickAction[];
  className?: string;
}

export function QuickActionsBar({ title, subtitle, actions, className }: QuickActionsBarProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", className)}>
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">{title}</h2>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant || (index === 0 ? 'default' : 'outline')}
            onClick={action.onClick}
            className="gap-2"
            size="sm"
          >
            {action.icon}
            <span className="hidden sm:inline">{action.label}</span>
            <span className="sm:hidden">{action.label.split(' ').slice(-1)[0]}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
