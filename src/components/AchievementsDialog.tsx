import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AchievementBadge } from '@/components/AchievementBadge';
import { useAchievements, EmployeeStats } from '@/contexts/AchievementsContext';
import { achievements, getAchievementsByCategory, getRarityColor, getRarityLabel } from '@/data/achievements';
import { Trophy, Target, Zap, Sparkles, ChevronRight, Lock, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AchievementsDialogProps {
  employeeId: string;
  stats: EmployeeStats;
  trigger?: React.ReactNode;
}

const categoryConfig = {
  milestone: { label: 'Marcos de Quantidade', icon: Trophy, color: 'text-primary' },
  quality: { label: 'Qualidade', icon: Target, color: 'text-success' },
  streak: { label: 'Sequências', icon: Zap, color: 'text-warning' },
  special: { label: 'Especiais', icon: Sparkles, color: 'text-purple-500' },
};

export function AchievementsDialog({ employeeId, stats, trigger }: AchievementsDialogProps) {
  const { getEmployeeAchievements, getTotalPoints, isAchievementUnlocked, getProgress } = useAchievements();
  
  const employeeAchievements = getEmployeeAchievements(employeeId);
  const totalPoints = getTotalPoints(employeeId);
  const unlockedCount = employeeAchievements.length;
  const totalAchievements = achievements.length;

  const defaultTrigger = (
    <Button variant="ghost" size="sm" className="gap-1 text-primary">
      Ver Todas <ChevronRight className="h-4 w-4" />
    </Button>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Trophy className="h-6 w-6 text-primary" />
            Conquistas
          </DialogTitle>
        </DialogHeader>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/50 border">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{totalPoints}</p>
            <p className="text-sm text-muted-foreground">Pontos Totais</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">
              {unlockedCount}<span className="text-muted-foreground">/{totalAchievements}</span>
            </p>
            <p className="text-sm text-muted-foreground">Desbloqueadas</p>
          </div>
        </div>

        <ScrollArea className="h-[50vh] pr-4">
          <div className="space-y-6">
            {(Object.keys(categoryConfig) as Array<keyof typeof categoryConfig>).map((category) => {
              const config = categoryConfig[category];
              const categoryAchievements = getAchievementsByCategory(category);
              const Icon = config.icon;

              return (
                <div key={category} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Icon className={cn('h-5 w-5', config.color)} />
                    <h3 className="font-semibold text-foreground">{config.label}</h3>
                    <Badge variant="secondary" className="ml-auto">
                      {categoryAchievements.filter(a => isAchievementUnlocked(employeeId, a.id)).length}/
                      {categoryAchievements.length}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {categoryAchievements.map((achievement) => {
                      const unlocked = isAchievementUnlocked(employeeId, achievement.id);
                      const progress = getProgress(employeeId, achievement, stats);
                      const unlockedData = employeeAchievements.find(
                        (ua) => ua.achievementId === achievement.id
                      );

                      return (
                        <div
                          key={achievement.id}
                          className={cn(
                            'flex items-center gap-3 p-3 rounded-lg border transition-all',
                            unlocked
                              ? 'bg-card border-border'
                              : 'bg-muted/30 border-border/50'
                          )}
                        >
                          <AchievementBadge
                            achievement={achievement}
                            unlocked={unlocked}
                            progress={progress}
                            size="sm"
                            showTooltip={false}
                          />

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className={cn(
                                'font-medium truncate',
                                unlocked ? 'text-foreground' : 'text-muted-foreground'
                              )}>
                                {achievement.name}
                              </p>
                              <Badge
                                variant="outline"
                                className={cn(
                                  'text-xs shrink-0',
                                  getRarityColor(achievement.rarity)
                                )}
                              >
                                {getRarityLabel(achievement.rarity)}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {achievement.description}
                            </p>
                            {!unlocked && progress > 0 && (
                              <div className="mt-1.5">
                                <Progress value={progress} className="h-1" />
                              </div>
                            )}
                          </div>

                          <div className="text-right shrink-0">
                            {unlocked ? (
                              <div className="flex flex-col items-end">
                                <CheckCircle className="h-5 w-5 text-success mb-1" />
                                <span className="text-xs text-muted-foreground">
                                  {unlockedData
                                    ? new Date(unlockedData.unlockedAt).toLocaleDateString('pt-BR')
                                    : ''}
                                </span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-end">
                                <Lock className="h-5 w-5 text-muted-foreground/50 mb-1" />
                                <span className="text-xs text-muted-foreground">
                                  {Math.round(progress)}%
                                </span>
                              </div>
                            )}
                            <span className="text-xs font-medium text-primary">
                              {achievement.points} pts
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
