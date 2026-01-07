import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { KanbanColumn } from '@/components/KanbanColumn';
import { KanbanCard } from '@/components/KanbanCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useVehicles } from '@/contexts/VehiclesContext';
import { useToast } from '@/hooks/use-toast';
import { Inspection } from '@/data/mockData';

const statusColumns = [
  { key: 'pending', title: 'Pendentes', colorClass: 'bg-yellow-500 text-yellow-950' },
  { key: 'in_progress', title: 'Em Andamento', colorClass: 'bg-blue-500 text-blue-950' },
  { key: 'approved', title: 'Aprovadas', colorClass: 'bg-green-500 text-green-950' },
  { key: 'rejected', title: 'Rejeitadas', colorClass: 'bg-red-500 text-red-950' },
] as const;

const statusLabels: Record<string, string> = {
  pending: 'Pendentes',
  in_progress: 'Em Andamento',
  approved: 'Aprovadas',
  rejected: 'Rejeitadas',
};

export default function Kanban() {
  const { inspections, updateInspectionStatus } = useVehicles();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('all');

  // Get unique employees
  const employees = useMemo(() => {
    const uniqueEmployees = [...new Set(inspections.map(i => i.employeeName))];
    return uniqueEmployees.sort();
  }, [inspections]);

  // Filter inspections
  const filteredInspections = useMemo(() => {
    return inspections.filter(inspection => {
      const matchesSearch = searchTerm === '' ||
        inspection.vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inspection.vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inspection.vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesEmployee = employeeFilter === 'all' || inspection.employeeName === employeeFilter;

      return matchesSearch && matchesEmployee;
    });
  }, [inspections, searchTerm, employeeFilter]);

  // Group inspections by status
  const groupedInspections = useMemo(() => {
    const groups: Record<string, Inspection[]> = {
      pending: [],
      in_progress: [],
      approved: [],
      rejected: [],
    };

    filteredInspections.forEach(inspection => {
      if (groups[inspection.status]) {
        groups[inspection.status].push(inspection);
      }
    });

    return groups;
  }, [filteredInspections]);

  const handleDrop = (inspectionId: string, newStatus: string) => {
    const inspection = inspections.find(i => i.id === inspectionId);
    if (!inspection || inspection.status === newStatus) return;

    updateInspectionStatus(inspectionId, newStatus as Inspection['status']);
    
    toast({
      title: "Vistoria movida",
      description: `Vistoria movida para ${statusLabels[newStatus]}`,
    });
  };

  const handleViewDetails = (inspection: Inspection) => {
    console.log('View details:', inspection);
    // TODO: Open modal or navigate to details page
  };

  return (
    <AppLayout title="Kanban de Vistorias">
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por placa, marca ou modelo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filtrar por funcionário" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os funcionários</SelectItem>
              {employees.map(employee => (
                <SelectItem key={employee} value={employee}>
                  {employee}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Kanban Board */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          {statusColumns.map(column => (
            <KanbanColumn
              key={column.key}
              title={column.title}
              count={groupedInspections[column.key].length}
              colorClass={column.colorClass}
              status={column.key}
              onDrop={handleDrop}
            >
              {groupedInspections[column.key].length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">
                  Nenhuma vistoria
                </p>
              ) : (
                groupedInspections[column.key].map(inspection => (
                  <KanbanCard
                    key={inspection.id}
                    inspection={inspection}
                    onViewDetails={handleViewDetails}
                  />
                ))
              )}
            </KanbanColumn>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
