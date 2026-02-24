

## Plano: Clarear o Azul do Painel Esquerdo da Tela de Login

### Alteracao

**Arquivo:** `src/pages/Login.tsx` (linha 56)

Substituir a classe `gradient-primary` por um gradiente azul mais claro inline:

```tsx
// DE:
<div className="hidden lg:flex lg:w-1/2 gradient-primary relative overflow-hidden">

// PARA:
<div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-400 relative overflow-hidden">
```

### Resultado

O painel esquerdo da pagina de login passara de um azul escuro/intenso para um azul mais claro e suave, mantendo o efeito de gradiente.

### Detalhes Tecnicos

- Troca a classe utilitaria `gradient-primary` (que usa `--primary: 217 91% 40%`, um azul escuro) por classes Tailwind de azul claro (`blue-400`/`blue-500`)
- Apenas 1 linha alterada
- Nenhum outro arquivo e afetado

