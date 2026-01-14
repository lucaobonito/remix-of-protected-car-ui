import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Upload, Check, Camera, User, MapPin, Phone, Mail, Search } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useVehicles } from '@/contexts/VehiclesContext';
import { cn } from '@/lib/utils';

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

const brazilianStates = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export default function NewInspection() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { addVehicle, addInspection } = useVehicles();
  const isEmployee = user?.role === 'employee';

  const [formData, setFormData] = useState({
    // Dados do Veículo
    plate: '',
    brand: '',
    model: '',
    year: '',
    color: '',
    // Dados do Cliente
    ownerName: '',
    ownerCpf: '',
    ownerPhone: '',
    ownerWhatsapp: '',
    ownerEmail: '',
    ownerCep: '',
    ownerAddress: '',
    ownerAddressNumber: '',
    ownerAddressComplement: '',
    ownerNeighborhood: '',
    ownerCity: '',
    ownerState: '',
    notes: '',
  });

  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: 'exterior', label: 'Exterior (carroceria, pintura)', checked: false },
    { id: 'interior', label: 'Interior (bancos, painel)', checked: false },
    { id: 'engine', label: 'Motor (funcionamento, vazamentos)', checked: false },
    { id: 'tires', label: 'Pneus (estado, calibragem)', checked: false },
    { id: 'documents', label: 'Documentação (CRLV atualizado)', checked: false },
    { id: 'lights', label: 'Iluminação (faróis, setas, lanternas)', checked: false },
  ]);

  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearchingCep, setIsSearchingCep] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStateChange = (value: string) => {
    setFormData(prev => ({ ...prev, ownerState: value }));
  };

  const formatCpf = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const formatCep = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{5})(\d)/, '$1-$2').replace(/(-\d{3})\d+?$/, '$1');
  };

  const handleFormattedInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'ownerCpf') {
      formattedValue = formatCpf(value);
    } else if (name === 'ownerPhone' || name === 'ownerWhatsapp') {
      formattedValue = formatPhone(value);
    } else if (name === 'ownerCep') {
      formattedValue = formatCep(value);
    }

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
  };

  const handleSearchCep = async () => {
    const cep = formData.ownerCep.replace(/\D/g, '');
    if (cep.length !== 8) {
      toast({
        title: 'CEP inválido',
        description: 'Digite um CEP válido com 8 dígitos.',
        variant: 'destructive',
      });
      return;
    }

    setIsSearchingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      
      if (data.erro) {
        toast({
          title: 'CEP não encontrado',
          description: 'Verifique o CEP e tente novamente.',
          variant: 'destructive',
        });
      } else {
        setFormData(prev => ({
          ...prev,
          ownerAddress: data.logradouro || '',
          ownerNeighborhood: data.bairro || '',
          ownerCity: data.localidade || '',
          ownerState: data.uf || '',
        }));
        toast({
          title: 'Endereço encontrado',
          description: 'Os campos foram preenchidos automaticamente.',
        });
      }
    } catch {
      toast({
        title: 'Erro ao buscar CEP',
        description: 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setIsSearchingCep(false);
    }
  };

  const handleChecklistChange = (id: string, checked: boolean) => {
    setChecklist(prev =>
      prev.map(item => (item.id === id ? { ...item, checked } : item))
    );
  };

  const handlePhotoUpload = () => {
    const newPhoto = `photo-${photos.length + 1}`;
    setPhotos(prev => [...prev, newPhoto]);
    toast({
      title: 'Foto adicionada',
      description: 'A foto foi anexada à vistoria.',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    const newVehicle = addVehicle({
      plate: formData.plate.toUpperCase(),
      brand: formData.brand,
      model: formData.model,
      year: parseInt(formData.year),
      color: formData.color,
      ownerId: user?.id || 'unknown',
      ownerName: formData.ownerName || user?.name || 'Proprietário',
      ownerCpf: formData.ownerCpf,
      ownerPhone: formData.ownerPhone,
      ownerWhatsapp: formData.ownerWhatsapp,
      ownerEmail: formData.ownerEmail,
      ownerCep: formData.ownerCep,
      ownerAddress: formData.ownerAddress,
      ownerAddressNumber: formData.ownerAddressNumber,
      ownerAddressComplement: formData.ownerAddressComplement,
      ownerNeighborhood: formData.ownerNeighborhood,
      ownerCity: formData.ownerCity,
      ownerState: formData.ownerState,
      status: 'pending',
    });

    addInspection({
      vehicleId: newVehicle.id,
      vehicle: newVehicle,
      employeeId: user?.id || '2',
      employeeName: user?.name || 'Funcionário',
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      photos: photos,
      checklist: {
        exterior: checklist.find(c => c.id === 'exterior')?.checked || false,
        interior: checklist.find(c => c.id === 'interior')?.checked || false,
        engine: checklist.find(c => c.id === 'engine')?.checked || false,
        tires: checklist.find(c => c.id === 'tires')?.checked || false,
        documents: checklist.find(c => c.id === 'documents')?.checked || false,
        lights: checklist.find(c => c.id === 'lights')?.checked || false,
      },
      notes: formData.notes || undefined,
    });

    toast({
      title: 'Vistoria enviada!',
      description: isEmployee 
        ? 'A vistoria foi registrada com sucesso.' 
        : 'Sua vistoria foi enviada para análise.',
    });

    navigate('/dashboard');
  };

  const allChecked = checklist.every(item => item.checked);
  const checkProgress = (checklist.filter(item => item.checked).length / checklist.length) * 100;

  return (
    <AppLayout title={isEmployee ? 'Realizar Vistoria' : 'Solicitar Vistoria'}>
      <div className="max-w-4xl mx-auto animate-fade-in">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Vehicle Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5 text-primary" />
                Dados do Veículo
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="plate">Placa *</Label>
                <Input
                  id="plate"
                  name="plate"
                  placeholder="ABC-1234"
                  value={formData.plate}
                  onChange={handleInputChange}
                  required
                  className="uppercase"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">Marca *</Label>
                <Input
                  id="brand"
                  name="brand"
                  placeholder="Ex: Toyota"
                  value={formData.brand}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Modelo *</Label>
                <Input
                  id="model"
                  name="model"
                  placeholder="Ex: Corolla"
                  value={formData.model}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Ano *</Label>
                <Input
                  id="year"
                  name="year"
                  type="number"
                  placeholder="Ex: 2022"
                  value={formData.year}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Cor *</Label>
                <Input
                  id="color"
                  name="color"
                  placeholder="Ex: Prata"
                  value={formData.color}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Dados do Cliente (Proprietário)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Identification */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Identificação
                </h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="ownerName">Nome Completo *</Label>
                    <Input
                      id="ownerName"
                      name="ownerName"
                      placeholder="Nome completo do proprietário"
                      value={formData.ownerName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ownerCpf">CPF *</Label>
                    <Input
                      id="ownerCpf"
                      name="ownerCpf"
                      placeholder="000.000.000-00"
                      value={formData.ownerCpf}
                      onChange={handleFormattedInput}
                      maxLength={14}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Contato
                </h4>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="ownerPhone">Telefone *</Label>
                    <Input
                      id="ownerPhone"
                      name="ownerPhone"
                      placeholder="(00) 00000-0000"
                      value={formData.ownerPhone}
                      onChange={handleFormattedInput}
                      maxLength={15}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ownerWhatsapp">WhatsApp</Label>
                    <Input
                      id="ownerWhatsapp"
                      name="ownerWhatsapp"
                      placeholder="(00) 00000-0000"
                      value={formData.ownerWhatsapp}
                      onChange={handleFormattedInput}
                      maxLength={15}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2 lg:col-span-1">
                    <Label htmlFor="ownerEmail">E-mail *</Label>
                    <Input
                      id="ownerEmail"
                      name="ownerEmail"
                      type="email"
                      placeholder="email@exemplo.com"
                      value={formData.ownerEmail}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Endereço
                </h4>
                <div className="grid gap-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="ownerCep">CEP *</Label>
                      <div className="flex gap-2">
                        <Input
                          id="ownerCep"
                          name="ownerCep"
                          placeholder="00000-000"
                          value={formData.ownerCep}
                          onChange={handleFormattedInput}
                          maxLength={9}
                          required
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={handleSearchCep}
                          disabled={isSearchingCep}
                          title="Buscar CEP"
                        >
                          <Search className={cn("h-4 w-4", isSearchingCep && "animate-spin")} />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="ownerAddress">Endereço *</Label>
                      <Input
                        id="ownerAddress"
                        name="ownerAddress"
                        placeholder="Rua, Avenida..."
                        value={formData.ownerAddress}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="ownerAddressNumber">Número *</Label>
                      <Input
                        id="ownerAddressNumber"
                        name="ownerAddressNumber"
                        placeholder="123"
                        value={formData.ownerAddressNumber}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ownerAddressComplement">Complemento</Label>
                      <Input
                        id="ownerAddressComplement"
                        name="ownerAddressComplement"
                        placeholder="Apt, Bloco..."
                        value={formData.ownerAddressComplement}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ownerNeighborhood">Bairro *</Label>
                      <Input
                        id="ownerNeighborhood"
                        name="ownerNeighborhood"
                        placeholder="Bairro"
                        value={formData.ownerNeighborhood}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="ownerCity">Cidade *</Label>
                      <Input
                        id="ownerCity"
                        name="ownerCity"
                        placeholder="Cidade"
                        value={formData.ownerCity}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ownerState">Estado *</Label>
                      <Select value={formData.ownerState} onValueChange={handleStateChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o estado" />
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
            </CardContent>
          </Card>

          {/* Photo Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                Fotos do Veículo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                {photos.map((photo, index) => (
                  <div
                    key={photo}
                    className="aspect-square rounded-lg bg-muted flex items-center justify-center border-2 border-success text-success"
                  >
                    <Check className="h-8 w-8" />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handlePhotoUpload}
                  className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary"
                >
                  <Upload className="h-8 w-8" />
                  <span className="text-xs font-medium">Adicionar foto</span>
                </button>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Adicione fotos da frente, traseira, laterais e interior do veículo.
              </p>
            </CardContent>
          </Card>

          {/* Checklist */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  Checklist de Vistoria
                </CardTitle>
                <span className="text-sm text-muted-foreground">
                  {checklist.filter(item => item.checked).length} de {checklist.length} itens
                </span>
              </div>
              {/* Progress Bar */}
              <div className="h-2 rounded-full bg-muted overflow-hidden mt-2">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${checkProgress}%` }}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    'flex items-center space-x-3 p-4 rounded-lg border transition-colors',
                    item.checked
                      ? 'border-success/50 bg-success/5'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <Checkbox
                    id={item.id}
                    checked={item.checked}
                    onCheckedChange={(checked) => handleChecklistChange(item.id, checked as boolean)}
                  />
                  <Label
                    htmlFor={item.id}
                    className={cn(
                      'cursor-pointer flex-1',
                      item.checked && 'text-success'
                    )}
                  >
                    {item.label}
                  </Label>
                  {item.checked && <Check className="h-5 w-5 text-success" />}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                name="notes"
                placeholder="Adicione observações sobre o estado do veículo..."
                value={formData.notes}
                onChange={handleInputChange}
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Submit Actions */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard')}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !allChecked || photos.length < 1}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Enviando...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  {isEmployee ? 'Finalizar Vistoria' : 'Enviar Vistoria'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
