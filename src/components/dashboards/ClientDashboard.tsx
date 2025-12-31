import { Car, Shield, Clock, AlertCircle } from 'lucide-react';
import { StatsCard } from '@/components/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { mockVehicles, mockInspections, getClientVehicles, getClientInspections } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';

export function ClientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // For demo, use client id '3' or the actual user id
  const clientId = user?.id || '3';
  const clientVehicles = getClientVehicles(clientId);
  const clientInspections = getClientInspections(clientId);

  // If no vehicles for this user, show demo data
  const displayVehicles = clientVehicles.length > 0 ? clientVehicles : [mockVehicles[0]];
  const displayInspections = clientInspections.length > 0 ? clientInspections : [mockInspections[0]];

  const protectedCount = displayVehicles.filter(v => v.status === 'protected').length;
  const pendingCount = displayVehicles.filter(v => v.status === 'pending').length;
  const expiredCount = displayVehicles.filter(v => v.status === 'expired').length;

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

  const getInspectionStatusBadge = (status: string) => {
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
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Message */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Olá, {user?.name?.split(' ')[0]}!</h2>
          <p className="text-muted-foreground">Acompanhe a proteção dos seus veículos</p>
        </div>
        <Button onClick={() => navigate('/new-inspection')} className="gap-2">
          <Car className="h-4 w-4" />
          Solicitar Vistoria
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total de Veículos"
          value={displayVehicles.length}
          icon={<Car className="h-6 w-6" />}
        />
        <StatsCard
          title="Protegidos"
          value={protectedCount}
          icon={<Shield className="h-6 w-6" />}
        />
        <StatsCard
          title="Pendentes"
          value={pendingCount}
          icon={<Clock className="h-6 w-6" />}
        />
        <StatsCard
          title="Expirados"
          value={expiredCount}
          icon={<AlertCircle className="h-6 w-6" />}
        />
      </div>

      {/* Vehicles Cards */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Meus Veículos</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {displayVehicles.map((vehicle) => (
            <Card key={vehicle.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Car className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{vehicle.brand} {vehicle.model}</h4>
                      <p className="text-sm text-muted-foreground">{vehicle.plate}</p>
                    </div>
                  </div>
                  {getStatusBadge(vehicle.status)}
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Ano</p>
                    <p className="font-medium text-foreground">{vehicle.year}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Cor</p>
                    <p className="font-medium text-foreground">{vehicle.color}</p>
                  </div>
                </div>

                {vehicle.status === 'pending' && (
                  <Button 
                    variant="accent" 
                    className="w-full mt-4"
                    onClick={() => navigate('/new-inspection')}
                  >
                    Completar Vistoria
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Inspections History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Histórico de Vistorias</CardTitle>
        </CardHeader>
        <CardContent>
          {displayInspections.length > 0 ? (
            <div className="space-y-4">
              {displayInspections.map((inspection) => (
                <div
                  key={inspection.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Car className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">
                        {inspection.vehicle.brand} {inspection.vehicle.model}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(inspection.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {getInspectionStatusBadge(inspection.status)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma vistoria encontrada</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
