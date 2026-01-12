import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Trophy, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockInspections } from '@/data/mockData';

interface EmployeePerformance {
  id: string;
  name: string;
  inspections: number;
  approvalRate: number;
}

export function TeamPerformanceCard() {
  const navigate = useNavigate();

  // Calculate top performers from mock data
  const employeeStats = mockInspections.reduce((acc, inspection) => {
    const key = inspection.employeeId;
    if (!acc[key]) {
      acc[key] = {
        id: key,
        name: inspection.employeeName,
        total: 0,
        approved: 0,
      };
    }
    acc[key].total++;
    if (inspection.status === 'approved') {
      acc[key].approved++;
    }
    return acc;
  }, {} as Record<string, { id: string; name: string; total: number; approved: number }>);

  const topPerformers: EmployeePerformance[] = Object.values(employeeStats)
    .map(e => ({
      id: e.id,
      name: e.name,
      inspections: e.total,
      approvalRate: e.total > 0 ? Math.round((e.approved / e.total) * 100) : 0,
    }))
    .sort((a, b) => b.inspections - a.inspections)
    .slice(0, 3);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Desempenho da Equipe
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/rankings')}
            className="gap-1 text-xs"
          >
            Ver Ranking
            <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {topPerformers.map((employee, index) => (
          <div
            key={employee.id}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
            onClick={() => navigate('/rankings')}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{medals[index]}</span>
              <div>
                <p className="text-sm font-medium text-foreground">{employee.name}</p>
                <p className="text-xs text-muted-foreground">
                  {employee.approvalRate}% aprovação
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-foreground">{employee.inspections}</p>
              <p className="text-xs text-muted-foreground">vistorias</p>
            </div>
          </div>
        ))}

        {topPerformers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Trophy className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Nenhum dado disponível</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
