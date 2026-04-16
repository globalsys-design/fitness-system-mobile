# Setup Prompt — Fitness System Mobile

> Cole este prompt no Claude Code após clonar o repositório em uma nova máquina.

---

```
Configure o projeto Fitness System Mobile para desenvolvimento e deploy.

## Repositório
git@github.com:globalsys-design/fitness-system-mobile.git

## Serviços necessários (criar contas com globalsysproductdesign@gmail.com):
1. **Neon** (neon.tech) — PostgreSQL database
2. **Google Cloud Console** (console.cloud.google.com) — OAuth 2.0
3. **Stripe** (stripe.com) — Pagamentos
4. **Resend** (resend.com) — Emails transacionais
5. **Vercel** (vercel.com) — Deploy/Hosting

## Passo a passo:

### 1. Clone e instale
git clone git@github.com:globalsys-design/fitness-system-mobile.git
cd fitness-system-mobile
npm install

### 2. Configure SSH (se necessário)
ssh-keygen -t ed25519 -C "globalsysproductdesign@gmail.com"
# Adicione a chave pública no GitHub → Settings → SSH keys

### 3. Execute o setup interativo
./scripts/setup.sh
# O script vai pedir as credenciais de cada serviço e criar o .env.local

### 4. Se o setup interativo não funcionar, crie .env.local manualmente
Copie .env.example para .env.local e preencha todos os valores.

### 5. Google Cloud OAuth — URIs de redirect
No Google Cloud Console → APIs & Services → Credentials → OAuth Client:
- Authorized redirect URIs:
  - https://YOUR-APP.vercel.app/api/auth/callback/google
  - http://localhost:3000/api/auth/callback/google
- Authorized JavaScript origins:
  - https://YOUR-APP.vercel.app
  - http://localhost:3000
- Público-alvo: Externo
- Status: Testando (adicionar test users) ou Publicado

### 6. Stripe — Webhook
No Stripe Dashboard → Developers → Webhooks → Add Endpoint:
- URL: https://YOUR-APP.vercel.app/api/stripe/webhook
- Eventos: checkout.session.completed, invoice.paid, customer.subscription.deleted

### 7. Resend — Domínio (se usar domínio customizado)
No Resend Dashboard → Domains → Add Domain → fitnesssystem.app
Adicionar registros DNS: DKIM, SPF, MX

### 8. Prisma — Migrations
npx prisma migrate deploy
npx prisma generate

### 9. Vercel — Deploy
vercel login
vercel link --project fitness-system-app
vercel env pull  # para sincronizar env vars
vercel --prod    # deploy

### 10. Verificação pós-setup
- [ ] npm run dev funciona (http://localhost:3000)
- [ ] Login com Google funciona
- [ ] Login com Magic Link envia email
- [ ] Checkout Stripe cria assinatura
- [ ] Webhook Stripe atualiza plano

## Variáveis de ambiente necessárias:
DATABASE_URL, AUTH_SECRET, AUTH_URL, AUTH_TRUST_HOST, AUTH_GOOGLE_ID,
AUTH_GOOGLE_SECRET, AUTH_RESEND_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET,
STRIPE_PRICE_ID_PRO, NEXT_PUBLIC_APP_URL, NEXT_PUBLIC_STRIPE_PRICE_ID_PRO,
RESEND_API_KEY

## Stack:
Next.js 16 | React 19 | TypeScript | Tailwind CSS 4 | Auth.js v5 | Prisma 6 | Stripe | shadcn/ui
```
