import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, Plus, MoreVertical, Shield, Briefcase, User, Mail, Phone } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'employee' | 'client';
  status: 'active' | 'inactive';
  avatar: string;
  createdAt: string;
}

const mockUsers: UserData[] = [
  { id: '1', name: 'Carlos Silva', email: 'carlos@protectedcar.com', phone: '(11) 99999-0001', role: 'admin', status: 'active', avatar: 'CS', createdAt: '2023-06-15' },
  { id: '2', name: 'Ana Santos', email: 'ana@protectedcar.com', phone: '(11) 99999-0002', role: 'employee', status: 'active', avatar: 'AS', createdAt: '2023-08-20' },
  { id: '3', name: 'João Oliveira', email: 'joao@email.com', phone: '(11) 99999-0003', role: 'client', status: 'active', avatar: 'JO', createdAt: '2024-01-10' },
  { id: '4', name: 'Maria Costa', email: 'maria@email.com', phone: '(11) 99999-0004', role: 'client', status: 'active', avatar: 'MC', createdAt: '2024-02-15' },
  { id: '5', name: 'Lucas Pereira', email: 'lucas@protectedcar.com', phone: '(11) 99999-0005', role: 'employee', status: 'active', avatar: 'LP', createdAt: '2023-11-01' },
  { id: '6', name: 'Pedro Lima', email: 'pedro@email.com', phone: '(11) 99999-0006', role: 'client', status: 'inactive', avatar: 'PL', createdAt: '2024-03-05' },
];

export default function Users() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredUsers = mockUsers.filter(user => {
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
      case 'client':
        return <Badge variant="outline" className="gap-1"><User className="h-3 w-3" /> Cliente</Badge>;
      default:
        return <Badge variant="muted">{role}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' 
      ? <Badge variant="success">Ativo</Badge>
      : <Badge variant="muted">Inativo</Badge>;
  };

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
                <SelectItem value="client">Clientes</SelectItem>
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

          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Usuário
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{mockUsers.length}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{mockUsers.filter(u => u.role === 'admin').length}</p>
              <p className="text-sm text-muted-foreground">Admins</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{mockUsers.filter(u => u.role === 'employee').length}</p>
              <p className="text-sm text-muted-foreground">Funcionários</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{mockUsers.filter(u => u.role === 'client').length}</p>
              <p className="text-sm text-muted-foreground">Clientes</p>
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
                        <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Desativar</DropdownMenuItem>
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
    </AppLayout>
  );
}
