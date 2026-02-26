import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, Plus, MoreVertical, Shield, Briefcase, User, Mail, Phone, Trash2, Calendar, Eye, Edit, Headphones, AlertCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useAudit } from '@/contexts/AuditContext';
import { mockAssistanceData } from '@/data/mockAssistanceData';

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'employee';
  status: 'active' | 'inactive';
  avatar: string;
  createdAt: string;
}

const initialUsers: UserData[] = [
  { id: '1', name: 'Carlos Silva', email: 'carlos@protectedcar.com', phone: '(11) 99999-0001', role: 'admin', status: 'active', avatar: 'CS', createdAt: '2023-06-15' },
  { id: '2', name: 'Ana Santos', email: 'ana@protectedcar.com', phone: '(11) 99999-0002', role: 'employee', status: 'active', avatar: 'AS', createdAt: '2023-08-20' },
  { id: '3', name: 'Lucas Pereira', email: 'lucas@protectedcar.com', phone: '(11) 99999-0005', role: 'employee', status: 'active', avatar: 'LP', createdAt: '2023-11-01' },
];

export default function Users() {
  const { toast } = useToast();
  const { addAuditLog } = useAudit();
  const [users, setUsers] = useState<UserData[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isNewUserOpen, setIsNewUserOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [editUser, setEditUser] = useState<UserData | null>(null);
  const [tickets, setTickets] = useState(mockAssistanceData);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'employee' as 'admin' | 'employee'
  });

  const handleAssignTicket = (ticketId: string) => {
    if (!selectedUser) return;
    setTickets(prev => prev.map(t =>
      t.id === ticketId
        ? { ...t, assignedTo: selectedUser.id, assignedToName: selectedUser.name }
        : t
    ));
    toast({ title: "Chamado atribuído", description: `Chamado atribuído a ${selectedUser.name}` });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="default" className="gap-1"><Shield className="h-3 w-3" /> Admin</Badge>;
      case 'employee':
        return <Badge variant="secondary" className="gap-1"><Briefcase className="h-3 w-3" /> Funcionário</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' 
      ? <Badge variant="success">Ativo</Badge>
      : <Badge variant="muted">Inativo</Badge>;
  };

  const handleAddUser = () => {
    if (!newUser.name.trim() || !newUser.email.trim()) {
      toast({
        title: "Erro",
        description: "Nome e e-mail são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const avatar = newUser.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const user: UserData = {
      id: String(Date.now()),
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      status: 'active',
      avatar,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setUsers(prev => [...prev, user]);
    setIsNewUserOpen(false);
    setNewUser({ name: '', email: '', phone: '', role: 'employee' });
    
    // Audit log
    addAuditLog('CREATE', 'USER', user.id, `Criou usuário ${user.name} (${user.role === 'admin' ? 'Admin' : 'Funcionário'})`);
    
    toast({
      title: "Usuário criado",
      description: `${user.name} foi adicionado com sucesso.`
    });
  };

  const handleDeleteUser = () => {
    if (!userToDelete) return;
    
    setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
    setIsDeleteOpen(false);
    
    // Audit log
    addAuditLog('DELETE', 'USER', userToDelete.id, `Removeu usuário ${userToDelete.name}`);
    
    toast({
      title: "Usuário removido",
      description: `${userToDelete.name} foi removido com sucesso.`
    });
    
    setUserToDelete(null);
  };

  const handleViewDetails = (user: UserData) => {
    setSelectedUser(user);
    setIsDetailsOpen(true);
  };

  const handleEditUser = (user: UserData) => {
    setEditUser({ ...user });
    setIsEditOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editUser) return;

    if (!editUser.name.trim() || !editUser.email.trim()) {
      toast({
        title: "Erro",
        description: "Nome e e-mail são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const avatar = editUser.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    // Find original user for change tracking
    const originalUser = users.find(u => u.id === editUser.id);
    const changes = [];
    
    if (originalUser) {
      if (originalUser.name !== editUser.name) {
        changes.push({ field: 'Nome', previousValue: originalUser.name, newValue: editUser.name });
      }
      if (originalUser.email !== editUser.email) {
        changes.push({ field: 'E-mail', previousValue: originalUser.email, newValue: editUser.email });
      }
      if (originalUser.role !== editUser.role) {
        changes.push({ field: 'Perfil', previousValue: originalUser.role === 'admin' ? 'Admin' : 'Funcionário', newValue: editUser.role === 'admin' ? 'Admin' : 'Funcionário' });
      }
      if (originalUser.status !== editUser.status) {
        changes.push({ field: 'Status', previousValue: originalUser.status === 'active' ? 'Ativo' : 'Inativo', newValue: editUser.status === 'active' ? 'Ativo' : 'Inativo' });
      }
    }

    setUsers(prev => prev.map(u => 
      u.id === editUser.id ? { ...editUser, avatar } : u
    ));
    
    // Audit log with changes
    addAuditLog('UPDATE', 'USER', editUser.id, `Editou usuário ${editUser.name}`, changes.length > 0 ? changes : undefined);
    
    setIsEditOpen(false);
    toast({
      title: "Usuário atualizado",
      description: `${editUser.name} foi atualizado com sucesso.`
    });
    setEditUser(null);
  };

  const formatDate = (dateStr: string) => 
    new Date(dateStr).toLocaleDateString('pt-BR');

  return (
    <AppLayout title="Usuários">
      <div className="space-y-6 animate-fade-in">
        {/* Actions & Filters */}
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou e-mail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Perfil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os perfis</SelectItem>
                <SelectItem value="admin">Administradores</SelectItem>
                <SelectItem value="employee">Funcionários</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button className="gap-2" onClick={() => setIsNewUserOpen(true)}>
            <Plus className="h-4 w-4" />
            Novo Usuário
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{users.length}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{users.filter(u => u.role === 'admin').length}</p>
              <p className="text-sm text-muted-foreground">Admins</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{users.filter(u => u.role === 'employee').length}</p>
              <p className="text-sm text-muted-foreground">Funcionários</p>
            </div>
          </Card>
        </div>

        {/* Results */}
        <p className="text-sm text-muted-foreground">
          {filteredUsers.length} usuário(s) encontrado(s)
        </p>

        {/* Users List */}
        <div className="grid gap-4">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                        {user.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-foreground">{user.name}</h3>
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {user.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {user.phone}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getRoleBadge(user.role)}
                      {getStatusBadge(user.status)}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(user)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditUser(user)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => {
                            setUserToDelete(user);
                            setIsDeleteOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remover
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredUsers.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Nenhum usuário encontrado</h3>
                <p className="text-muted-foreground">Tente ajustar os filtros de busca</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* New User Dialog */}
      <Dialog open={isNewUserOpen} onOpenChange={setIsNewUserOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Usuário</DialogTitle>
            <DialogDescription>
              Adicione um novo membro à equipe.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                placeholder="Nome completo"
                value={newUser.name}
                onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@empresa.com"
                value={newUser.email}
                onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                placeholder="(11) 99999-0000"
                value={newUser.phone}
                onChange={(e) => setNewUser(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Perfil *</Label>
              <Select 
                value={newUser.role} 
                onValueChange={(value: 'admin' | 'employee') => setNewUser(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o perfil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Funcionário</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewUserOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddUser}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Alert Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Usuário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover <strong>{userToDelete?.name}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                  {selectedUser?.avatar}
                </AvatarFallback>
              </Avatar>
              {selectedUser?.name}
            </DialogTitle>
            <DialogDescription>
              Informações detalhadas do usuário
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-2">
                {getRoleBadge(selectedUser.role)}
                {getStatusBadge(selectedUser.status)}
              </div>
              
              <Separator />
              
              <div className="grid gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">E-mail</p>
                    <p className="font-medium">{selectedUser.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Telefone</p>
                    <p className="font-medium">{selectedUser.phone || 'Não informado'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Cadastrado em</p>
                    <p className="font-medium">{formatDate(selectedUser.createdAt)}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Chamados em Atendimento */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Headphones className="h-4 w-4 text-primary" />
                  Chamados em Atendimento
                </h4>
                {(() => {
                  const userTickets = tickets.filter(t => t.assignedTo === selectedUser.id);
                  if (userTickets.length === 0) {
                    return <p className="text-sm text-muted-foreground">Nenhum chamado em atendimento.</p>;
                  }
                  return (
                    <div className="space-y-2">
                      {userTickets.map(ticket => (
                        <div key={ticket.id} className="flex items-center justify-between rounded-lg border p-3">
                          <div>
                            <p className="text-sm font-medium">{ticket.vehicleBrand} {ticket.vehicleModel}</p>
                            <p className="text-xs text-muted-foreground">{ticket.plate} • {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}</p>
                          </div>
                          <Badge variant={ticket.status === 'atendido' ? 'success' : 'warning'}>
                            {ticket.status === 'atendido' ? 'Atendido' : 'Pendente'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              <Separator />

              {/* Chamados Disponíveis */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  Chamados Disponíveis (sem responsável)
                </h4>
                {(() => {
                  const availableTickets = tickets.filter(t => t.assignedTo === null && t.status === 'pendente');
                  if (availableTickets.length === 0) {
                    return <p className="text-sm text-muted-foreground">Nenhum chamado disponível.</p>;
                  }
                  return (
                    <div className="space-y-2">
                      {availableTickets.map(ticket => (
                        <div key={ticket.id} className="flex items-center justify-between rounded-lg border p-3">
                          <div>
                            <p className="text-sm font-medium">{ticket.requesterName}</p>
                            <p className="text-xs text-muted-foreground">{ticket.vehicleBrand} {ticket.vehicleModel} • {ticket.plate}</p>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => handleAssignTicket(ticket.id)}>Atribuir</Button>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              Fechar
            </Button>
            <Button onClick={() => {
              setIsDetailsOpen(false);
              if (selectedUser) handleEditUser(selectedUser);
            }}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Atualize as informações do usuário.
            </DialogDescription>
          </DialogHeader>
          {editUser && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome *</Label>
                <Input
                  id="edit-name"
                  placeholder="Nome completo"
                  value={editUser.name}
                  onChange={(e) => setEditUser(prev => prev ? { ...prev, name: e.target.value } : null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">E-mail *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  placeholder="email@empresa.com"
                  value={editUser.email}
                  onChange={(e) => setEditUser(prev => prev ? { ...prev, email: e.target.value } : null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Telefone</Label>
                <Input
                  id="edit-phone"
                  placeholder="(11) 99999-0000"
                  value={editUser.phone}
                  onChange={(e) => setEditUser(prev => prev ? { ...prev, phone: e.target.value } : null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Perfil *</Label>
                <Select 
                  value={editUser.role} 
                  onValueChange={(value: 'admin' | 'employee') => setEditUser(prev => prev ? { ...prev, role: value } : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Funcionário</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Status</Label>
                  <p className="text-sm text-muted-foreground">
                    {editUser.status === 'active' ? 'Usuário ativo' : 'Usuário inativo'}
                  </p>
                </div>
                <Switch
                  checked={editUser.status === 'active'}
                  onCheckedChange={(checked) => 
                    setEditUser(prev => prev ? { ...prev, status: checked ? 'active' : 'inactive' } : null)
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditOpen(false);
              setEditUser(null);
            }}>
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
