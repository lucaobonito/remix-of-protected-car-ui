import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Search, Car, Plus, Eye, Shield, AlertCircle, Clock, Calendar, Palette, User, CheckCircle, XCircle, Loader2, Pencil, Save, X, Phone, Mail, MapPin } from 'lucide-react';
import { useVehicles, VehicleUpdateData } from '@/contexts/VehiclesContext';
import { Vehicle } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface EditFormState {
  plate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  status: 'protected' | 'pending' | 'expired';
  // Dados do Cliente
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
}

const brazilianStates = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export default function Vehicles() {
  const { vehicles, inspections, updateVehicle } = useVehicles();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<EditFormState | null>(null);
  const [isSearchingCep, setIsSearchingCep] = useState(false);

  const canEdit = user?.role === 'admin';

  // Formatadores
  const formatCpf = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const formatCep = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{3})\d+?$/, '$1');
  };

  const handleSearchCep = async () => {
    if (!editForm) return;
    
    const cep = editForm.ownerCep.replace(/\D/g, '');
    if (cep.length !== 8) {
      toast.error('CEP inválido. Digite 8 números.');
      return;
    }

    setIsSearchingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (data.erro) {
        toast.error('CEP não encontrado');
        return;
      }

      setEditForm(prev => prev ? {
        ...prev,
        ownerAddress: data.logradouro || '',
        ownerNeighborhood: data.bairro || '',
        ownerCity: data.localidade || '',
        ownerState: data.uf || '',
      } : null);
      toast.success('Endereço encontrado!');
    } catch {
      toast.error('Erro ao buscar CEP');
    } finally {
      setIsSearchingCep(false);
    }
  };

  const handleViewDetails = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDetailsOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDetailsOpen(false);
    setIsEditing(false);
    setEditForm(null);
  };

  const handleStartEdit = () => {
    if (selectedVehicle) {
      setEditForm({
        plate: selectedVehicle.plate,
        brand: selectedVehicle.brand,
        model: selectedVehicle.model,
        year: selectedVehicle.year,
        color: selectedVehicle.color,
        status: selectedVehicle.status,
        // Dados do Cliente
        ownerName: selectedVehicle.ownerName || '',
        ownerCpf: selectedVehicle.ownerCpf || '',
        ownerPhone: selectedVehicle.ownerPhone || '',
        ownerWhatsapp: selectedVehicle.ownerWhatsapp || '',
        ownerEmail: selectedVehicle.ownerEmail || '',
        ownerCep: selectedVehicle.ownerCep || '',
        ownerAddress: selectedVehicle.ownerAddress || '',
        ownerAddressNumber: selectedVehicle.ownerAddressNumber || '',
        ownerAddressComplement: selectedVehicle.ownerAddressComplement || '',
        ownerNeighborhood: selectedVehicle.ownerNeighborhood || '',
        ownerCity: selectedVehicle.ownerCity || '',
        ownerState: selectedVehicle.ownerState || '',
      });
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm(null);
  };

  const handleSaveEdit = () => {
    if (!selectedVehicle || !editForm) return;

    // Validação de campos obrigatórios do veículo
    if (!editForm.plate.trim() || !editForm.brand.trim() || !editForm.model.trim() || 
        !editForm.color.trim() || !editForm.ownerName.trim()) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (editForm.year < 1900 || editForm.year > new Date().getFullYear() + 1) {
      toast.error('Ano inválido');
      return;
    }

    // Validação de e-mail se preenchido
    if (editForm.ownerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.ownerEmail)) {
      toast.error('E-mail inválido');
      return;
    }

    const updateData: VehicleUpdateData = {
      plate: editForm.plate.toUpperCase(),
      brand: editForm.brand,
      model: editForm.model,
      year: editForm.year,
      color: editForm.color,
      status: editForm.status,
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
    };

    updateVehicle(selectedVehicle.id, updateData);
    setSelectedVehicle({ ...selectedVehicle, ...updateData });
    setIsEditing(false);
    setEditForm(null);
    toast.success('Veículo atualizado com sucesso!');
  };

  const getVehicleInspections = (vehicleId: string) => {
    return inspections.filter(i => i.vehicleId === vehicleId);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const getInspectionStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Aprovada</Badge>;
      case 'pending':
        return <Badge variant="warning">Pendente</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="border-blue-500 text-blue-500">Em Andamento</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeitada</Badge>;
      default:
        return <Badge variant="muted">{status}</Badge>;
    }
  };

  const getInspectionStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'in_progress':
        return <Loader2 className="h-4 w-4 text-blue-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = 
      vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'protected':
        return <Badge variant="success">Protegido</Badge>;
      case 'pending':
        return <Badge variant="warning">Pendente</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expirado</Badge>;
      default:
        return <Badge variant="muted">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'protected':
        return <Shield className="h-5 w-5 text-success" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-warning" />;
      case 'expired':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Car className="h-5 w-5" />;
    }
  };

  // Renderiza a seção do proprietário no modo visualização
  const renderOwnerViewSection = () => {
    if (!selectedVehicle) return null;

    const hasContactInfo = selectedVehicle.ownerPhone || selectedVehicle.ownerEmail;
    const hasAddressInfo = selectedVehicle.ownerAddress || selectedVehicle.ownerCity;

    return (
      <div className="space-y-4">
        {/* Identificação */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <User className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Nome</p>
              <p className="font-medium">{selectedVehicle.ownerName}</p>
            </div>
          </div>
          {selectedVehicle.ownerCpf && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">CPF</p>
                <p className="font-medium">{selectedVehicle.ownerCpf}</p>
              </div>
            </div>
          )}
        </div>

        {/* Contato */}
        {hasContactInfo && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedVehicle.ownerPhone && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="font-medium">{selectedVehicle.ownerPhone}</p>
                </div>
              </div>
            )}
            {selectedVehicle.ownerWhatsapp && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">WhatsApp</p>
                  <p className="font-medium">{selectedVehicle.ownerWhatsapp}</p>
                </div>
              </div>
            )}
            {selectedVehicle.ownerEmail && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 md:col-span-2">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">E-mail</p>
                  <p className="font-medium">{selectedVehicle.ownerEmail}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Endereço */}
        {hasAddressInfo && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Endereço</p>
              <p className="font-medium">
                {selectedVehicle.ownerAddress}
                {selectedVehicle.ownerAddressNumber && `, ${selectedVehicle.ownerAddressNumber}`}
                {selectedVehicle.ownerAddressComplement && ` - ${selectedVehicle.ownerAddressComplement}`}
              </p>
              <p className="text-sm text-muted-foreground">
                {selectedVehicle.ownerNeighborhood}
                {selectedVehicle.ownerCity && ` - ${selectedVehicle.ownerCity}`}
                {selectedVehicle.ownerState && `/${selectedVehicle.ownerState}`}
                {selectedVehicle.ownerCep && ` • CEP: ${selectedVehicle.ownerCep}`}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Renderiza a seção do proprietário no modo edição
  const renderOwnerEditSection = () => {
    if (!editForm) return null;

    return (
      <div className="space-y-6">
        {/* Identificação */}
        <div>
          <h5 className="text-sm font-medium text-muted-foreground mb-3">Identificação</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ownerName">Nome Completo *</Label>
              <Input
                id="ownerName"
                value={editForm.ownerName}
                onChange={(e) => setEditForm({ ...editForm, ownerName: e.target.value })}
                placeholder="Nome completo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ownerCpf">CPF</Label>
              <Input
                id="ownerCpf"
                value={editForm.ownerCpf}
                onChange={(e) => setEditForm({ ...editForm, ownerCpf: formatCpf(e.target.value) })}
                placeholder="000.000.000-00"
                maxLength={14}
              />
            </div>
          </div>
        </div>

        {/* Contato */}
        <div>
          <h5 className="text-sm font-medium text-muted-foreground mb-3">Contato</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ownerPhone">Telefone</Label>
              <Input
                id="ownerPhone"
                value={editForm.ownerPhone}
                onChange={(e) => setEditForm({ ...editForm, ownerPhone: formatPhone(e.target.value) })}
                placeholder="(00) 00000-0000"
                maxLength={15}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ownerWhatsapp">WhatsApp</Label>
              <Input
                id="ownerWhatsapp"
                value={editForm.ownerWhatsapp}
                onChange={(e) => setEditForm({ ...editForm, ownerWhatsapp: formatPhone(e.target.value) })}
                placeholder="(00) 00000-0000"
                maxLength={15}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="ownerEmail">E-mail</Label>
              <Input
                id="ownerEmail"
                type="email"
                value={editForm.ownerEmail}
                onChange={(e) => setEditForm({ ...editForm, ownerEmail: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>
          </div>
        </div>

        {/* Endereço */}
        <div>
          <h5 className="text-sm font-medium text-muted-foreground mb-3">Endereço</h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ownerCep">CEP</Label>
              <div className="flex gap-2">
                <Input
                  id="ownerCep"
                  value={editForm.ownerCep}
                  onChange={(e) => setEditForm({ ...editForm, ownerCep: formatCep(e.target.value) })}
                  placeholder="00000-000"
                  maxLength={9}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon"
                  onClick={handleSearchCep}
                  disabled={isSearchingCep}
                >
                  {isSearchingCep ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="ownerAddress">Endereço</Label>
              <Input
                id="ownerAddress"
                value={editForm.ownerAddress}
                onChange={(e) => setEditForm({ ...editForm, ownerAddress: e.target.value })}
                placeholder="Rua, Avenida..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ownerAddressNumber">Número</Label>
              <Input
                id="ownerAddressNumber"
                value={editForm.ownerAddressNumber}
                onChange={(e) => setEditForm({ ...editForm, ownerAddressNumber: e.target.value })}
                placeholder="123"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="ownerAddressComplement">Complemento</Label>
              <Input
                id="ownerAddressComplement"
                value={editForm.ownerAddressComplement}
                onChange={(e) => setEditForm({ ...editForm, ownerAddressComplement: e.target.value })}
                placeholder="Apto, Bloco..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ownerNeighborhood">Bairro</Label>
              <Input
                id="ownerNeighborhood"
                value={editForm.ownerNeighborhood}
                onChange={(e) => setEditForm({ ...editForm, ownerNeighborhood: e.target.value })}
                placeholder="Bairro"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ownerCity">Cidade</Label>
              <Input
                id="ownerCity"
                value={editForm.ownerCity}
                onChange={(e) => setEditForm({ ...editForm, ownerCity: e.target.value })}
                placeholder="Cidade"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ownerState">Estado</Label>
              <Select 
                value={editForm.ownerState} 
                onValueChange={(value) => setEditForm({ ...editForm, ownerState: value })}
              >
                <SelectTrigger id="ownerState">
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
      </div>
    );
  };

  return (
    <AppLayout title="Veículos">
      <div className="space-y-6 animate-fade-in">
        {/* Actions & Filters */}
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
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
                <SelectItem value="protected">Protegidos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="expired">Expirados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Adicionar Veículo
          </Button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Car className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{vehicles.length}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-success" />
              <div>
                <p className="text-2xl font-bold">{vehicles.filter(v => v.status === 'protected').length}</p>
                <p className="text-sm text-muted-foreground">Protegidos</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-warning" />
              <div>
                <p className="text-2xl font-bold">{vehicles.filter(v => v.status === 'pending').length}</p>
                <p className="text-sm text-muted-foreground">Pendentes</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <div>
                <p className="text-2xl font-bold">{vehicles.filter(v => v.status === 'expired').length}</p>
                <p className="text-sm text-muted-foreground">Expirados</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground">
          {filteredVehicles.length} veículo(s) encontrado(s)
        </p>

        {/* Vehicles Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredVehicles.map((vehicle) => (
            <Card key={vehicle.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
              <CardContent className="p-0">
                {/* Vehicle Header */}
                <div className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 border-b border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(vehicle.status)}
                      <span className="font-mono font-bold text-foreground">{vehicle.plate}</span>
                    </div>
                    {getStatusBadge(vehicle.status)}
                  </div>
                </div>

                {/* Vehicle Info */}
                <div className="p-4 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {vehicle.brand} {vehicle.model}
                    </h3>
                    <p className="text-sm text-muted-foreground">{vehicle.year} • {vehicle.color}</p>
                  </div>

                  <div className="pt-2 border-t border-border">
                    <p className="text-sm text-muted-foreground">Proprietário</p>
                    <p className="font-medium text-foreground">{vehicle.ownerName}</p>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 gap-2"
                      onClick={() => handleViewDetails(vehicle)}
                    >
                      <Eye className="h-4 w-4" />
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredVehicles.length === 0 && (
            <Card className="md:col-span-2 lg:col-span-3">
              <CardContent className="py-12 text-center">
                <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Nenhum veículo encontrado</h3>
                <p className="text-muted-foreground">Tente ajustar os filtros de busca</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Vehicle Details Dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={handleCloseDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {selectedVehicle && (
              <>
                <DialogHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Car className="h-6 w-6 text-primary" />
                      <DialogTitle className="text-xl">
                        Placa: {isEditing && editForm ? editForm.plate : selectedVehicle.plate}
                      </DialogTitle>
                    </div>
                    {canEdit && !isEditing && (
                      <Button variant="outline" size="sm" onClick={handleStartEdit} className="gap-2">
                        <Pencil className="h-4 w-4" />
                        Editar
                      </Button>
                    )}
                  </div>
                  <DialogDescription>
                    {isEditing ? 'Editando informações do veículo e cliente' : 'Informações detalhadas do veículo e cliente'}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Status Badge / Select */}
                  {isEditing && editForm ? (
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select 
                        value={editForm.status} 
                        onValueChange={(value: 'protected' | 'pending' | 'expired') => 
                          setEditForm({ ...editForm, status: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="protected">Protegido</SelectItem>
                          <SelectItem value="pending">Pendente</SelectItem>
                          <SelectItem value="expired">Expirado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {getStatusIcon(selectedVehicle.status)}
                      {getStatusBadge(selectedVehicle.status)}
                    </div>
                  )}

                  <Separator />

                  {/* Vehicle Information */}
                  <div>
                    <h4 className="font-semibold text-foreground mb-4">Informações do Veículo</h4>
                    {isEditing && editForm ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="plate">Placa</Label>
                          <Input
                            id="plate"
                            value={editForm.plate}
                            onChange={(e) => setEditForm({ ...editForm, plate: e.target.value.toUpperCase() })}
                            placeholder="ABC-1234"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="brand">Marca</Label>
                          <Input
                            id="brand"
                            value={editForm.brand}
                            onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
                            placeholder="Toyota"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="model">Modelo</Label>
                          <Input
                            id="model"
                            value={editForm.model}
                            onChange={(e) => setEditForm({ ...editForm, model: e.target.value })}
                            placeholder="Corolla"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="year">Ano</Label>
                          <Input
                            id="year"
                            type="number"
                            value={editForm.year}
                            onChange={(e) => setEditForm({ ...editForm, year: parseInt(e.target.value) || 0 })}
                            min={1900}
                            max={new Date().getFullYear() + 1}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="color">Cor</Label>
                          <Input
                            id="color"
                            value={editForm.color}
                            onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                            placeholder="Prata"
                          />
                        </div>
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                          <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm text-muted-foreground">Data de Cadastro</p>
                            <p className="font-medium">{formatDate(selectedVehicle.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                          <Car className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm text-muted-foreground">Veículo</p>
                            <p className="font-medium">{selectedVehicle.brand} {selectedVehicle.model}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                          <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm text-muted-foreground">Ano</p>
                            <p className="font-medium">{selectedVehicle.year}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                          <Palette className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm text-muted-foreground">Cor</p>
                            <p className="font-medium">{selectedVehicle.color}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                          <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm text-muted-foreground">Data de Cadastro</p>
                            <p className="font-medium">{formatDate(selectedVehicle.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Owner Information */}
                  <div>
                    <h4 className="font-semibold text-foreground mb-4">Proprietário</h4>
                    {isEditing && editForm ? renderOwnerEditSection() : renderOwnerViewSection()}
                  </div>

                  <Separator />

                  {/* Inspections History */}
                  <div>
                    <h4 className="font-semibold text-foreground mb-4">
                      Histórico de Vistorias ({getVehicleInspections(selectedVehicle.id).length})
                    </h4>
                    {getVehicleInspections(selectedVehicle.id).length > 0 ? (
                      <div className="space-y-3">
                        {getVehicleInspections(selectedVehicle.id)
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map((inspection) => (
                            <div 
                              key={inspection.id} 
                              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border"
                            >
                              <div className="flex items-center gap-3">
                                {getInspectionStatusIcon(inspection.status)}
                                <div>
                                  <p className="font-medium">{formatDate(inspection.date)}</p>
                                  <p className="text-sm text-muted-foreground">
                                    Vistoriador: {inspection.employeeName}
                                  </p>
                                </div>
                              </div>
                              {getInspectionStatusBadge(inspection.status)}
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>Nenhuma vistoria realizada</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  {isEditing ? (
                    <>
                      <Button variant="outline" onClick={handleCancelEdit} className="gap-2">
                        <X className="h-4 w-4" />
                        Cancelar
                      </Button>
                      <Button onClick={handleSaveEdit} className="gap-2">
                        <Save className="h-4 w-4" />
                        Salvar Alterações
                      </Button>
                    </>
                  ) : (
                    <Button variant="outline" onClick={handleCloseDialog}>
                      Fechar
                    </Button>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
