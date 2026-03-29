# Web Accessibility — WCAG 2.1 AA Compliance Skill

Garanta que todas as interfaces sigam padrões de acessibilidade.

## 1. CONTRASTE DE CORES (WCAG AA)
- Texto normal: ratio mínimo **4.5:1** contra background
- Texto grande (18px+ bold ou 24px+): ratio mínimo **3:1**
- Componentes interativos (borders, icons): ratio mínimo **3:1**
- **Teste**: Use tokens semânticos que já respeitam contraste no dark/light mode

## 2. NAVEGAÇÃO POR TECLADO
```tsx
// Todo elemento interativo deve ser focável
<button>  → focável por padrão ✓
<div onClick>  → ERRADO, use <button> ✗
<a href>  → focável por padrão ✓

// Focus visible obrigatório
className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"

// Tab order lógico
tabIndex={0}   → inclui no tab order
tabIndex={-1}  → focável por JS, não por tab
// NUNCA use tabIndex > 0
```

## 3. ESTRUTURA SEMÂNTICA
```tsx
// Headings em ordem hierárquica
<h1> → Título da página (1 por página)
<h2> → Seções principais
<h3> → Sub-seções

// Landmarks
<main>    → Conteúdo principal
<nav>     → Navegação
<aside>   → Sidebar/conteúdo lateral
<header>  → Cabeçalho
<footer>  → Rodapé
<section> → Seções com heading

// Listas
<ul>/<ol> → Para grupos de itens similares
```

## 4. FORMULÁRIOS ACESSÍVEIS
```tsx
// Label associado ao input
<Label htmlFor="email">Email</Label>
<Input id="email" aria-describedby="email-help" />
<p id="email-help" className="text-xs text-muted-foreground">Seu email de contato</p>

// Erros de validação
<Input aria-invalid={!!error} aria-describedby="email-error" />
{error && <p id="email-error" role="alert" className="text-destructive">{error}</p>}

// Campos obrigatórios
<Label>Nome <span aria-hidden="true">*</span></Label>
<Input required aria-required="true" />
```

## 5. IMAGENS E MÍDIA
```tsx
// Imagens informativas
<img alt="Descrição significativa do conteúdo" />

// Imagens decorativas
<img alt="" aria-hidden="true" />

// Ícones com significado
<button aria-label="Excluir cliente">
  <Trash2 className="h-4 w-4" aria-hidden="true" />
</button>

// Ícones decorativos (ao lado de texto)
<Phone className="h-4 w-4" aria-hidden="true" />
```

## 6. ESTADOS DINÂMICOS
```tsx
// Loading
<button disabled aria-busy="true">Salvando...</button>

// Expandir/colapsar
<button aria-expanded={isOpen} aria-controls="panel-id">Toggle</button>
<div id="panel-id" role="region">Conteúdo</div>

// Notificações
toast.success("Cliente criado") // Sonner já usa aria-live

// Modais
// Dialog do shadcn já implementa focus trap e aria corretamente
```

## 7. CHECKLIST POR COMPONENTE
- [ ] Pode ser operado apenas com teclado?
- [ ] Tem focus indicator visível?
- [ ] Labels descritivos em todos inputs?
- [ ] aria-label em botões com apenas ícone?
- [ ] Contraste adequado em todos os estados (default, hover, focus, disabled)?
- [ ] Screen reader consegue entender o contexto?
- [ ] Animações respeitam `prefers-reduced-motion`?

## 8. REDUCED MOTION
```tsx
// Respeite preferência do usuário
className="motion-safe:transition-all motion-safe:duration-200"

// Ou via Framer Motion
<motion.div
  transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
/>
```
