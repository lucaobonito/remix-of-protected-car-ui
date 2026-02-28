import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Star } from 'lucide-react';
import { mockPartners, typeLabels } from '@/data/mockAssistanceData';
import type { TicketType } from '@/data/mockAssistanceData';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`h-4 w-4 ${i <= Math.round(rating) ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground/30'}`}
        />
      ))}
      <span className="text-sm text-muted-foreground ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

export function PartnersTab() {
  const [serviceFilter, setServiceFilter] = useState<string>('all');

  const filtered = mockPartners.filter(p => {
    if (serviceFilter === 'all') return true;
    return p.services.includes(serviceFilter as TicketType);
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Select value={serviceFilter} onValueChange={setServiceFilter}>
          <SelectTrigger className="w-full md:w-52">
            <SelectValue placeholder="Filtrar por serviço" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Serviços</SelectItem>
            {Object.entries(typeLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Serviços</TableHead>
                <TableHead>Região</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Avaliação</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {p.services.map(s => (
                        <Badge key={s} variant="secondary">{typeLabels[s]}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{p.region}</TableCell>
                  <TableCell className="font-mono">{p.phone}</TableCell>
                  <TableCell><StarRating rating={p.rating} /></TableCell>
                  <TableCell>
                    <Badge variant={p.active ? 'success' : 'outline'}>
                      {p.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum parceiro encontrado
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
