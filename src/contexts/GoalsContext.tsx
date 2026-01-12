import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface PeriodGoals {
  minInspections: number;
  targetInspections: number;
  minApprovalRate: number;
  targetApprovalRate: number;
}

export interface GoalsConfig {
  monthly: PeriodGoals;
  quarterly: PeriodGoals;
  yearly: PeriodGoals;
}

export interface GoalsHistoryEntry {
  id: string;
  timestamp: string;
  changedBy: string;
  previousGoals: GoalsConfig;
  newGoals: GoalsConfig;
  changedPeriods: ('monthly' | 'quarterly' | 'yearly')[];
  note?: string;
}

interface GoalsContextType {
  goals: GoalsConfig;
  goalsHistory: GoalsHistoryEntry[];
  updateGoals: (newGoals: GoalsConfig, note?: string) => void;
  getGoalsForPeriod: (period: string) => PeriodGoals;
  resetToDefaults: () => void;
  getGoalsHistory: () => GoalsHistoryEntry[];
  clearHistory: () => void;
  getGoalsAtDate: (date: Date) => GoalsConfig;
}

const defaultGoals: GoalsConfig = {
  monthly: {
    minInspections: 5,
    targetInspections: 8,
    minApprovalRate: 70,
    targetApprovalRate: 85,
  },
  quarterly: {
    minInspections: 15,
    targetInspections: 24,
    minApprovalRate: 70,
    targetApprovalRate: 85,
  },
  yearly: {
    minInspections: 60,
    targetInspections: 96,
    minApprovalRate: 70,
    targetApprovalRate: 85,
  },
};

const STORAGE_KEY = 'protectedcar_goals';
const HISTORY_STORAGE_KEY = 'protectedcar_goals_history';

const GoalsContext = createContext<GoalsContextType | undefined>(undefined);

// Função auxiliar para comparar metas
const findChangedPeriods = (prev: GoalsConfig, next: GoalsConfig): ('monthly' | 'quarterly' | 'yearly')[] => {
  const periods: ('monthly' | 'quarterly' | 'yearly')[] = ['monthly', 'quarterly', 'yearly'];
  return periods.filter(period => {
    const p = prev[period];
    const n = next[period];
    return p.minInspections !== n.minInspections ||
           p.targetInspections !== n.targetInspections ||
           p.minApprovalRate !== n.minApprovalRate ||
           p.targetApprovalRate !== n.targetApprovalRate;
  });
};

export function GoalsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  const [goals, setGoals] = useState<GoalsConfig>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading goals from localStorage:', error);
    }
    return defaultGoals;
  });

  const [goalsHistory, setGoalsHistory] = useState<GoalsHistoryEntry[]>(() => {
    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading goals history from localStorage:', error);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
    } catch (error) {
      console.error('Error saving goals to localStorage:', error);
    }
  }, [goals]);

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(goalsHistory));
    } catch (error) {
      console.error('Error saving goals history to localStorage:', error);
    }
  }, [goalsHistory]);

  const updateGoals = (newGoals: GoalsConfig, note?: string) => {
    const changedPeriods = findChangedPeriods(goals, newGoals);
    
    if (changedPeriods.length > 0) {
      const historyEntry: GoalsHistoryEntry = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        changedBy: user?.name || 'Admin',
        previousGoals: { ...goals },
        newGoals: { ...newGoals },
        changedPeriods,
        note,
      };
      
      setGoalsHistory(prev => [historyEntry, ...prev]);
    }
    
    setGoals(newGoals);
  };

  const getGoalsForPeriod = (period: string): PeriodGoals => {
    if (period === 'all') {
      return goals.yearly;
    } else if (['q1', 'q2', 'q3', 'q4'].includes(period)) {
      return goals.quarterly;
    }
    return goals.monthly;
  };

  const resetToDefaults = () => {
    const changedPeriods = findChangedPeriods(goals, defaultGoals);
    
    if (changedPeriods.length > 0) {
      const historyEntry: GoalsHistoryEntry = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        changedBy: user?.name || 'Admin',
        previousGoals: { ...goals },
        newGoals: { ...defaultGoals },
        changedPeriods,
        note: 'Restaurado para valores padrão',
      };
      
      setGoalsHistory(prev => [historyEntry, ...prev]);
    }
    
    setGoals(defaultGoals);
  };

  const getGoalsHistory = (): GoalsHistoryEntry[] => {
    return goalsHistory;
  };

  const clearHistory = () => {
    setGoalsHistory([]);
  };

  const getGoalsAtDate = (date: Date): GoalsConfig => {
    const targetTime = date.getTime();
    
    // Encontrar a entrada mais recente antes da data especificada
    const relevantEntries = goalsHistory
      .filter(entry => new Date(entry.timestamp).getTime() <= targetTime)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    if (relevantEntries.length > 0) {
      return relevantEntries[0].newGoals;
    }
    
    // Se não houver histórico antes da data, retorna os valores padrão
    return defaultGoals;
  };

  return (
    <GoalsContext.Provider value={{ 
      goals, 
      goalsHistory,
      updateGoals, 
      getGoalsForPeriod, 
      resetToDefaults,
      getGoalsHistory,
      clearHistory,
      getGoalsAtDate
    }}>
      {children}
    </GoalsContext.Provider>
  );
}

export function useGoals() {
  const context = useContext(GoalsContext);
  if (!context) {
    throw new Error('useGoals must be used within a GoalsProvider');
  }
  return context;
}
