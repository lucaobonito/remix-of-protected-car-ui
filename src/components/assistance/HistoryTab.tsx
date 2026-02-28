import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import type { AssistanceTicket } from '@/data/mockAssistanceData';
import { typeLabels } from '@/data/mockAssistanceData';

const typeBadgeVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  guincho: 'destructive',
  pneu: 'default',
  bateria: 'secondary',
  chaveiro: 'outline',
  outros: 'secondary',
};

interface HistoryTabProps {
  tickets: AssistanceTicket[];
}

export function HistoryTab({ tickets }: HistoryTabProps) {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const closedTickets = tickets.filter(t => t.status === 'atendido');

  const filtered = closedTickets.filter(t => {
    if (dateFrom && t.createdAt < dateFrom) return false;
    if (dateTo && t.createdAt > dateTo) return false;
    return true;
  });

  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString('pt-BR') : '-';

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="space-y-1">
          <Label>Data Início</Label>
          <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Data Fim</Label>
          <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{filtered.length} atendimento(s) encontrado(s)</p>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Solicitante</TableHead>
                <TableHead>Veículo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Parceiro</TableHead>
                <TableHead>Abertura</TableHead>
                <TableHead>Encerramento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(t => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.requesterName}</TableCell>
                  <TableCell>{t.vehicleBrand} {t.vehicleModel}</TableCell>
                  <TableCell>
                    <Badge variant={typeBadgeVariant[t.type] || 'secondary'}>
                      {typeLabels[t.type]}
                    </Badge>
                  </TableCell>
                  <TableCell>{t.assignedToName || '-'}</TableCell>
                  <TableCell>{t.partnerName || '-'}</TableCell>
                  <TableCell>{formatDate(t.createdAt)}</TableCell>
                  <TableCell>{formatDate(t.closedAt)}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhum atendimento encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
