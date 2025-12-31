import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Eye, Calendar, User } from 'lucide-react';
import { mockInspections } from '@/data/mockData';

export default function Inspections() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [employeeFilter, setEmployeeFilter] = useState('all');

  const employees = [...new Set(mockInspections.map(i => i.employeeName))];

  const filteredInspections = mockInspections.filter(inspection => {
    const matchesSearch = 
      inspection.vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspection.vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspection.vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspection.vehicle.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || inspection.status === statusFilter;
    const matchesEmployee = employeeFilter === 'all' || inspection.employeeName === employeeFilter;

    return matchesSearch && matchesStatus && matchesEmployee;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Aprovada</Badge>;
      case 'pending':
        return <Badge variant="pending">Pendente</Badge>;
      case 'in_progress':
        return <Badge variant="warning">Em Andamento</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeitada</Badge>;
      default:
        return <Badge variant="muted">{status}</Badge>;
    }
  };

  return (
    <AppLayout title="Vistorias">
      <div className="space-y-6 animate-fade-in">
        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por placa, veículo ou proprietário..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="approved">Aprovadas</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="in_progress">Em Andamento</SelectItem>
                  <SelectItem value="rejected">Rejeitadas</SelectItem>
                </SelectContent>
              </Select>
              <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Funcionário" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os funcionários</SelectItem>
                  {employees.map(employee => (
                    <SelectItem key={employee} value={employee}>{employee}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredInspections.length} vistoria(s) encontrada(s)
          </p>
        </div>

        {/* Inspections List */}
        <div className="grid gap-4">
          {filteredInspections.map((inspection) => (
            <Card key={inspection.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                      <span className="text-lg font-bold">
                        {inspection.vehicle.brand.charAt(0)}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-foreground">
                        {inspection.vehicle.brand} {inspection.vehicle.model}
                      </h3>
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <span className="font-medium">{inspection.vehicle.plate}</span>
                        </span>
                        <span>•</span>
                        <span>{inspection.vehicle.ownerName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="flex flex-col gap-1 text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <User className="h-4 w-4" />
                        {inspection.employeeName}
                      </span>
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {new Date(inspection.date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {getStatusBadge(inspection.status)}
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {inspection.notes && (
                  <div className="mt-4 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                    <strong>Obs:</strong> {inspection.notes}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {filteredInspections.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma vistoria encontrada</h3>
                <p className="text-muted-foreground">Tente ajustar os filtros de busca</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
