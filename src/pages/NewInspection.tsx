import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Upload, Check, X, Camera } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useVehicles } from '@/contexts/VehiclesContext';
import { cn } from '@/lib/utils';

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

export default function NewInspection() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { addVehicle, addInspection } = useVehicles();
  const isEmployee = user?.role === 'employee';

  const [formData, setFormData] = useState({
    plate: '',
    brand: '',
    model: '',
    year: '',
    color: '',
    ownerName: '',
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleChecklistChange = (id: string, checked: boolean) => {
    setChecklist(prev =>
      prev.map(item => (item.id === id ? { ...item, checked } : item))
    );
  };

  const handlePhotoUpload = () => {
    // Simulate photo upload
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

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Create new vehicle
    const newVehicle = addVehicle({
      plate: formData.plate.toUpperCase(),
      brand: formData.brand,
      model: formData.model,
      year: parseInt(formData.year),
      color: formData.color,
      ownerId: user?.id || 'unknown',
      ownerName: formData.ownerName || user?.name || 'Proprietário',
      status: 'pending',
    });

    // Create inspection linked to vehicle
    addInspection({
      vehicleId: newVehicle.id,
      vehicle: newVehicle,
      employeeId: user?.id || '2',
      employeeName: user?.name || 'Funcionário',
      status: isEmployee ? 'pending' : 'pending',
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
                <Label htmlFor="plate">Placa</Label>
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
                <Label htmlFor="brand">Marca</Label>
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
                <Label htmlFor="model">Modelo</Label>
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
                <Label htmlFor="year">Ano</Label>
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
                <Label htmlFor="color">Cor</Label>
                <Input
                  id="color"
                  name="color"
                  placeholder="Ex: Prata"
                  value={formData.color}
                  onChange={handleInputChange}
                  required
                />
              </div>
              {isEmployee && (
                <div className="space-y-2">
                  <Label htmlFor="ownerName">Nome do Proprietário</Label>
                  <Input
                    id="ownerName"
                    name="ownerName"
                    placeholder="Nome completo"
                    value={formData.ownerName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              )}
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
