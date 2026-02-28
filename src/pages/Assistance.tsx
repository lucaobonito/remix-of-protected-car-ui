import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Headphones, Clock, CheckCircle2, UserX, HandHelping, Undo2 } from 'lucide-react';
import { mockAssistanceData } from '@/data/mockAssistanceData';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function Assistance() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState(mockAssistanceData);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const handleAssignTicket = (ticketId: string) => {
    if (!user) return;
    setTickets(prev => prev.map(t =>
      t.id === ticketId
        ? { ...t, assignedTo: user.id, assignedToName: user.name }
        : t
    ));
    toast.success('Chamado atribuído a você');
  };

  const handleReleaseTicket = (ticketId: string) => {
    setTickets(prev => prev.map(t =>
      t.id === ticketId
        ? { ...t, assignedTo: null, assignedToName: null }
        : t
    ));
    toast.success('Chamado devolvido para a fila');
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch =
      ticket.requesterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.plate.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const total = tickets.length;
  const pendentes = tickets.filter(t => t.status === 'pendente').length;
  const atendidos = tickets.filter(t => t.status === 'atendido').length;
  const semResponsavel = tickets.filter(t => t.assignedTo === null).length;

  const myTickets = tickets.filter(t => t.assignedTo === user?.id);
  const availableTickets = tickets.filter(t => t.assignedTo === null && t.status === 'pendente');

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('pt-BR');

  const TicketTable = ({ data, showAssignButton = false, showReleaseButton = false }: { data: typeof tickets; showAssignButton?: boolean; showReleaseButton?: boolean }) => (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Solicitante</TableHead>
              <TableHead>Veículo</TableHead>
              <TableHead>Placa</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
              {(showAssignButton || showReleaseButton) && <TableHead className="text-right">Ação</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell className="font-medium">{ticket.requesterName}</TableCell>
                <TableCell>{ticket.vehicleBrand} {ticket.vehicleModel}</TableCell>
                <TableCell className="font-mono">{ticket.plate}</TableCell>
                <TableCell>
                  {ticket.assignedToName ? (
                    <span className="text-foreground">{ticket.assignedToName}</span>
                  ) : (
                    <span className="text-muted-foreground italic">Não atribuído</span>
                  )}
                </TableCell>
                <TableCell>
                  {ticket.status === 'atendido' ? (
                    <Badge variant="success">Atendido</Badge>
                  ) : (
                    <Badge variant="warning">Pendente</Badge>
                  )}
                </TableCell>
                <TableCell>{formatDate(ticket.createdAt)}</TableCell>
                {showAssignButton && (
                  <TableCell className="text-right">
                    <Button size="sm" onClick={() => handleAssignTicket(ticket.id)}>
                      <HandHelping className="h-4 w-4 mr-1" />
                      Pegar Chamado
                    </Button>
                  </TableCell>
                )}
                {showReleaseButton && (
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => handleReleaseTicket(ticket.id)}>
                      <Undo2 className="h-4 w-4 mr-1" />
                      Devolver
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={(showAssignButton || showReleaseButton) ? 7 : 6} className="text-center py-8 text-muted-foreground">
                  Nenhum chamado encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <AppLayout title="Assistência">
      <div className="space-y-6 animate-fade-in">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Headphones className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{pendentes}</p>
                <p className="text-sm text-muted-foreground">Pendentes</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{atendidos}</p>
                <p className="text-sm text-muted-foreground">Atendidos</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <UserX className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{semResponsavel}</p>
                <p className="text-sm text-muted-foreground">Sem Responsável</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="todos">
          <TabsList>
            <TabsTrigger value="todos">Todos os Chamados</TabsTrigger>
            <TabsTrigger value="meus">Meus Chamados ({myTickets.length})</TabsTrigger>
            <TabsTrigger value="disponiveis">Disponíveis ({availableTickets.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="todos" className="space-y-4 mt-4">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou placa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-44">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="atendido">Atendido</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground">
              {filteredTickets.length} chamado(s) encontrado(s)
            </p>
            <TicketTable data={filteredTickets} />
          </TabsContent>

          <TabsContent value="meus" className="mt-4">
            <TicketTable data={myTickets} showReleaseButton />
          </TabsContent>

          <TabsContent value="disponiveis" className="mt-4">
            <TicketTable data={availableTickets} showAssignButton />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
