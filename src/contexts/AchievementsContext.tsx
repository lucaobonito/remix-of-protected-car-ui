import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Achievement, achievements, getAchievementById } from '@/data/achievements';
import { useNotifications } from '@/contexts/NotificationsContext';
import { toast } from 'sonner';

export interface UnlockedAchievement {
  achievementId: string;
  unlockedAt: Date;
  employeeId: string;
}

export interface EmployeeStats {
  total: number;
  approved: number;
  rejected: number;
  pending: number;
  approvalRate: number;
  currentStreak?: number;
  monthlyGoalsMet?: boolean;
}

interface AchievementsContextType {
  achievements: Achievement[];
  unlockedAchievements: UnlockedAchievement[];
  checkAndUnlockAchievements: (employeeId: string, stats: EmployeeStats) => Achievement[];
  getEmployeeAchievements: (employeeId: string) => UnlockedAchievement[];
  getTotalPoints: (employeeId: string) => number;
  isAchievementUnlocked: (employeeId: string, achievementId: string) => boolean;
  getProgress: (employeeId: string, achievement: Achievement, stats: EmployeeStats) => number;
}

const AchievementsContext = createContext<AchievementsContextType | undefined>(undefined);

const STORAGE_KEY = 'achievements_unlocked';

function getStoredAchievements(): UnlockedAchievement[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((a: any) => ({
        ...a,
        unlockedAt: new Date(a.unlockedAt),
      }));
    }
  } catch (e) {
    console.error('Error loading achievements:', e);
  }
  return [];
}

function saveAchievements(achievements: UnlockedAchievement[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(achievements));
  } catch (e) {
    console.error('Error saving achievements:', e);
  }
}

export function AchievementsProvider({ children }: { children: React.ReactNode }) {
  const [unlockedAchievements, setUnlockedAchievements] = useState<UnlockedAchievement[]>(getStoredAchievements);
  const { addNotification } = useNotifications();

  useEffect(() => {
    saveAchievements(unlockedAchievements);
  }, [unlockedAchievements]);

  const isAchievementUnlocked = useCallback(
    (employeeId: string, achievementId: string): boolean => {
      return unlockedAchievements.some(
        (ua) => ua.employeeId === employeeId && ua.achievementId === achievementId
      );
    },
    [unlockedAchievements]
  );

  const getProgress = useCallback(
    (employeeId: string, achievement: Achievement, stats: EmployeeStats): number => {
      const { type, value } = achievement.requirement;
      
      switch (type) {
        case 'inspections_count':
          return Math.min((stats.total / value) * 100, 100);
        case 'approval_rate':
          if (stats.total < 5) return 0; // Minimum inspections for rate achievements
          return Math.min((stats.approvalRate / value) * 100, 100);
        case 'perfect_rate':
          if (stats.total < 10) return (stats.total / 10) * 50; // 50% for count, 50% for rate
          return stats.approvalRate === 100 ? 100 : (stats.approvalRate / value) * 100;
        case 'streak':
          return Math.min(((stats.currentStreak || 0) / value) * 100, 100);
        case 'monthly_goal':
          return stats.monthlyGoalsMet ? 100 : 0;
        default:
          return 0;
      }
    },
    []
  );

  const checkAndUnlockAchievements = useCallback(
    (employeeId: string, stats: EmployeeStats): Achievement[] => {
      const newlyUnlocked: Achievement[] = [];

      for (const achievement of achievements) {
        if (isAchievementUnlocked(employeeId, achievement.id)) {
          continue;
        }

        const { type, value } = achievement.requirement;
        let shouldUnlock = false;

        switch (type) {
          case 'inspections_count':
            shouldUnlock = stats.total >= value;
            break;
          case 'approval_rate':
            shouldUnlock = stats.total >= 5 && stats.approvalRate >= value;
            break;
          case 'perfect_rate':
            shouldUnlock = stats.total >= 10 && stats.approvalRate === 100;
            break;
          case 'streak':
            shouldUnlock = (stats.currentStreak || 0) >= value;
            break;
          case 'monthly_goal':
            shouldUnlock = stats.monthlyGoalsMet === true;
            break;
        }

        if (shouldUnlock) {
          newlyUnlocked.push(achievement);
          
          const newUnlocked: UnlockedAchievement = {
            achievementId: achievement.id,
            unlockedAt: new Date(),
            employeeId,
          };

          setUnlockedAchievements((prev) => [...prev, newUnlocked]);

          // Add notification
          addNotification({
            title: '🏆 Nova Conquista Desbloqueada!',
            message: `Você desbloqueou "${achievement.name}" - ${achievement.description}`,
            type: 'success',
            link: '/dashboard',
          });

          // Show toast
          toast.success(`🎖️ ${achievement.name}`, {
            description: achievement.description,
            duration: 5000,
          });
        }
      }

      return newlyUnlocked;
    },
    [isAchievementUnlocked, addNotification]
  );

  const getEmployeeAchievements = useCallback(
    (employeeId: string): UnlockedAchievement[] => {
      return unlockedAchievements.filter((ua) => ua.employeeId === employeeId);
    },
    [unlockedAchievements]
  );

  const getTotalPoints = useCallback(
    (employeeId: string): number => {
      const employeeUnlocked = getEmployeeAchievements(employeeId);
      return employeeUnlocked.reduce((total, ua) => {
        const achievement = getAchievementById(ua.achievementId);
        return total + (achievement?.points || 0);
      }, 0);
    },
    [getEmployeeAchievements]
  );

  return (
    <AchievementsContext.Provider
      value={{
        achievements,
        unlockedAchievements,
        checkAndUnlockAchievements,
        getEmployeeAchievements,
        getTotalPoints,
        isAchievementUnlocked,
        getProgress,
      }}
    >
      {children}
    </AchievementsContext.Provider>
  );
}

export function useAchievements() {
  const context = useContext(AchievementsContext);
  if (!context) {
    throw new Error('useAchievements must be used within an AchievementsProvider');
  }
  return context;
}
