# Frontend Design System — Production-Ready UI Skill

Gere interfaces prontas para produção usando sistemas de design estruturados.

## 1. DESIGN TOKENS (Single Source of Truth)
Sempre utilize tokens semânticos do projeto (`design-system/tokens.ts`):
```
- Cores: bg-primary, text-foreground, border-border (NUNCA hex hardcoded)
- Spacing: gap-1 (4px), gap-2 (8px), gap-3 (12px), gap-4 (16px), gap-6 (24px)
- Radius: rounded-md (6px), rounded-lg (8px), rounded-xl (12px), rounded-2xl (16px)
- Shadows: shadow-sm, shadow-md (usar com moderação em dark mode)
- Typography: text-xs (12px), text-sm (14px), text-base (16px), text-lg (18px), text-xl (20px)
```

## 2. LAYOUT PATTERNS
- **Split Layout**: Lista à esquerda (480px fixed) + painel direito (flex-1)
- **Grid responsivo**: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
- **Stack vertical**: `space-y-{n}` para seções, `gap-{n}` para items
- **Container**: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`

## 3. COMPONENT ARCHITECTURE
```
components/
├── ui/          → Primitivos (shadcn/ui) — NUNCA editar diretamente
├── layout/      → Sidebar, Header, Footer
├── {feature}/   → Componentes por domínio (clientes/, treinos/)
│   ├── schema.ts       → Zod validations + types
│   ├── stepper.tsx      → Componente de progresso
│   └── step-*.tsx       → Steps individuais modulares
```

## 4. RESPONSIVE BREAKPOINTS
- `sm:` → 640px (tablet portrait)
- `md:` → 768px (tablet landscape)
- `lg:` → 1024px (desktop)
- `xl:` → 1280px (desktop wide)
- Mobile-first: escreva styles base para mobile, override com breakpoints

## 5. STATE MANAGEMENT PATTERNS
- **Server state**: TanStack Query (`useQuery`, `useMutation`)
- **Form state**: React Hook Form + Zod resolver
- **UI state**: `useState` local (modals, tabs, steps)
- **URL state**: Search params para filtros persistentes

## 6. PERFORMANCE
- Lazy load componentes pesados (gráficos, tabelas grandes)
- Skeleton screens durante loading (nunca tela em branco)
- Debounce em inputs de busca (300ms)
- Virtualização para listas > 100 items

## CHECKLIST PRÉ-ENTREGA
- [ ] Zero hex hardcoded — somente tokens semânticos
- [ ] Responsivo testado em 320px, 768px, 1280px
- [ ] Loading states em toda operação async
- [ ] Error states com mensagens amigáveis
- [ ] Empty states com CTAs claros
- [ ] TypeScript strict sem `any` (exceto schemas dinâmicos)
