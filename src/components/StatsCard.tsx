import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  onClick?: () => void;
  actionLabel?: string;
  onAction?: () => void;
}

export function StatsCard({ 
  title, 
  value, 
  icon, 
  trend, 
  className,
  onClick,
  actionLabel,
  onAction,
}: StatsCardProps) {
  const isClickable = !!onClick;
  
  return (
    <div 
      className={cn(
        'relative overflow-hidden rounded-xl border border-border bg-card p-4 sm:p-6 transition-all duration-300',
        isClickable && 'cursor-pointer hover:shadow-lg hover:border-primary/50 hover:scale-[1.02]',
        !isClickable && 'hover:shadow-lg',
        className
      )}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1 sm:space-y-2 min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{title}</p>
          <p className="text-xl sm:text-3xl font-bold text-foreground">{value}</p>
          {trend && (
            <p className={cn(
              'flex items-center gap-1 text-xs sm:text-sm font-medium',
              trend.isPositive ? 'text-success' : 'text-destructive'
            )}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span className="hidden sm:inline">{Math.abs(trend.value)}% vs mês anterior</span>
              <span className="sm:hidden">{Math.abs(trend.value)}%</span>
            </p>
          )}
          {actionLabel && onAction && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onAction();
              }}
              className="gap-1 text-xs h-7 px-2 -ml-2 text-primary hover:text-primary"
            >
              {actionLabel}
              <ArrowRight className="h-3 w-3" />
            </Button>
          )}
        </div>
        <div className={cn(
          "flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform",
          isClickable && "group-hover:scale-110"
        )}>
          {icon}
        </div>
      </div>
      <div className="absolute -right-4 -top-4 h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-primary/5" />
    </div>
  );
}
