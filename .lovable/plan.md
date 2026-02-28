

## Plano: Expandir Modulo de Assistencia

### Resumo

Adicionar 4 novas funcionalidades ao modulo de Assistencia: solicitacao de guincho, historico de atendimentos, parceiros credenciados e rastreamento em tempo real. Cada funcionalidade sera uma nova aba na pagina de Assistencia.

### Alteracoes

#### 1. `src/data/mockAssistanceData.ts`

Expandir o tipo `AssistanceTicket` com novos campos:
- `type`: tipo do chamado (`'guincho' | 'pneu' | 'bateria' | 'chaveiro' | 'outros'`)
- `priority`: prioridade (`'alta' | 'media' | 'baixa'`)
- `location`: endereco/localizacao do solicitante
- `closedAt`: data de encerramento (para historico)
- `partnerId`: ID do parceiro credenciado atribuido
- `partnerName`: nome do parceiro
- `trackingStatus`: status de rastreamento (`'aguardando' | 'a_caminho' | 'no_local' | 'concluido'`)
- `estimatedArrival`: tempo estimado de chegada (minutos)

Adicionar novos dados mock:
- `mockPartners`: lista de parceiros credenciados com nome, tipo de servico, telefone, regiao, avaliacao
- Atualizar os tickets existentes com os novos campos

#### 2. `src/pages/Assistance.tsx`

Reorganizar as abas para incluir as novas funcionalidades:

**Abas atualizadas:**
1. **Todos os Chamados** (existente)
2. **Meus Chamados** (existente)
3. **Disponíveis** (existente)
4. **Solicitar Guincho** (novo) - Formulario para abrir solicitacao de guincho com campos: nome, placa, localizacao, descricao do problema e prioridade
5. **Historico** (novo) - Lista de chamados com status "atendido", com filtro por data e possibilidade de ver detalhes
6. **Parceiros** (novo) - Tabela de parceiros credenciados com nome, servicos, regiao, telefone e avaliacao (estrelas)
7. **Rastreamento** (novo) - Visualizacao dos chamados em andamento com status em tempo real (timeline visual: Aguardando > A Caminho > No Local > Concluido), tempo estimado e parceiro designado

**Detalhes de cada nova aba:**

**Solicitar Guincho:**
- Formulario com campos: Placa do veiculo (select dos veiculos cadastrados), Localizacao (input texto), Descricao do problema (textarea), Prioridade (select: Alta/Media/Baixa)
- Botao "Solicitar Guincho" que cria um novo ticket no estado local com `type: 'guincho'`, `status: 'pendente'`
- Toast de confirmacao

**Historico:**
- Tabela com chamados encerrados (`status === 'atendido'`)
- Colunas: Solicitante, Veiculo, Tipo, Responsavel, Data Abertura, Data Encerramento
- Filtro por periodo (data inicio / data fim)
- Badge colorido por tipo de servico

**Parceiros Credenciados:**
- Tabela com dados dos parceiros mock
- Colunas: Nome, Servicos, Regiao, Telefone, Avaliacao (estrelas visuais)
- Filtro por tipo de servico
- Badge para cada tipo de servico oferecido

**Rastreamento:**
- Lista de chamados com `status === 'pendente'` e `assignedTo !== null`
- Cada card mostra: dados do chamado, parceiro/responsavel, timeline visual com 4 etapas
- Indicador de tempo estimado
- Atualizacao de status via botoes (simulado localmente)

#### 3. `src/data/mockAssistanceData.ts` - Dados mock dos parceiros

```
interface Partner {
  id: string;
  name: string;
  services: string[];
  region: string;
  phone: string;
  rating: number;
  active: boolean;
}
```

Parceiros exemplo: Auto Socorro 24h, Guinchos Rapido, SOS Baterias, Chaveiro Express, etc.

### Arquivos Afetados

| Arquivo | Acao |
|---------|------|
| `src/data/mockAssistanceData.ts` | Expandir tipos, adicionar campos, dados de parceiros |
| `src/pages/Assistance.tsx` | Adicionar 4 novas abas com formulario, historico, parceiros e rastreamento |

### Consideracoes

- Todas as funcionalidades usam dados mock e estado local (sem backend)
- O rastreamento e simulado - os status podem ser alterados manualmente via botoes
- O formulario de guincho cria tickets localmente no estado do componente
- A estrutura fica preparada para integracao futura com backend real

