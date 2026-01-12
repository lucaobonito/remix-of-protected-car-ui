import { Award, Star, Trophy, Target, Zap, TrendingUp, Medal, Crown, Sparkles, Flame, CheckCircle, Calendar } from 'lucide-react';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'milestone' | 'quality' | 'streak' | 'special';
  requirement: {
    type: 'inspections_count' | 'approval_rate' | 'perfect_rate' | 'streak' | 'monthly_goal';
    value: number;
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
}

export const achievements: Achievement[] = [
  // Milestone - Quantity achievements
  {
    id: 'first_inspection',
    name: 'Primeira Vistoria',
    description: 'Complete sua primeira vistoria',
    icon: 'Star',
    category: 'milestone',
    requirement: { type: 'inspections_count', value: 1 },
    rarity: 'common',
    points: 10,
  },
  {
    id: 'inspector_10',
    name: 'Vistoriador Dedicado',
    description: 'Complete 10 vistorias',
    icon: 'Award',
    category: 'milestone',
    requirement: { type: 'inspections_count', value: 10 },
    rarity: 'common',
    points: 25,
  },
  {
    id: 'inspector_25',
    name: 'Vistoriador Comprometido',
    description: 'Complete 25 vistorias',
    icon: 'Medal',
    category: 'milestone',
    requirement: { type: 'inspections_count', value: 25 },
    rarity: 'rare',
    points: 50,
  },
  {
    id: 'inspector_50',
    name: 'Vistoriador Experiente',
    description: 'Complete 50 vistorias',
    icon: 'Trophy',
    category: 'milestone',
    requirement: { type: 'inspections_count', value: 50 },
    rarity: 'rare',
    points: 100,
  },
  {
    id: 'inspector_100',
    name: 'Centurião',
    description: 'Complete 100 vistorias',
    icon: 'Crown',
    category: 'milestone',
    requirement: { type: 'inspections_count', value: 100 },
    rarity: 'epic',
    points: 200,
  },
  {
    id: 'inspector_500',
    name: 'Mestre Vistoriador',
    description: 'Complete 500 vistorias',
    icon: 'Sparkles',
    category: 'milestone',
    requirement: { type: 'inspections_count', value: 500 },
    rarity: 'legendary',
    points: 500,
  },

  // Quality - Approval rate achievements
  {
    id: 'quality_70',
    name: 'Bom Começo',
    description: 'Mantenha 70% de taxa de aprovação',
    icon: 'Target',
    category: 'quality',
    requirement: { type: 'approval_rate', value: 70 },
    rarity: 'common',
    points: 30,
  },
  {
    id: 'quality_80',
    name: 'Selo de Qualidade',
    description: 'Mantenha 80% de taxa de aprovação',
    icon: 'CheckCircle',
    category: 'quality',
    requirement: { type: 'approval_rate', value: 80 },
    rarity: 'rare',
    points: 75,
  },
  {
    id: 'quality_90',
    name: 'Padrão Ouro',
    description: 'Mantenha 90% de taxa de aprovação',
    icon: 'Medal',
    category: 'quality',
    requirement: { type: 'approval_rate', value: 90 },
    rarity: 'epic',
    points: 150,
  },
  {
    id: 'quality_100',
    name: 'Perfeição',
    description: 'Alcance 100% de taxa de aprovação (mín. 10 vistorias)',
    icon: 'Crown',
    category: 'quality',
    requirement: { type: 'perfect_rate', value: 100 },
    rarity: 'legendary',
    points: 300,
  },

  // Streak achievements
  {
    id: 'streak_5',
    name: 'Em Sequência',
    description: '5 aprovações consecutivas',
    icon: 'Zap',
    category: 'streak',
    requirement: { type: 'streak', value: 5 },
    rarity: 'rare',
    points: 50,
  },
  {
    id: 'streak_10',
    name: 'Imparável',
    description: '10 aprovações consecutivas',
    icon: 'Flame',
    category: 'streak',
    requirement: { type: 'streak', value: 10 },
    rarity: 'epic',
    points: 100,
  },

  // Special achievements
  {
    id: 'goal_crusher',
    name: 'Destruidor de Metas',
    description: 'Supere as metas alvo do mês',
    icon: 'TrendingUp',
    category: 'special',
    requirement: { type: 'monthly_goal', value: 1 },
    rarity: 'epic',
    points: 150,
  },
];

export const getAchievementById = (id: string): Achievement | undefined => {
  return achievements.find(a => a.id === id);
};

export const getAchievementsByCategory = (category: Achievement['category']): Achievement[] => {
  return achievements.filter(a => a.category === category);
};

export const getRarityColor = (rarity: Achievement['rarity']): string => {
  switch (rarity) {
    case 'common':
      return 'text-muted-foreground border-border bg-muted/50';
    case 'rare':
      return 'text-primary border-primary/50 bg-primary/10';
    case 'epic':
      return 'text-purple-500 border-purple-500/50 bg-purple-500/10';
    case 'legendary':
      return 'text-amber-500 border-amber-500/50 bg-amber-500/10';
    default:
      return 'text-muted-foreground border-border';
  }
};

export const getRarityLabel = (rarity: Achievement['rarity']): string => {
  switch (rarity) {
    case 'common':
      return 'Comum';
    case 'rare':
      return 'Raro';
    case 'epic':
      return 'Épico';
    case 'legendary':
      return 'Lendário';
    default:
      return rarity;
  }
};
