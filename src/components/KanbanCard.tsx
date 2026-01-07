import { Car, User, Calendar, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Inspection } from '@/data/mockData';

interface KanbanCardProps {
  inspection: Inspection;
  onViewDetails?: (inspection: Inspection) => void;
}

export function KanbanCard({ inspection, onViewDetails }: KanbanCardProps) {
  return (
    <Card className="bg-card hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4 space-y-3">
        {/* Vehicle Info */}
        <div className="flex items-center gap-2">
          <Car className="h-4 w-4 text-primary" />
          <span className="font-bold text-foreground">{inspection.vehicle.plate}</span>
        </div>
        <p className="text-sm text-muted-foreground">
          {inspection.vehicle.brand} {inspection.vehicle.model}
        </p>

        <div className="border-t border-border pt-3 space-y-2">
          {/* Employee */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-3.5 w-3.5" />
            <span>{inspection.employeeName}</span>
          </div>

          {/* Date */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>{new Date(inspection.date).toLocaleDateString('pt-BR')}</span>
          </div>
        </div>

        {/* View Details Button */}
        {onViewDetails && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-2"
            onClick={() => onViewDetails(inspection)}
          >
            <Eye className="h-4 w-4 mr-2" />
            Ver detalhes
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
