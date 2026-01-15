import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Filter, Eye, Calendar, User, CheckCircle, XCircle, Clock, AlertCircle, MoreVertical, Edit, History, Pencil, MapPin, Loader2 } from 'lucide-react';
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

const brazilianStates = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

interface EditInspectionForm {
  // Vehicle data
  plate: string;
  brand: string;
  model: string;
  year: string;
  color: string;
  // Owner data
  ownerName: string;
  ownerCpf: string;
  ownerPhone: string;
  ownerWhatsapp: string;
  ownerEmail: string;
  ownerCep: string;
  ownerAddress: string;
  ownerAddressNumber: string;
  ownerAddressComplement: string;
  ownerNeighborhood: string;
  ownerCity: string;
  ownerState: string;
  // Checklist
  checklist: {
    exterior: boolean;
    interior: boolean;
    engine: boolean;
    tires: boolean;
    documents: boolean;
    lights: boolean;
  };
  // Notes
  notes: string;
}

export default function Inspections() {
  const { inspections, updateInspectionStatus, updateInspection } = useVehicles();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialize filters from URL query params
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [employeeFilter, setEmployeeFilter] = useState(searchParams.get('employee') || 'all');

  // Sync URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (employeeFilter !== 'all') params.set('employee', employeeFilter);
    setSearchParams(params, { replace: true });
  }, [statusFilter, employeeFilter, setSearchParams]);
  
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isStatusChangeOpen, setIsStatusChangeOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  const [newStatus, setNewStatus] = useState<Inspection['status']>('pending');
  const [statusNotes, setStatusNotes] = useState('');
  const [editForm, setEditForm] = useState<EditInspectionForm | null>(null);
  const [isLoadingCep, setIsLoadingCep] = useState(false);

  const employees = [...new Set(inspections.map(i => i.employeeName))];

  // Check if user can change status of a specific inspection
  // Admins can change any inspection, employees can only change their own
  const canChangeStatus = (inspection: Inspection) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return inspection.employeeId === user.id;
  };

  // Input masks
  const formatCpf = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return value.slice(0, 14);
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
    }
    return value.slice(0, 15);
  };

  const formatCep = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 8) {
      return numbers.replace(/(\d{5})(\d)/, '$1-$2');
    }
    return value.slice(0, 9);
  };

  const handleCepLookup = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;

    setIsLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();
      
      if (!data.erro && editForm) {
        setEditForm({
          ...editForm,
          ownerAddress: data.logradouro || '',
          ownerNeighborhood: data.bairro || '',
          ownerCity: data.localidade || '',
          ownerState: data.uf || '',
        });
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    } finally {
      setIsLoadingCep(false);
    }
  };

  const handleEditFormChange = (field: keyof EditInspectionForm, value: string | boolean) => {
    if (!editForm) return;
    
    let formattedValue = value;
    
    if (field === 'ownerCpf' && typeof value === 'string') {
      formattedValue = formatCpf(value);
    } else if ((field === 'ownerPhone' || field === 'ownerWhatsapp') && typeof value === 'string') {
      formattedValue = formatPhone(value);
    } else if (field === 'ownerCep' && typeof value === 'string') {
      formattedValue = formatCep(value);
      if (value.replace(/\D/g, '').length === 8) {
        handleCepLookup(value);
      }
    }
    
    setEditForm({ ...editForm, [field]: formattedValue });
  };

  const handleChecklistChange = (field: keyof EditInspectionForm['checklist'], value: boolean) => {
    if (!editForm) return;
    setEditForm({
      ...editForm,
      checklist: { ...editForm.checklist, [field]: value }
    });
  };

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

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.toLocaleDateString('pt-BR')} às ${date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`;
  };

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

  const handleOpenEdit = (inspection: Inspection) => {
    setSelectedInspection(inspection);
    setEditForm({
      plate: inspection.vehicle.plate,
      brand: inspection.vehicle.brand,
      model: inspection.vehicle.model,
      year: String(inspection.vehicle.year),
      color: inspection.vehicle.color,
      ownerName: inspection.vehicle.ownerName || '',
      ownerCpf: inspection.vehicle.ownerCpf || '',
      ownerPhone: inspection.vehicle.ownerPhone || '',
      ownerWhatsapp: inspection.vehicle.ownerWhatsapp || '',
      ownerEmail: inspection.vehicle.ownerEmail || '',
      ownerCep: inspection.vehicle.ownerCep || '',
      ownerAddress: inspection.vehicle.ownerAddress || '',
      ownerAddressNumber: inspection.vehicle.ownerAddressNumber || '',
      ownerAddressComplement: inspection.vehicle.ownerAddressComplement || '',
      ownerNeighborhood: inspection.vehicle.ownerNeighborhood || '',
      ownerCity: inspection.vehicle.ownerCity || '',
      ownerState: inspection.vehicle.ownerState || '',
      checklist: { ...inspection.checklist },
      notes: inspection.notes || '',
    });
    setIsEditOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedInspection || !editForm) return;

    // Validation
    if (!editForm.plate.trim() || !editForm.brand.trim() || !editForm.model.trim() || 
        !editForm.color.trim() || !editForm.ownerName.trim() || !editForm.ownerPhone.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const yearNum = parseInt(editForm.year);
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear() + 1) {
      toast({
        title: "Ano inválido",
        description: "Informe um ano válido.",
        variant: "destructive"
      });
      return;
    }

    updateInspection(selectedInspection.id, {
      vehicle: {
        plate: editForm.plate.toUpperCase(),
        brand: editForm.brand,
        model: editForm.model,
        year: yearNum,
        color: editForm.color,
        ownerName: editForm.ownerName,
        ownerCpf: editForm.ownerCpf,
        ownerPhone: editForm.ownerPhone,
        ownerWhatsapp: editForm.ownerWhatsapp,
        ownerEmail: editForm.ownerEmail,
        ownerCep: editForm.ownerCep,
        ownerAddress: editForm.ownerAddress,
        ownerAddressNumber: editForm.ownerAddressNumber,
        ownerAddressComplement: editForm.ownerAddressComplement,
        ownerNeighborhood: editForm.ownerNeighborhood,
        ownerCity: editForm.ownerCity,
        ownerState: editForm.ownerState,
      },
      checklist: editForm.checklist,
      notes: editForm.notes,
    });

    setIsEditOpen(false);
    toast({
      title: "Vistoria atualizada",
      description: `Vistoria #${selectedInspection.id} foi atualizada com sucesso.`
    });
    setSelectedInspection(null);
    setEditForm(null);
  };

  const handleStatusChange = () => {
    if (!selectedInspection || !user) return;

    updateInspectionStatus(
      selectedInspection.id, 
      newStatus,
      user.id,
      user.name,
      statusNotes || undefined
    );
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
                          {canChangeStatus(inspection) && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleOpenEdit(inspection)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Editar Vistoria
                              </DropdownMenuItem>
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

              {/* Status History */}
              {selectedInspection.statusHistory && selectedInspection.statusHistory.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-3 flex items-center gap-2">
                      <History className="h-4 w-4" />
                      HISTÓRICO DE ALTERAÇÕES
                    </h4>
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                      {selectedInspection.statusHistory.map((entry) => (
                        <div key={entry.id} className="p-3 rounded-lg bg-muted/50 text-sm border border-border/50">
                          <div className="flex items-center gap-2 font-medium">
                            {getStatusIcon(entry.newStatus)}
                            <span className="text-muted-foreground">{translateStatus(entry.previousStatus)}</span>
                            <span className="text-muted-foreground">→</span>
                            <span>{translateStatus(entry.newStatus)}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Por: <span className="font-medium">{entry.changedBy}</span> • {formatDateTime(entry.changedAt)}
                          </p>
                          {entry.notes && (
                            <p className="text-xs mt-2 italic text-foreground/80">"{entry.notes}"</p>
                          )}
                        </div>
                      ))}
                    </div>
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
      {/* Edit Inspection Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Pencil className="h-5 w-5" />
              Editar Vistoria #{selectedInspection?.id}
            </DialogTitle>
            <DialogDescription>
              Edite os dados da vistoria. Campos com * são obrigatórios.
            </DialogDescription>
          </DialogHeader>
          {editForm && (
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-6 py-4">
                {/* Vehicle Data */}
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-3 flex items-center gap-2">
                    🚗 DADOS DO VEÍCULO
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-plate">Placa *</Label>
                      <Input
                        id="edit-plate"
                        placeholder="ABC-1234"
                        value={editForm.plate}
                        onChange={(e) => handleEditFormChange('plate', e.target.value.toUpperCase())}
                        maxLength={8}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-brand">Marca *</Label>
                      <Input
                        id="edit-brand"
                        placeholder="Toyota"
                        value={editForm.brand}
                        onChange={(e) => handleEditFormChange('brand', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-model">Modelo *</Label>
                      <Input
                        id="edit-model"
                        placeholder="Corolla"
                        value={editForm.model}
                        onChange={(e) => handleEditFormChange('model', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-year">Ano *</Label>
                      <Input
                        id="edit-year"
                        type="number"
                        placeholder="2024"
                        value={editForm.year}
                        onChange={(e) => handleEditFormChange('year', e.target.value)}
                        min={1900}
                        max={new Date().getFullYear() + 1}
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="edit-color">Cor *</Label>
                      <Input
                        id="edit-color"
                        placeholder="Prata"
                        value={editForm.color}
                        onChange={(e) => handleEditFormChange('color', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Owner Data */}
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-3 flex items-center gap-2">
                    👤 DADOS DO CLIENTE
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="edit-ownerName">Nome Completo *</Label>
                      <Input
                        id="edit-ownerName"
                        placeholder="João da Silva"
                        value={editForm.ownerName}
                        onChange={(e) => handleEditFormChange('ownerName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-ownerCpf">CPF</Label>
                      <Input
                        id="edit-ownerCpf"
                        placeholder="000.000.000-00"
                        value={editForm.ownerCpf}
                        onChange={(e) => handleEditFormChange('ownerCpf', e.target.value)}
                        maxLength={14}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-ownerEmail">E-mail</Label>
                      <Input
                        id="edit-ownerEmail"
                        type="email"
                        placeholder="cliente@email.com"
                        value={editForm.ownerEmail}
                        onChange={(e) => handleEditFormChange('ownerEmail', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-ownerPhone">Telefone *</Label>
                      <Input
                        id="edit-ownerPhone"
                        placeholder="(00) 00000-0000"
                        value={editForm.ownerPhone}
                        onChange={(e) => handleEditFormChange('ownerPhone', e.target.value)}
                        maxLength={15}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-ownerWhatsapp">WhatsApp</Label>
                      <Input
                        id="edit-ownerWhatsapp"
                        placeholder="(00) 00000-0000"
                        value={editForm.ownerWhatsapp}
                        onChange={(e) => handleEditFormChange('ownerWhatsapp', e.target.value)}
                        maxLength={15}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Address */}
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    ENDEREÇO
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-ownerCep">CEP</Label>
                      <div className="relative">
                        <Input
                          id="edit-ownerCep"
                          placeholder="00000-000"
                          value={editForm.ownerCep}
                          onChange={(e) => handleEditFormChange('ownerCep', e.target.value)}
                          maxLength={9}
                        />
                        {isLoadingCep && (
                          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="edit-ownerAddress">Endereço</Label>
                      <Input
                        id="edit-ownerAddress"
                        placeholder="Rua, Avenida..."
                        value={editForm.ownerAddress}
                        onChange={(e) => handleEditFormChange('ownerAddress', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-ownerAddressNumber">Número</Label>
                      <Input
                        id="edit-ownerAddressNumber"
                        placeholder="123"
                        value={editForm.ownerAddressNumber}
                        onChange={(e) => handleEditFormChange('ownerAddressNumber', e.target.value)}
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="edit-ownerAddressComplement">Complemento</Label>
                      <Input
                        id="edit-ownerAddressComplement"
                        placeholder="Apt, Bloco..."
                        value={editForm.ownerAddressComplement}
                        onChange={(e) => handleEditFormChange('ownerAddressComplement', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-ownerNeighborhood">Bairro</Label>
                      <Input
                        id="edit-ownerNeighborhood"
                        placeholder="Centro"
                        value={editForm.ownerNeighborhood}
                        onChange={(e) => handleEditFormChange('ownerNeighborhood', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-ownerCity">Cidade</Label>
                      <Input
                        id="edit-ownerCity"
                        placeholder="São Paulo"
                        value={editForm.ownerCity}
                        onChange={(e) => handleEditFormChange('ownerCity', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-ownerState">Estado</Label>
                      <Select 
                        value={editForm.ownerState} 
                        onValueChange={(value) => handleEditFormChange('ownerState', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="UF" />
                        </SelectTrigger>
                        <SelectContent>
                          {brazilianStates.map(state => (
                            <SelectItem key={state} value={state}>{state}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Checklist */}
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-3">✓ CHECKLIST</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {Object.entries(editForm.checklist).map(([key, value]) => {
                      const labels: Record<string, string> = {
                        exterior: 'Exterior',
                        interior: 'Interior',
                        engine: 'Motor',
                        tires: 'Pneus',
                        documents: 'Documentos',
                        lights: 'Iluminação'
                      };
                      return (
                        <div key={key} className="flex items-center space-x-2">
                          <Checkbox
                            id={`edit-${key}`}
                            checked={value}
                            onCheckedChange={(checked) => 
                              handleChecklistChange(key as keyof EditInspectionForm['checklist'], checked as boolean)
                            }
                          />
                          <Label htmlFor={`edit-${key}`} className="cursor-pointer">
                            {labels[key] || key}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Separator />

                {/* Notes */}
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-3">📝 OBSERVAÇÕES</h4>
                  <Textarea
                    placeholder="Adicione observações sobre a vistoria..."
                    value={editForm.notes}
                    onChange={(e) => handleEditFormChange('notes', e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Read-only info */}
                <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                  <p><strong>Data:</strong> {selectedInspection ? formatDate(selectedInspection.date) : ''}</p>
                  <p><strong>Vistoriador:</strong> {selectedInspection?.employeeName}</p>
                </div>
              </div>
            </ScrollArea>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}