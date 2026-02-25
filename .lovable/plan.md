

## Plano: Pagina de Assistencia + Integracao com Usuarios

### Resumo

Criar a pagina "Assistencia" com sistema de chamados que inclui atribuicao de responsavel, e integrar informacoes de chamados na pagina de Usuarios (mostrando chamados que cada usuario esta atendendo e chamados disponiveis sem responsavel).

---

### Arquivos a Criar

#### 1. `src/data/mockAssistanceData.ts`
Dados mock de chamados com campos:
- `id`, `requesterName`, `vehicleBrand`, `vehicleModel`, `plate`, `status` ("atendido" | "pendente"), `assignedTo` (id do usuario responsavel ou `null` para chamados sem responsavel), `assignedToName`, `createdAt`, `description`
- Aproximadamente 10 registros, alguns com `assignedTo` preenchido e outros com `null`

#### 2. `src/pages/Assistance.tsx`
Nova pagina com:
- Cards de resumo: Total, Pendentes, Atendidos, Sem Responsavel
- Filtros por status e busca por nome/placa
- Tabela com colunas: Solicitante, Veiculo, Placa, Responsavel (quem esta atendendo), Status, Data
- Chamados sem responsavel mostram "Nao atribuido" em cinza
- Badges: verde para Atendido, amarelo para Pendente

---

### Arquivos a Modificar

#### 3. `src/pages/Users.tsx`
Na area de detalhes do usuario (dialog "Ver Detalhes"), adicionar:
- **Secao "Chamados em Atendimento"**: lista dos chamados que aquele usuario esta resolvendo atualmente (filtrados por `assignedTo === user.id`)
- **Secao "Chamados Disponiveis"**: lista de chamados pendentes sem responsavel (`assignedTo === null && status === 'pendente'`), com botao para o usuario assumir o chamado
- Importar os dados mock de assistencia

#### 4. `src/App.tsx`
- Adicionar rota `/assistance`

#### 5. `src/components/AppSidebar.tsx`
- Adicionar item "Assistencia" com icone `Headphones`, rota `/assistance`, role `['admin']`

#### 6. `src/components/AppLayout.tsx`
- Adicionar item "Assistencia" no menu mobile

#### 7. `src/config/routes.ts`
- Adicionar `/assistance` no `routeConfig`

---

### Detalhes Tecnicos

- Os dados mock serao compartilhados entre `Assistance.tsx` e `Users.tsx` via import do mesmo arquivo
- No dialog de detalhes do usuario, as secoes de chamados aparecerao abaixo das informacoes de contato, separadas por `Separator`
- Chamados em atendimento mostram: veiculo, placa e data
- Chamados disponiveis mostram: solicitante, veiculo, placa
- Icone: `Headphones` do lucide-react
- Componentes reutilizados: `Table`, `Card`, `Badge`, `Select`, `Input`

