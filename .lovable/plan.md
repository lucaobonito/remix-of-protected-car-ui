

## Plano: Renomear "Protected Car" para "Vistto" e Substituir Icone pelo Logo

### Alteracoes

#### 1. Copiar logo para o projeto
- Copiar `user-uploads://logo_vistto_sem_fundo.png` para `src/assets/logo_vistto.png`
- Copiar tambem para `public/logo_vistto.png` (para favicon)

#### 2. Atualizar `index.html`
- Titulo: "Vistto - Protecao Veicular"
- Favicon apontando para `/logo_vistto.png`

#### 3. Atualizar `src/pages/Login.tsx`
- Linha 64: "Protected Car" -> "Vistto"
- Linha 107: "Protected Car" -> "Vistto"
- Substituir icone `Shield` pela imagem do logo nos dois locais (painel esquerdo e logo mobile)

#### 4. Atualizar `src/components/AppSidebar.tsx`
- Linha 72: "Protected Car" -> "Vistto"
- Substituir icone `Shield` pela imagem do logo

#### 5. Atualizar `src/components/AppLayout.tsx`
- Linha 75: "Protected Car" -> "Vistto"
- Substituir icone `Shield` pela imagem do logo

#### 6. Atualizar `src/pages/Reports.tsx`
- Linha 244: "PROTECTED CAR" -> "VISTTO"

### Detalhes Tecnicos

- O logo sera importado como modulo ES6: `import logoVistto from "@/assets/logo_vistto.png"`
- Nos locais onde havia `<Shield>` dentro de um container, sera substituido por `<img src={logoVistto} alt="Vistto" className="h-8 w-8 object-contain" />`
- O subtitulo "Protecao Veicular" permanece em todos os locais

### Arquivos Modificados

| Arquivo | Acao |
|---------|------|
| `src/assets/logo_vistto.png` | Novo (copia do upload) |
| `public/logo_vistto.png` | Novo (para favicon) |
| `index.html` | Titulo + favicon |
| `src/pages/Login.tsx` | Nome + logo |
| `src/components/AppSidebar.tsx` | Nome + logo |
| `src/components/AppLayout.tsx` | Nome + logo |
| `src/pages/Reports.tsx` | Nome no relatorio |

