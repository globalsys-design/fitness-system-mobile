# CLAUDE.md — Fitness System Mobile

## Projeto
PWA mobile-first para gestão profissional de avaliação física.
Stack: Next.js 14+ (App Router), TypeScript strict, Tailwind CSS 4, Auth.js v5, Prisma 6, Stripe, shadcn/ui.

## Estrutura de pastas
- `app/(public)/` — Rotas públicas (login, verificação)
- `app/(auth)/app/` — Rotas protegidas (dashboard, usuários, avaliações, prescrições)
- `components/mobile/` — Componentes mobile-first (MobileLayout, BottomNav, BottomSheet, FAB)
- `components/ui/` — shadcn/ui components
- `design-system/` — tokens.ts (single source of truth), generate-css.ts
- `lib/` — db, auth, stripe, subscription, validations
- `prisma/` — schema.prisma

## Design System
- Cores: oklch() — NUNCA hex hardcoded nos componentes
- Exceção: `theme_color` e `background_color` no manifest.json
- Cor primária: cyan `oklch(0.6566 0.1120 194.7713)`
- Fonte: Outfit (Google Fonts)
- Radius: 0.75rem (touch-friendly)
- Hit areas mínimas: 44px

## Gerar/sincronizar tokens CSS
```bash
npm run tokens        # atualiza globals.css a partir de tokens.ts
npm run tokens:check  # CI: verifica sincronização
```

## Regras de navegação mobile
- Bottom Navigation com 5 tabs: Dashboard, Usuários, Avaliações, Prescrições, Mais
- BottomSheet para ações contextuais (não Dialog centralizado)
- Stepper para formulários longos (cadastro, avaliações)
- Tabs internas para detalhe de entidades

## Auth
- Google OAuth + Email Magic Link (Resend)
- Primeiro login → plan=TRIAL, trialEndsAt=now+14dias
- Middleware protege `/app/*` verificando cookie `authjs.session-token` sem importar Auth.js

## Planos
- FREE: 1 assistente, 10 clientes, 2 avaliações/cliente, 5 prescrições
- TRIAL (14 dias): tudo ilimitado
- PRO: tudo ilimitado, R$ 97/mês

## Entidades principais
User → Professional → Assistant, Client, Assessment, Prescription, CalendarEvent
Assessment → AssessmentObjective, Anamnesis, Anthropometry, ClinicalExam, FitnessTest

## Módulos de Avaliação
1. Objetivo e Disponibilidade
2. Anamnese (Parâmetros Basais, PAR-Q+, Risco Coronariano, Framingham, Q. Avançado, Q. Completo)
3. Antropometria (Perímetros, Diâmetros, Peso/Estatura, Composição Corporal, Somatotipo)
4. Exames Clínicos (Cardíaco, Hemograma, Postural, Outros)
5. Testes (VO₂ Preditivo, VO₂ Máx.)

## Boas práticas
- Nunca usar `100vh` — sempre `100dvh`
- Safe area: `env(safe-area-inset-bottom)` no BottomNav e formulários
- `-webkit-tap-highlight-color: transparent` no body (já configurado no globals.css)
- `overscroll-behavior: none` no body (já configurado)
- Skeleton loaders em vez de spinners bloqueantes
- Toast (Sonner) para feedback de sucesso/erro

## Stripe (breaking changes v20)
- API version: `2026-02-25.clover`
- `invoice.subscription` → `invoice.parent.subscription_details.subscription`
- `current_period_end` → `invoice.period_end`
