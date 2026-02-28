import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Truck } from 'lucide-react';
import { toast } from 'sonner';
import type { AssistanceTicket, Priority } from '@/data/mockAssistanceData';

interface TowRequestTabProps {
  onCreateTicket: (ticket: AssistanceTicket) => void;
}

export function TowRequestTab({ onCreateTicket }: TowRequestTabProps) {
  const [plate, setPlate] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('media');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plate || !location || !description) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const newTicket: AssistanceTicket = {
      id: `a${Date.now()}`,
      requesterName: 'Solicitante',
      vehicleBrand: '',
      vehicleModel: '',
      plate,
      status: 'pendente',
      assignedTo: null,
      assignedToName: null,
      createdAt: new Date().toISOString().split('T')[0],
      description,
      type: 'guincho',
      priority,
      location,
      closedAt: null,
      partnerId: null,
      partnerName: null,
      trackingStatus: 'aguardando',
      estimatedArrival: null,
    };

    onCreateTicket(newTicket);
    toast.success('Solicitação de guincho criada com sucesso!');
    setPlate('');
    setLocation('');
    setDescription('');
    setPriority('media');
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Solicitar Guincho
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="plate">Placa do Veículo *</Label>
            <Input
              id="plate"
              placeholder="ABC-1234"
              value={plate}
              onChange={(e) => setPlate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Localização *</Label>
            <Input
              id="location"
              placeholder="Endereço ou ponto de referência"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição do Problema *</Label>
            <Textarea
              id="description"
              placeholder="Descreva o problema..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="priority">Prioridade</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="media">Média</SelectItem>
                <SelectItem value="baixa">Baixa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full">
            <Truck className="h-4 w-4 mr-2" />
            Solicitar Guincho
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
