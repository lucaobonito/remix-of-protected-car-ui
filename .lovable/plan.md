
## Plano: Botao de Devolver/Liberar Chamado

### Resumo

Adicionar um botao "Devolver" na aba "Meus Chamados" para que o funcionario possa liberar um chamado que pegou, tornando-o disponivel novamente na fila.

### Alteracoes

#### `src/pages/Assistance.tsx`

1. **Novo handler `handleReleaseTicket`**: Reseta `assignedTo` e `assignedToName` para `null`, exibindo toast de confirmacao.

```tsx
const handleReleaseTicket = (ticketId: string) => {
  setTickets(prev => prev.map(t =>
    t.id === ticketId
      ? { ...t, assignedTo: null, assignedToName: null }
      : t
  ));
  toast.success('Chamado devolvido para a fila');
};
```

2. **Atualizar componente `TicketTable`**: Adicionar prop `showReleaseButton` (similar a `showAssignButton`). Quando ativa, exibe uma coluna "Acao" com um botao "Devolver" (icone `Undo2` do lucide-react) em cada linha.

3. **Aba "Meus Chamados"**: Passar `showReleaseButton` para a tabela:
```tsx
<TicketTable data={myTickets} showReleaseButton />
```

4. **Import**: Adicionar `Undo2` aos imports do lucide-react.

### Arquivos Afetados

| Arquivo | Acao |
|---------|------|
| `src/pages/Assistance.tsx` | Adicionar handler, prop e botao "Devolver" |
