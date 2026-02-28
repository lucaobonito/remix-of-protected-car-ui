import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, ChevronRight } from 'lucide-react';
import type { AssistanceTicket, TrackingStatus } from '@/data/mockAssistanceData';
import { trackingLabels } from '@/data/mockAssistanceData';

const steps: TrackingStatus[] = ['aguardando', 'a_caminho', 'no_local', 'concluido'];

function TrackingTimeline({ current }: { current: TrackingStatus }) {
  const currentIdx = steps.indexOf(current);
  return (
    <div className="flex items-center gap-1">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center gap-1">
          <div
            className={`flex items-center justify-center rounded-full h-8 w-8 text-xs font-bold border-2 transition-colors ${
              i <= currentIdx
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-muted text-muted-foreground border-muted-foreground/30'
            }`}
          >
            {i + 1}
          </div>
          <span className={`text-xs hidden sm:inline ${i <= currentIdx ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
            {trackingLabels[step]}
          </span>
          {i < steps.length - 1 && (
            <ChevronRight className={`h-4 w-4 ${i < currentIdx ? 'text-primary' : 'text-muted-foreground/30'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

interface TrackingTabProps {
  tickets: AssistanceTicket[];
  onAdvanceStatus: (ticketId: string) => void;
}

export function TrackingTab({ tickets, onAdvanceStatus }: TrackingTabProps) {
  const trackable = tickets.filter(
    t => t.status === 'pendente' && t.assignedTo !== null && t.trackingStatus !== 'concluido'
  );

  if (trackable.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Nenhum chamado em andamento para rastrear.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {trackable.map(t => (
        <Card key={t.id}>
          <CardContent className="p-5 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-foreground">{t.requesterName}</p>
                <p className="text-sm text-muted-foreground">
                  {t.vehicleBrand} {t.vehicleModel} • <span className="font-mono">{t.plate}</span>
                </p>
              </div>
              <Badge variant="outline">{t.priority === 'alta' ? '🔴 Alta' : t.priority === 'media' ? '🟡 Média' : '🟢 Baixa'}</Badge>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {t.location}
            </div>

            {t.estimatedArrival !== null && t.estimatedArrival > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Chegada estimada: ~{t.estimatedArrival} min
              </div>
            )}

            {t.partnerName && (
              <p className="text-sm">Parceiro: <span className="font-medium text-foreground">{t.partnerName}</span></p>
            )}

            <TrackingTimeline current={t.trackingStatus} />

            {t.trackingStatus !== 'concluido' && (
              <Button size="sm" variant="outline" onClick={() => onAdvanceStatus(t.id)}>
                Avançar Status
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
