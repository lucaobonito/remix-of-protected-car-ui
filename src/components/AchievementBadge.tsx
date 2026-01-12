import { Achievement, getRarityColor, getRarityLabel } from '@/data/achievements';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  Award,
  Star,
  Trophy,
  Target,
  Zap,
  TrendingUp,
  Medal,
  Crown,
  Sparkles,
  Flame,
  CheckCircle,
  Calendar,
  Lock,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Award,
  Star,
  Trophy,
  Target,
  Zap,
  TrendingUp,
  Medal,
  Crown,
  Sparkles,
  Flame,
  CheckCircle,
  Calendar,
};

interface AchievementBadgeProps {
  achievement: Achievement;
  unlocked: boolean;
  progress?: number;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

export function AchievementBadge({
  achievement,
  unlocked,
  progress = 0,
  size = 'md',
  showTooltip = true,
}: AchievementBadgeProps) {
  const Icon = iconMap[achievement.icon] || Award;
  
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
  };

  const iconSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-10 w-10',
  };

  const badge = (
    <div
      className={cn(
        'relative flex items-center justify-center rounded-full border-2 transition-all duration-300',
        sizeClasses[size],
        unlocked
          ? cn(getRarityColor(achievement.rarity), 'shadow-lg')
          : 'bg-muted/30 border-border/50 grayscale opacity-50'
      )}
    >
      {unlocked ? (
        <Icon className={cn(iconSizeClasses[size], 'drop-shadow-sm')} />
      ) : (
        <Lock className={cn(iconSizeClasses[size], 'text-muted-foreground/50')} />
      )}
      
      {/* Glow effect for legendary */}
      {unlocked && achievement.rarity === 'legendary' && (
        <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-pulse" />
      )}
      
      {/* Progress ring for locked achievements */}
      {!unlocked && progress > 0 && size !== 'sm' && (
        <svg
          className="absolute inset-0 -rotate-90"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="hsl(var(--primary) / 0.3)"
            strokeWidth="4"
          />
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="4"
            strokeDasharray={`${progress * 2.89} 289`}
            strokeLinecap="round"
          />
        </svg>
      )}
    </div>
  );

  if (!showTooltip) return badge;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{badge}</TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <div className="space-y-1">
          <p className="font-semibold">{achievement.name}</p>
          <p className="text-xs text-muted-foreground">{achievement.description}</p>
          <div className="flex items-center justify-between pt-1">
            <span className={cn('text-xs font-medium', getRarityColor(achievement.rarity).split(' ')[0])}>
              {getRarityLabel(achievement.rarity)}
            </span>
            <span className="text-xs text-muted-foreground">{achievement.points} pts</span>
          </div>
          {!unlocked && progress > 0 && (
            <div className="pt-1">
              <Progress value={progress} className="h-1.5" />
              <p className="text-xs text-muted-foreground mt-1">{Math.round(progress)}% completo</p>
            </div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
