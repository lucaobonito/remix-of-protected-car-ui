import { ReactNode } from 'react';
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
}

export function StatsCard({ title, value, icon, trend, className }: StatsCardProps) {
  return (
    <div className={cn(
      'relative overflow-hidden rounded-xl border border-border bg-card p-4 sm:p-6 transition-all duration-300 hover:shadow-lg',
      className
    )}>
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
        </div>
        <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
      </div>
      <div className="absolute -right-4 -top-4 h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-primary/5" />
    </div>
  );
}
