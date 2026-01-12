import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings2, Target, Award, RotateCcw, Save, Info } from 'lucide-react';
import { useGoals, GoalsConfig, PeriodGoals } from '@/contexts/GoalsContext';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface GoalInputProps {
  label: string;
  description: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  suffix?: string;
  icon: React.ReactNode;
}

function GoalInput({ label, description, value, onChange, min = 0, max = 1000, suffix, icon }: GoalInputProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {icon}
        <Label className="text-sm font-medium">{label}</Label>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs text-xs">{description}</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={value}
          onChange={(e) => {
            const val = parseInt(e.target.value) || 0;
            onChange(Math.max(min, Math.min(max, val)));
          }}
          min={min}
          max={max}
          className="w-24"
        />
        {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
      </div>
    </div>
  );
}

interface PeriodGoalsFormProps {
  title: string;
  description: string;
  goals: PeriodGoals;
  onChange: (goals: PeriodGoals) => void;
}

function PeriodGoalsForm({ title, description, goals, onChange }: PeriodGoalsFormProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <GoalInput
            label="Mínimo Vistorias"
            description="Número mínimo de vistorias para o período. Abaixo disso, o vistoriador fica em alerta."
            value={goals.minInspections}
            onChange={(val) => onChange({ ...goals, minInspections: val })}
            min={1}
            max={500}
            icon={<Target className="h-4 w-4 text-warning" />}
          />
          <GoalInput
            label="Meta Vistorias"
            description="Meta ideal de vistorias para o período. Atingir isso indica bom desempenho."
            value={goals.targetInspections}
            onChange={(val) => onChange({ ...goals, targetInspections: val })}
            min={1}
            max={500}
            icon={<Target className="h-4 w-4 text-success" />}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <GoalInput
            label="Mínimo Aprovação"
            description="Taxa mínima de aprovação aceitável. Abaixo disso, indica problemas de qualidade."
            value={goals.minApprovalRate}
            onChange={(val) => onChange({ ...goals, minApprovalRate: val })}
            min={0}
            max={100}
            suffix="%"
            icon={<Award className="h-4 w-4 text-warning" />}
          />
          <GoalInput
            label="Meta Aprovação"
            description="Meta ideal de taxa de aprovação. Indica excelência no trabalho."
            value={goals.targetApprovalRate}
            onChange={(val) => onChange({ ...goals, targetApprovalRate: val })}
            min={0}
            max={100}
            suffix="%"
            icon={<Award className="h-4 w-4 text-success" />}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function GoalsSettingsDialog() {
  const { goals, updateGoals, resetToDefaults } = useGoals();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [localGoals, setLocalGoals] = useState<GoalsConfig>(goals);
  const [activeTab, setActiveTab] = useState('monthly');

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      setLocalGoals(goals);
    }
    setOpen(isOpen);
  };

  const handleSave = () => {
    // Validate that targets are >= minimums
    const validatePeriod = (period: PeriodGoals, name: string): boolean => {
      if (period.targetInspections < period.minInspections) {
        toast({
          title: "Erro de validação",
          description: `${name}: Meta de vistorias deve ser maior ou igual ao mínimo.`,
          variant: "destructive"
        });
        return false;
      }
      if (period.targetApprovalRate < period.minApprovalRate) {
        toast({
          title: "Erro de validação",
          description: `${name}: Meta de aprovação deve ser maior ou igual ao mínimo.`,
          variant: "destructive"
        });
        return false;
      }
      return true;
    };

    if (!validatePeriod(localGoals.monthly, 'Mensal')) return;
    if (!validatePeriod(localGoals.quarterly, 'Trimestral')) return;
    if (!validatePeriod(localGoals.yearly, 'Anual')) return;

    updateGoals(localGoals);
    setOpen(false);
    toast({
      title: "Metas salvas",
      description: "As metas foram atualizadas com sucesso."
    });
  };

  const handleReset = () => {
    resetToDefaults();
    setLocalGoals({
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
    });
    toast({
      title: "Metas resetadas",
      description: "As metas foram restauradas para os valores padrão."
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Settings2 className="h-4 w-4" />
          Configurar Metas
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Configurar Metas de Desempenho
          </DialogTitle>
          <DialogDescription>
            Defina as metas de vistorias e taxa de aprovação para cada período. Essas metas são usadas para avaliar o desempenho dos vistoriadores.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="monthly">Mensal</TabsTrigger>
            <TabsTrigger value="quarterly">Trimestral</TabsTrigger>
            <TabsTrigger value="yearly">Anual</TabsTrigger>
          </TabsList>

          <TabsContent value="monthly" className="mt-4">
            <PeriodGoalsForm
              title="Metas Mensais"
              description="Metas aplicadas ao avaliar o desempenho em um único mês"
              goals={localGoals.monthly}
              onChange={(newGoals) => setLocalGoals({ ...localGoals, monthly: newGoals })}
            />
          </TabsContent>

          <TabsContent value="quarterly" className="mt-4">
            <PeriodGoalsForm
              title="Metas Trimestrais"
              description="Metas aplicadas ao avaliar o desempenho em um trimestre (Q1, Q2, Q3, Q4)"
              goals={localGoals.quarterly}
              onChange={(newGoals) => setLocalGoals({ ...localGoals, quarterly: newGoals })}
            />
          </TabsContent>

          <TabsContent value="yearly" className="mt-4">
            <PeriodGoalsForm
              title="Metas Anuais"
              description="Metas aplicadas ao avaliar o desempenho no ano completo"
              goals={localGoals.yearly}
              onChange={(newGoals) => setLocalGoals({ ...localGoals, yearly: newGoals })}
            />
          </TabsContent>
        </Tabs>

        <div className="bg-muted/50 rounded-lg p-4 mt-2">
          <h4 className="text-sm font-medium mb-2">Como as metas funcionam?</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• <span className="text-success font-medium">Meta atingida:</span> Vistoriador alcançou ou superou a meta ideal</li>
            <li>• <span className="text-warning font-medium">Mínimo atingido:</span> Vistoriador está entre o mínimo e a meta</li>
            <li>• <span className="text-destructive font-medium">Abaixo do mínimo:</span> Vistoriador precisa melhorar</li>
          </ul>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Restaurar Padrão
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              Salvar Metas
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
