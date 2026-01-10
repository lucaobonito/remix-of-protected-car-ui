import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Search, Filter, Eye, Calendar, User, CheckCircle, XCircle, Clock, AlertCircle, MoreVertical, Edit } from 'lucide-react';
import { useVehicles } from '@/contexts/VehiclesContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Inspection } from '@/data/mockData';

export default function Inspections() {
  const { inspections, updateInspectionStatus } = useVehicles();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [employeeFilter, setEmployeeFilter] = useState('all');
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isStatusChangeOpen, setIsStatusChangeOpen] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  const [newStatus, setNewStatus] = useState<Inspection['status']>('pending');
  const [statusNotes, setStatusNotes] = useState('');

  const employees = [...new Set(inspections.map(i => i.employeeName))];

  // Only admins can change status
  const canChangeStatus = user?.role === 'admin';

  const filteredInspections = inspections.filter(inspection => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-warning" />;
      case 'in_progress':
        return <AlertCircle className="h-5 w-5 text-warning" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return null;
    }
  };

  const translateStatus = (status: string) => {
    const map: Record<string, string> = {
      'approved': 'Aprovada',
      'pending': 'Pendente',
      'in_progress': 'Em Andamento',
      'rejected': 'Rejeitada'
    };
    return map[status] || status;
  };

  const formatDate = (dateStr: string) => 
    new Date(dateStr).toLocaleDateString('pt-BR');

  const handleViewDetails = (inspection: Inspection) => {
    setSelectedInspection(inspection);
    setIsDetailsOpen(true);
  };

  const handleOpenStatusChange = (inspection: Inspection) => {
    setSelectedInspection(inspection);
    setNewStatus(inspection.status);
    setStatusNotes('');
    setIsStatusChangeOpen(true);
  };

  const handleStatusChange = () => {
    if (!selectedInspection) return;

    updateInspectionStatus(selectedInspection.id, newStatus);
    setIsStatusChangeOpen(false);
    
    toast({
      title: "Status atualizado",
      description: `Vistoria #${selectedInspection.id} alterada para "${translateStatus(newStatus)}".`
    });
    
    setSelectedInspection(null);
    setStatusNotes('');
  };

  const getAvailableStatusTransitions = (currentStatus: string) => {
    // Define allowed transitions
    switch (currentStatus) {
      case 'pending':
        return ['in_progress', 'approved', 'rejected'];
      case 'in_progress':
        return ['approved', 'rejected', 'pending'];
      case 'approved':
        return ['pending']; // Can revert to pending if needed
      case 'rejected':
        return ['pending', 'in_progress']; // Can reopen
      default:
        return [];
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

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{inspections.length}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-success">{inspections.filter(i => i.status === 'approved').length}</p>
              <p className="text-sm text-muted-foreground">Aprovadas</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-warning">{inspections.filter(i => i.status === 'pending' || i.status === 'in_progress').length}</p>
              <p className="text-sm text-muted-foreground">Pendentes</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-destructive">{inspections.filter(i => i.status === 'rejected').length}</p>
              <p className="text-sm text-muted-foreground">Rejeitadas</p>
            </div>
          </Card>
        </div>

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
                        {formatDate(inspection.date)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {getStatusBadge(inspection.status)}
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(inspection)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalhes
                          </DropdownMenuItem>
                          {canChangeStatus && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleOpenStatusChange(inspection)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Alterar Status
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
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

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              Vistoria #{selectedInspection?.id}
              {selectedInspection && getStatusBadge(selectedInspection.status)}
            </DialogTitle>
            <DialogDescription>
              Detalhes completos da vistoria
            </DialogDescription>
          </DialogHeader>
          {selectedInspection && (
            <div className="space-y-4 py-4">
              {/* Vehicle Info */}
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">VEÍCULO</h4>
                <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                  <p className="font-semibold">{selectedInspection.vehicle.brand} {selectedInspection.vehicle.model}</p>
                  <p className="text-sm text-muted-foreground">
                    Placa: {selectedInspection.vehicle.plate} • Ano: {selectedInspection.vehicle.year} • Cor: {selectedInspection.vehicle.color}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Proprietário: {selectedInspection.vehicle.ownerName}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Inspection Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Data da Vistoria</p>
                  <p className="font-medium">{formatDate(selectedInspection.date)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Vistoriador</p>
                  <p className="font-medium">{selectedInspection.employeeName}</p>
                </div>
              </div>

              <Separator />

              {/* Checklist */}
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">CHECKLIST</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(selectedInspection.checklist).map(([key, value]) => {
                    const labels: Record<string, string> = {
                      exterior: 'Exterior',
                      interior: 'Interior',
                      engine: 'Motor',
                      tires: 'Pneus',
                      documents: 'Documentos',
                      lights: 'Iluminação'
                    };
                    return (
                      <div key={key} className="flex items-center gap-2">
                        {value ? (
                          <CheckCircle className="h-4 w-4 text-success" />
                        ) : (
                          <XCircle className="h-4 w-4 text-destructive" />
                        )}
                        <span className="text-sm">{labels[key] || key}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedInspection.notes && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">OBSERVAÇÕES</h4>
                    <p className="text-sm">{selectedInspection.notes}</p>
                  </div>
                </>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              Fechar
            </Button>
            {canChangeStatus && selectedInspection && (
              <Button onClick={() => {
                setIsDetailsOpen(false);
                handleOpenStatusChange(selectedInspection);
              }}>
                <Edit className="h-4 w-4 mr-2" />
                Alterar Status
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Change Dialog */}
      <Dialog open={isStatusChangeOpen} onOpenChange={setIsStatusChangeOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Alterar Status da Vistoria</DialogTitle>
            <DialogDescription>
              Vistoria #{selectedInspection?.id} - {selectedInspection?.vehicle.plate}
            </DialogDescription>
          </DialogHeader>
          {selectedInspection && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                {getStatusIcon(selectedInspection.status)}
                <div>
                  <p className="text-sm text-muted-foreground">Status Atual</p>
                  <p className="font-medium">{translateStatus(selectedInspection.status)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Novo Status</Label>
                <Select value={newStatus} onValueChange={(value: Inspection['status']) => setNewStatus(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableStatusTransitions(selectedInspection.status).map(status => (
                      <SelectItem key={status} value={status}>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(status)}
                          {translateStatus(status)}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Observação (opcional)</Label>
                <Textarea 
                  placeholder="Adicione uma observação sobre a alteração..."
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  rows={3}
                />
              </div>

              {newStatus === 'approved' && (
                <div className="p-3 rounded-lg bg-success/10 border border-success/20 text-sm">
                  <p className="font-medium text-success">✓ Aprovar Vistoria</p>
                  <p className="text-muted-foreground">O veículo será marcado como protegido.</p>
                </div>
              )}

              {newStatus === 'rejected' && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm">
                  <p className="font-medium text-destructive">✗ Rejeitar Vistoria</p>
                  <p className="text-muted-foreground">O veículo não será aprovado para proteção.</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusChangeOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleStatusChange}
              disabled={newStatus === selectedInspection?.status}
            >
              Confirmar Alteração
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}