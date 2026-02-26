

## Plano: Botao de Atribuir Chamado no Dialog de Detalhes do Usuario

### Resumo

Adicionar um botao "Atribuir" ao lado de cada chamado disponivel (sem responsavel) no dialog de detalhes do usuario. Ao clicar, o chamado sera atribuido ao usuario selecionado, atualizando o estado local e mostrando um toast de confirmacao.

### Alteracoes

#### 1. `src/data/mockAssistanceData.ts`
- Alterar `mockAssistanceData` de `const` para `let` (exportar mutavel) **OU** manter const e gerenciar estado no componente

#### 2. `src/pages/Users.tsx`
- Adicionar estado local `tickets` com `useState` inicializado a partir de `mockAssistanceData`
- Na secao "Chamados Disponiveis", adicionar um botao "Atribuir" em cada item
- Ao clicar no botao:
  - Atualizar `assignedTo` para o `selectedUser.id` e `assignedToName` para `selectedUser.name`
  - Exibir toast: "Chamado atribuido a [nome do usuario]"
- A secao "Chamados em Atendimento" tambem passara a usar o estado local `tickets` para refletir as atribuicoes em tempo real

### Detalhes Tecnicos

**Estado local no Users.tsx:**
```tsx
const [tickets, setTickets] = useState(mockAssistanceData);
```

**Handler de atribuicao:**
```tsx
const handleAssignTicket = (ticketId: string) => {
  if (!selectedUser) return;
  setTickets(prev => prev.map(t => 
    t.id === ticketId 
      ? { ...t, assignedTo: selectedUser.id, assignedToName: selectedUser.name }
      : t
  ));
  toast({ title: "Chamado atribuído", description: `Chamado atribuído a ${selectedUser.name}` });
};
```

**Botao no item de chamado disponivel (linha ~559-565):**
- Substituir o `Badge "Pendente"` por um `Button` com texto "Atribuir" que chama `handleAssignTicket(ticket.id)`

**Filtros usam `tickets` ao inves de `mockAssistanceData`:**
- `userTickets = tickets.filter(t => t.assignedTo === selectedUser.id)`
- `availableTickets = tickets.filter(t => t.assignedTo === null && t.status === 'pendente')`

### Arquivos Afetados

| Arquivo | Acao |
|---------|------|
| `src/pages/Users.tsx` | Adicionar estado `tickets`, handler `handleAssignTicket`, botao "Atribuir" |

