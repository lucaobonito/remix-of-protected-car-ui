

## Plano: Substituir Logo por Nova Imagem

### Alteracoes

Substituir o logo atual (`logo_vistto.png`) pela nova imagem (`CHADICE.png`) em todos os locais onde e utilizado.

#### 1. Copiar nova imagem
- Copiar `user-uploads://CHADICE.png` para `src/assets/logo_vistto.png` (sobrescreve o atual)
- Copiar tambem para `public/logo_vistto.png` (favicon)

Nenhuma alteracao de codigo e necessaria, pois todos os componentes ja importam `logo_vistto.png`. Apenas o arquivo de imagem sera substituido.

### Arquivos Afetados

| Arquivo | Acao |
|---------|------|
| `src/assets/logo_vistto.png` | Substituido pela nova imagem |
| `public/logo_vistto.png` | Substituido pela nova imagem |

### Locais que serao atualizados automaticamente
- Login (painel esquerdo + logo mobile)
- Sidebar desktop e mobile
- Favicon do navegador

