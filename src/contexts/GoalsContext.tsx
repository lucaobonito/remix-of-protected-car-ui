import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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

interface GoalsContextType {
  goals: GoalsConfig;
  updateGoals: (newGoals: GoalsConfig) => void;
  getGoalsForPeriod: (period: string) => PeriodGoals;
  resetToDefaults: () => void;
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

const GoalsContext = createContext<GoalsContextType | undefined>(undefined);

export function GoalsProvider({ children }: { children: ReactNode }) {
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

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
    } catch (error) {
      console.error('Error saving goals to localStorage:', error);
    }
  }, [goals]);

  const updateGoals = (newGoals: GoalsConfig) => {
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
    setGoals(defaultGoals);
  };

  return (
    <GoalsContext.Provider value={{ goals, updateGoals, getGoalsForPeriod, resetToDefaults }}>
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
