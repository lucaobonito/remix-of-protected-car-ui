import { useEffect, useRef } from 'react';
import { useGoals } from '@/contexts/GoalsContext';
import { useNotifications } from '@/contexts/NotificationsContext';

interface EmployeeMonthlyStats {
  total: number;
  approved: number;
  rejected: number;
  approvalRate: number;
}

interface AlertsState {
  minInspections: boolean;
  targetInspections: boolean;
  minApprovalRate: boolean;
  targetApprovalRate: boolean;
}

const getStorageKey = (userId: string): string => {
  const now = new Date();
  return `goal_alerts_${userId}_${now.getFullYear()}_${now.getMonth() + 1}`;
};

const getAlertsState = (userId: string): AlertsState => {
  try {
    const stored = localStorage.getItem(getStorageKey(userId));
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading alerts state:', error);
  }
  return {
    minInspections: false,
    targetInspections: false,
    minApprovalRate: false,
    targetApprovalRate: false,
  };
};

const saveAlertsState = (userId: string, state: AlertsState): void => {
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(state));
  } catch (error) {
    console.error('Error saving alerts state:', error);
  }
};

export function useGoalAchievementAlert(
  userId: string,
  stats: EmployeeMonthlyStats
) {
  const { goals } = useGoals();
  const { addNotification } = useNotifications();
  const hasChecked = useRef(false);

  useEffect(() => {
    // Evitar múltiplas verificações na mesma renderização
    if (hasChecked.current || !userId) return;
    hasChecked.current = true;

    const monthlyGoals = goals.monthly;
    const alertsState = getAlertsState(userId);
    let updated = false;

    // Verificar meta mínima de vistorias
    if (!alertsState.minInspections && stats.total >= monthlyGoals.minInspections) {
      addNotification({
        title: '🎯 Meta de Vistorias Atingida!',
        message: `Parabéns! Você completou ${stats.total} vistorias este mês, atingindo a meta mínima de ${monthlyGoals.minInspections}.`,
        type: 'success',
        link: '/rankings',
      });
      alertsState.minInspections = true;
      updated = true;
    }

    // Verificar meta alvo de vistorias (superou)
    if (!alertsState.targetInspections && stats.total >= monthlyGoals.targetInspections) {
      addNotification({
        title: '🏆 Meta de Vistorias Superada!',
        message: `Incrível! Você completou ${stats.total} vistorias, superando a meta de ${monthlyGoals.targetInspections}!`,
        type: 'success',
        link: '/rankings',
      });
      alertsState.targetInspections = true;
      updated = true;
    }

    // Verificar meta mínima de taxa de aprovação (apenas se tiver vistorias)
    if (!alertsState.minApprovalRate && stats.total > 0 && stats.approvalRate >= monthlyGoals.minApprovalRate) {
      addNotification({
        title: '✅ Taxa de Aprovação no Alvo!',
        message: `Excelente! Sua taxa de aprovação está em ${stats.approvalRate.toFixed(0)}%, acima do mínimo de ${monthlyGoals.minApprovalRate}%.`,
        type: 'success',
        link: '/rankings',
      });
      alertsState.minApprovalRate = true;
      updated = true;
    }

    // Verificar meta alvo de taxa de aprovação (superou)
    if (!alertsState.targetApprovalRate && stats.total > 0 && stats.approvalRate >= monthlyGoals.targetApprovalRate) {
      addNotification({
        title: '⭐ Taxa de Aprovação Excepcional!',
        message: `Fantástico! Sua taxa de aprovação de ${stats.approvalRate.toFixed(0)}% superou a meta de ${monthlyGoals.targetApprovalRate}%!`,
        type: 'success',
        link: '/rankings',
      });
      alertsState.targetApprovalRate = true;
      updated = true;
    }

    if (updated) {
      saveAlertsState(userId, alertsState);
    }
  }, [userId, stats, goals, addNotification]);
}
