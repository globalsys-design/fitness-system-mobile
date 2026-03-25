# Fitness System Mobile

PWA mobile-first para gestão profissional de avaliação física.

## Stack
- **Framework:** Next.js 14+ (App Router)
- **Auth:** Auth.js v5 (Google OAuth + Email Magic Link)
- **DB:** PostgreSQL via Neon + Prisma 6
- **Pagamentos:** Stripe
- **Email:** Resend
- **UI:** shadcn/ui + Tailwind CSS 4
- **Push:** OneSignal

## Setup

### 1. Pré-requisitos
```bash
node --version    # v18+
npm --version     # v9+
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar variáveis de ambiente
```bash
cp .env.example .env.local
# Edite .env.local com suas credenciais
```

### 4. Criar banco de dados
Crie um banco PostgreSQL gratuito em [neon.tech](https://neon.tech) e copie a connection string para `DATABASE_URL`.

### 5. Rodar migrations
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 6. Iniciar servidor de desenvolvimento
```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Comandos

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run tokens       # Sincronizar design tokens com globals.css
npm run tokens:check # Verificar sincronização (CI)
npm run storybook    # Storybook (design system)
```

## Deploy (Vercel)

1. Conecte o repositório ao Vercel
2. Configure as variáveis de ambiente no dashboard do Vercel
3. Adicione o webhook do Stripe: `https://seu-app.vercel.app/api/stripe/webhook`
4. Cada push na branch `main` faz deploy automático

## Estrutura

```
app/
├── (public)/login/          # Autenticação
├── (auth)/app/              # App protegido
│   ├── page.tsx             # Dashboard
│   ├── usuarios/            # Assistentes e Clientes
│   ├── avaliacoes/          # Avaliações completas
│   ├── prescricoes/         # Prescrições e fichas de treino
│   └── mais/                # Calendário, Notificações, Perfil
components/
├── mobile/                  # MobileLayout, BottomNav, BottomSheet, FAB
├── ui/                      # shadcn/ui
design-system/
├── tokens.ts                # Design tokens (source of truth)
├── generate-css.ts          # Gerador de CSS
prisma/
└── schema.prisma            # Banco de dados
```

## Design System

As cores são definidas em `design-system/tokens.ts` em formato oklch.

```bash
# Após editar tokens.ts, sincronize com globals.css:
npm run tokens
```

Nunca use valores hex hardcoded nos componentes. Use sempre tokens semânticos Tailwind: `bg-primary`, `text-foreground`, etc.
