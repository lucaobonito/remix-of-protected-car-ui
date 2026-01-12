import { useEffect, useRef } from 'react';
import { useAchievements, EmployeeStats } from '@/contexts/AchievementsContext';

export function useAchievementCheck(employeeId: string, stats: EmployeeStats) {
  const { checkAndUnlockAchievements } = useAchievements();
  const hasCheckedRef = useRef(false);
  const lastStatsRef = useRef<string>('');

  useEffect(() => {
    if (!employeeId || !stats) return;

    // Create a hash of current stats to detect real changes
    const statsHash = JSON.stringify({
      total: stats.total,
      approved: stats.approved,
      approvalRate: stats.approvalRate,
      currentStreak: stats.currentStreak,
      monthlyGoalsMet: stats.monthlyGoalsMet,
    });

    // Only check if stats have actually changed
    if (statsHash === lastStatsRef.current) return;
    lastStatsRef.current = statsHash;

    // Check for new achievements
    checkAndUnlockAchievements(employeeId, stats);
  }, [employeeId, stats, checkAndUnlockAchievements]);
}
