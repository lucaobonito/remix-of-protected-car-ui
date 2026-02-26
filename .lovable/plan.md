
## Plano: Aba de Assistencia para Funcionarios

### Resumo

Permitir que funcionarios (role `employee`) acessem a pagina de Assistencia, vejam todos os chamados abertos, quem esta atendendo cada caso, e possam pegar chamados disponiveis para si.

### Alteracoes

#### 1. `src/components/AppSidebar.tsx` (linha 43)
- Alterar o item "Assistencia" de `roles: ['admin']` para `roles: ['admin', 'employee']`

#### 2. `src/components/AppLayout.tsx` (linha 47)
- Alterar o item "Assistencia" de `roles: ['admin']` para `roles: ['admin', 'employee']`

#### 3. `src/pages/Assistance.tsx`
- Adicionar estado local `tickets` com `useState(mockAssistanceData)` para permitir atribuicao em tempo real
- Obter o usuario logado via `useAuth()`
- Adicionar handler `handleAssignTicket` que atribui o chamado ao usuario logado (`user.id` / `user.name`)
- Reorganizar a pagina com **3 abas** usando componente `Tabs`:
  - **"Todos os Chamados"**: tabela atual com todos os chamados, filtros e cards de resumo
  - **"Meus Chamados"**: chamados atribuidos ao usuario logado (`assignedTo === user.id`)
  - **"Disponiveis"**: chamados sem responsavel (`assignedTo === null && status === 'pendente'`) com botao "Pegar Chamado"
- Na coluna "Responsavel" da tabela principal, mostrar quem esta atendendo cada caso
- Na aba "Disponiveis", cada item tera um botao "Pegar Chamado" que chama `handleAssignTicket`
- Toast de confirmacao ao pegar um chamado
- Para admin, as 3 abas aparecem normalmente; para employee, tambem

### Detalhes Tecnicos

**Estado e handler:**
```
const [tickets, setTickets] = useState(mockAssistanceData);
const { user } = useAuth();

const handleAssignTicket = (ticketId: string) => {
  if (!user) return;
  setTickets(prev => prev.map(t =>
    t.id === ticketId
      ? { ...t, assignedTo: user.id, assignedToName: user.name }
      : t
  ));
  toast.success(`Chamado atribuído a você`);
};
```

**Estrutura de abas:**
```
<Tabs defaultValue="todos">
  <TabsList>
    <TabsTrigger value="todos">Todos</TabsTrigger>
    <TabsTrigger value="meus">Meus Chamados</TabsTrigger>
    <TabsTrigger value="disponiveis">Disponíveis</TabsTrigger>
  </TabsList>
  <TabsContent value="todos">... tabela completa ...</TabsContent>
  <TabsContent value="meus">... filtrado por user.id ...</TabsContent>
  <TabsContent value="disponiveis">... sem responsavel + botao ...</TabsContent>
</Tabs>
```

**Filtros usam `tickets` (estado local) em vez de `mockAssistanceData` direto.**

### Arquivos Afetados

| Arquivo | Acao |
|---------|------|
| `src/components/AppSidebar.tsx` | Liberar acesso para employee |
| `src/components/AppLayout.tsx` | Liberar acesso para employee |
| `src/pages/Assistance.tsx` | Adicionar abas, estado local, botao "Pegar Chamado" |
