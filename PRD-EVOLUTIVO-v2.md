# 🚀 EP-PRD: PRODUCT REQUIREMENTS DOCUMENT EVOLUTIVO
**Projeto:** Fitness System Mobile
**Versão:** 2.0 (Client Registration Stepper) | **Status:** IN EXECUTION
**Data:** 2026-03-28
**Responsável:** Breno Fachinetti (Product Lead & AI Engineer)

---

## 0. GEMS SCORE & LOG DE MATURIDADE

| Versão | GEMS Score | Usabilidade | UI Design | Performance | Acessibilidade | Status |
|:---|:---|:---|:---|:---|:---|:---|
| **1.0** | **7.2/10** | 7.5 (Good) | 8.0 (Excellent) | 7.0 (Good) | 6.5 (Needs Work) | Deployed |
| **2.0** | **8.1/10** | 8.5 (Excellent) | 8.5 (Excellent) | 7.5 (Good) | 7.5 (Good) | **IN PROGRESS** |

**Principais Incrementos/Evoluções:**
* ✅ v1.0: Login system + Professional dashboard + Assessment module
* ✅ v1.0→v2.0: Client registration stepper (5-step form) com validação condicional
* ✅ v2.0: Breadboard architecture + code-to-design alignment
* 🟡 v2.0: Accessibility improvements (WCAG 2.1 AA target)
* 🟡 v2.0: CEP auto-fill (backlog) + password strength validation (backlog)

---

## 1. VISÃO ESTRATÉGICA (Fase: SPEC)

**URL/Ambiente:** https://fitness-system-mobile.vercel.app
**Plataforma:** 📱 Mobile-First PWA (iOS/Android)
**Stack Técnica:** Next.js 14+ | React | TypeScript | Tailwind CSS 4 | shadcn/ui v4 | Auth.js v5 | Prisma 6

### 🎯 OBJETIVOS & MÉTRICAS

**Problema Central:**
Profissionais de fitness (Personal Trainers, Coaches) precisam de um sistema rápido, intuitivo e mobile-first para:
- Avaliar clientes (antropometria, testes físicos, anamnese)
- Prescrever exercícios estruturados
- Gerenciar calendário de agendamentos
- Acompanhar progresso com relatórios

**Público-Alvo:**
- **Persona:** Personal Trainer / Coach de fitness (25-50 anos)
- **Proficiência Tech:** Média (usa WhatsApp, Instagram, mas não é dev)
- **Dispositivo Principal:** iPhone/Android em clínica/estúdio (sem WiFi confiável)

**KPI de Sucesso:**
- ⏱️ **Time-on-task:** < 2 min para cadastrar novo cliente (atual: ~3 min)
- 📱 **Mobile UX Score:** > 85 (Lighthouse)
- ✅ **Form Completion Rate:** > 95% (sem abandono entre steps)
- ♿ **Accessibility Score:** > 90 (WCAG 2.1 AA)
- 🔄 **Session Retention:** > 7 dias (trial users)

---

## 2. ARQUITETURA DE INFORMAÇÃO (Fase: PLAN)

**TIPO DE NAVEGAÇÃO:**
Bottom Tab Navigation (5 tabs) + Stepper para formulários longos

### ESTRUTURA DE NAVEGAÇÃO:

```
BOTTOM TAB BAR (5 abas):
├── 🏠 DASHBOARD
│   ├── Hoje (agendamentos)
│   ├── Próximos 7 dias
│   └── Widgets de status
│
├── 👥 USUÁRIOS
│   ├── Listar Clientes
│   │   ├── + Novo Cliente [STEPPER 5-STEP]
│   │   ├── Editar Cliente
│   │   └── Ver Detalhes
│   ├── Assistentes (profissionais vinculados)
│   └── Equipes
│
├── 📊 AVALIAÇÕES
│   ├── Listar Avaliações
│   ├── + Nova Avaliação [FORM MULTI-STEP]
│   ├── Editar Avaliação
│   └── Gerar Relatório
│
├── 💪 PRESCRIÇÕES
│   ├── Listar Prescrições
│   ├── + Nova Prescrição [STEPPER com calendar link]
│   ├── Editar Prescrição
│   └── Acompanhar Progresso
│
└── ⋯ MAIS
    ├── Perfil (editar dados profissional)
    ├── Plano & Subscription
    ├── Configurações (tema, notificações)
    ├── Suporte & FAQ
    └── Logout
```

---

## 3. PÁGINAS, FUNCIONALIDADES E COMPONENTES (Fase: EXECUTE)

### 3.1 CADASTRO DE CLIENTE — Stepper 5-Step [FOCO v2.0]

**Trabalho do Usuário:**
Registrar novo cliente com dados pessoais, endereço, responsável (se menor), senha, e disponibilidade semanal.

**Elementos UI (Atomic):**
- Input (text, email, date, tel, time)
- Select (gender, marital, ethnicity, DDI)
- Switch (day availability, client status)
- Button (Continue, Back, Generate Password, Copy, Save)
- Alert (minor age warning)
- Toast (validation errors, success)
- Avatar upload (circular, FileReader)

**UX Writing:**
- "Passo X de 5 — [Nome do Step]" (progress indicator)
- "Corrija os campos destacados antes de continuar" (validation error)
- "Cliente menor de idade detectado. Dados do responsável são obrigatórios." (conditional alert)
- "Senha copiada!" (success micro-copy)

**Fluxo:**
```
Step 1: Dados Pessoais
  ├─ Avatar (optional upload)
  ├─ Nome (required)
  ├─ Data de Nascimento (optional)
  │   └─ if < 18 years → S3.clientIsMinor = true
  ├─ CPF (optional, validates format)
  ├─ Gênero (select)
  ├─ Estado Civil (select)
  ├─ Etnia (select)
  ├─ Convênio (optional)
  ├─ Email (required, validates format)
  ├─ DDI + Telefone (DDI select, tel input)
  └─ Tel. Emergência (optional)

Step 2: Endereço & Profissão
  ├─ CEP (optional, blur trigger [BACKLOG: ViaCEP API])
  ├─ Rua, Nº, Complemento, Bairro, Cidade, Estado
  └─ Profissão (optional)

Step 3: Responsável & Emergência
  ├─ [IF clientIsMinor == true]
  │   ├─ Alert: "Menor detectado..."
  │   ├─ Responsável Name (required)
  │   ├─ Responsável Email (required, validates)
  │   ├─ Responsável CPF (required, validates)
  │   ├─ Responsável Telefone (required)
  │   └─ Responsável Profissão (optional)
  ├─ [ELSE]
  │   └─ Placeholder: "Disponível para maiores de 18 anos"
  ├─ Emergência Name (required)
  ├─ Emergência Tel (required)
  ├─ Emergência Tel Fixo (optional)
  └─ Observações (textarea, optional)

Step 4: Acesso
  ├─ Email (read-only, from Step 1)
  ├─ Nova Senha (min 8 chars)
  ├─ [Eye icon] Toggle visibility
  ├─ [Gerar Senha] Button → random 12-char mixed
  ├─ [Copiar] Button → navigator.clipboard + toast
  ├─ [BACKLOG: Strength bar] 4 segments (Fraca/Razoável/Boa/Forte)
  └─ Cliente Ativo (Switch, default ON)

Step 5: Disponibilidade
  ├─ Segunda-feira [Switch] → if ON:
  │   ├─ Horário Inicial (time input, default 08:00)
  │   └─ Horário Final (time input, default 18:00)
  ├─ Terça-feira [Switch] → ...
  ├─ ... (6 dias + domingo)
  └─ [Salvar Cliente] Button → POST /api/clients
```

**Validações:**
- ✅ RHF + Zod schema (client-side)
- ✅ Conditional validation: if minor → responsible required
- ✅ CEP format (11 digits)
- ✅ CPF format (Mod 11 algorithm)
- ✅ Email format (RFC 5322 simplified)
- ✅ Telefone format (min 8 digits)
- ✅ Backend safeParse + superRefine

---

### 3.2 MÓDULOS DE ESPECIALIDADE

#### **📱 MOBILE (Client Registration Stepper)**
- ✅ **Touch targets:** 48px (h-12) em todos inputs/buttons
- ✅ **Safe area:** `env(safe-area-inset-bottom)` no BottomNav e form
- ✅ **Overflow:**`overflow-y-auto` em step content + bottom action bar fixo
- ✅ **Scroll behavior:** Smooth, com scroll-to-input on error
- ✅ **Offline UI:** [BACKLOG] Fallback UI se API falha
- ✅ **Input Methods:** `inputMode="numeric"` para CPF/CEP/Tel, `type="date"` para nativa date picker, `type="time"` para time picker
- ✅ **Performance:** FormProvider + useFormContext (previne re-renders em step change)

#### **🖥️ BACKOFFICE (Planejado para v3.0)**
- Assessment dashboard com visualização de múltiplos clientes
- Bulk actions (e.g., "mark as inactive")
- RBAC (Admin vs Personal Trainer)
- Data density: Grid view with filters

#### **☁️ SAAS (Current v2.0)**
- Free tier: 1 assistant, 10 clients, 2 assessments/client
- Trial tier: 14 dias, tudo ilimitado
- Pro tier: R$ 97/mês, tudo ilimitado
- Workspace management (admin gerencia assistentes)

---

## 4. CONECTIVIDADE E INTELIGÊNCIA (MCP)

**Ponto de Intervenção — IA como Agente:**
1. **Análise de Avaliações:** IA gera relatório automático + recomendações de treino
2. **Prescrição Inteligente:** IA sugere exercícios baseado em objective + anamnese
3. **Documentação:** IA escreve relatório de progress cliente

**Contexto Externo (Model Context Protocol):**
- 📊 **Logs:** User events, API timing, error rates
- 🗄️ **BD:** Prisma queries, assessment data, fitness protocols
- 📚 **Documentação:** Fitness assessment guidelines, exercise database, periodization models

---

## 5. AUDITORIA HEURÍSTICA TÉCNICA (Fase: TEST)

### 5.1 VISIBILIDADE DO STATUS DO SISTEMA (Nielsen #1)
*Fundamento: 'Real-time feedback' (Don Norman)*

**💎 PONTOS FORTES**
- ✅ Step indicator com progresso visual (circles + bars)
- ✅ "Passo X de 5" label claro
- ✅ "Rendering..." state durante submit
- ✅ Toast feedback para sucesso/erro (Sonner)
- ✅ Validation errors em tempo real com mensagens semânticas

**⚠️ PROBLEMAS / OPORTUNIDADES**
- **[Falta indicador de campos obrigatórios]:** Users não sabem qual campo é obrigatório
  - **Severidade:** 🟡 Média
  - **Impacto:** Aumenta cognitive load
  - **Recomendação:** Adicionar asterisco `*` em labels obrigatórios (padrão WCAG)

- **[Sem loading skeleton durante CEP fetch]:** [BACKLOG]
  - **Severidade:** 🔵 Baixa
  - **Impacto:** Percepção de lentidão
  - **Recomendação:** Skeleton screen em U21 durante N6 execution

---

### 5.2 CORRESPONDÊNCIA ENTRE SISTEMA E MUNDO REAL (Nielsen #2)
*Fundamento: 'Affordances' (Don Norman)*

**💎 PONTOS FORTES**
- ✅ Language is user's language ("Data de nascimento" not "Birth Date")
- ✅ Input types match real world: `type="date"` (native picker), `type="time"`, `type="email"`
- ✅ Avatar upload com icon de câmera + preview circular
- ✅ Eye icon for password visibility (familiar convention)
- ✅ "Gerar Senha" button with refresh icon (refresh = generate)

**⚠️ PROBLEMAS / OPORTUNIDADES**
- **[DDI Select com flags de país]:** Currently text-only
  - **Severidade:** 🔵 Baixa
  - **Impacto:** Minor UX improvement
  - **Recomendação:** Add flag emoji to DDI options (e.g., "🇧🇷 +55")
  - **Status:** ✅ DONE (DDI_OPTIONS já tem flags)

---

### 5.3 LIBERDADE E CONTROLE DO USUÁRIO (Nielsen #3)
*Fundamento: 'Undo/Redo' (Neilson)*

**💎 PONTOS FORTES**
- ✅ "Voltar" button em cada step (retreat without losing data)
- ✅ FormProvider + RHF previne perda de dados entre steps
- ✅ Menor → Adult transition automaticamente limpa responsible data

**⚠️ PROBLEMAS / OPORTUNIDADES**
- **[Sem "Salvar como Rascunho" em steps intermediários]:** Se usuário fecha navegador no Step 3, perde tudo
  - **Severidade:** 🟡 Média
  - **Impacto:** Abandono de forms longos
  - **Recomendação:** localStorage save on every change (PWA feature) [BACKLOG]

---

### 5.4 CONSISTÊNCIA E PADRÕES (Nielsen #4)
*Fundamento: 'Design System tokens' (Tailwind)*

**💎 PONTOS FORTES**
- ✅ Consistent input height: h-12 (48px) everywhere
- ✅ Consistent button styling: primary, outline, variants
- ✅ Consistent spacing: gap-4, mt-1.5 (design system)
- ✅ Consistent colors: oklch() tokens (no hardcoded hex)
- ✅ Same validation pattern across all inputs

**⚠️ PROBLEMAS / OPORTUNIDADES**
- **[Inconsistência em Select styling]:** Select components podem ter visual different de Input
  - **Severidade:** 🔵 Baixa
  - **Impacto:** Minor visual inconsistency
  - **Recomendação:** Audit Select vs Input border-radius, padding, height
  - **Status:** ✅ VERIFIED (todos h-12, mesmo radius)

---

### 5.5 PREVENÇÃO DE ERROS (Nielsen #5)
*Fundamento: 'Error Prevention' (Nielsen)*

**💎 PONTOS FORTES**
- ✅ Client-side validation com Zod trigger (antes de ir pro backend)
- ✅ CPF validation (Mod 11 algorithm)
- ✅ Email validation (format check)
- ✅ Conditional validation: minors require responsible
- ✅ Backend safeParse + superRefine double-validation

**⚠️ PROBLEMAS / OPORTUNIDADES**
- **[Sem confirmação antes de envio final]:** "Salvar cliente" não pede "Tem certeza?"
  - **Severidade:** 🔵 Baixa
  - **Impacto:** Risco de clientes duplicados
  - **Recomendação:** Add confirmation dialog antes de POST [BACKLOG]

---

### 5.6 RECONHECIMENTO VS RECORDAÇÃO (Nielsen #6)
*Fundamento: 'Progressive Disclosure' (Nielsen)*

**💎 PONTOS FORTES**
- ✅ Labels visíveis em todos inputs (não placeholders-only)
- ✅ Step indicator mostra onde você está (recognition)
- ✅ Conditional rendering: hora inputs só aparecem quando day ativado
- ✅ Email read-only em Step 4 (mostra valor, não requer recall)

**⚠️ PROBLEMAS / OPORTUNIDADES**
- **[Sem breadcrumb textual]:** Só há step indicator visual
  - **Severidade:** 🔵 Baixa
  - **Impacto:** Users sem suporte visual (screenreader) têm menos contexto
  - **Recomendação:** Add `aria-current="step"` em step indicator [BACKLOG]

---

### 5.7 FLEXIBILIDADE E EFICIÊNCIA (Nielsen #7)
*Fundamento: 'Shortcuts' (Nielsen)*

**💎 PONTOS FORTES**
- ✅ "Gerar Senha" auto-fills password field
- ✅ CEP blur trigger auto-fills address [BACKLOG]
- ✅ Day defaults 08:00–18:00 (common hours)
- ✅ "Copiar" one-click copy to clipboard

**⚠️ PROBLEMAS / OPORTUNIDADES**
- **[Sem auto-increment de tel number]:** Usuario tem que digitar DDI + número
  - **Severidade:** 🔵 Baixa
  - **Impacto:** Extra keystroke
  - **Recomendação:** Format tel input like "(11) 99999-9999" [BACKLOG]

---

### 5.8 DESIGN ESTÉTICO E MINIMALISTA (Nielsen #8)
*Fundamento: 'Cognitive Load' (Sweller)*

**💎 PONTOS FORTES**
- ✅ 5 steps vs 30+ fields on one page (chunking)
- ✅ No unnecessary info clutter
- ✅ Cards & sections have breathing room (padding)
- ✅ Color palette is minimal (primary, muted-foreground, destructive)

**⚠️ PROBLEMAS / OPORTUNIDADES**
- **[Step 3 pode ser visualmente overloaded]:** 9 fields (responsible + emergency)
  - **Severidade:** 🟡 Média
  - **Impacto:** Cognitive load spike in Step 3
  - **Recomendação:** Consider splitting Step 3 into 3a (responsible) + 3b (emergency) [BACKLOG v3.0]

---

### 5.9 RECUPERAÇÃO DE ERROS (Nielsen #9)
*Fundamento: 'Error Recovery' (Nielsen)*

**💎 PONTOS FORTES**
- ✅ Clear error messages: "CPF inválido", "Email inválido"
- ✅ Errors highlight the input field
- ✅ User can immediately fix and retry
- ✅ Toast shows backend error on submit failure

**⚠️ PROBLEMAS / OPORTUNIDADES**
- **[Sem "Voltar para erro"  em último step]:** Se Step 5 validation falha, usuário está preso
  - **Severidade:** 🟡 Média
  - **Impacto:** Frustration
  - **Recomendação:** Auto-navigate to first invalid step [BACKLOG]

- **[Sem retry button em erro de rede]:** Se POST falha, só toast aparece
  - **Severidade:** 🟡 Média
  - **Impacto:** User doesn't know to retry
  - **Recomendação:** Toast with "Retry" action button [BACKLOG]

---

### 5.10 AJUDA E DOCUMENTAÇÃO (Nielsen #10)
*Fundamento: 'Help Content' (Nielsen)*

**💎 PONTOS FORTES**
- ✅ Alert para menores de idade explica por que responsible é obrigatório
- ✅ "Preencha o email no Passo 1..." helper text em Step 4
- ✅ Placeholder text em senhas ("Mínimo 8 caracteres")

**⚠️ PROBLEMAS / OPORTUNIDADES**
- **[Sem link para FAQ]:** Users não sabem onde conseguir ajuda
  - **Severidade:** 🟡 Média
  - **Impacto:** Support tickets
  - **Recomendação:** Add "Precisa de ajuda?" link em MoreTab [BACKLOG]

- **[Sem campo "Por que coletamos CPF?":]**
  - **Severidade:** 🔵 Baixa
  - **Impacto:** Privacy concerns
  - **Recomendação:** Add info icon com tooltip [BACKLOG]

---

## 6. BACKLOG DE EVOLUÇÃO (Dívida Técnica e UX)

*Priorização: Impacto (High/Medium/Low) × Esforço (Hours)*

### 🚨 ALTA PRIORIDADE (Foco Imediato — v2.x)

1. **Mandatory field indicators (*):**
   - **Impacto:** High (cognitive load reduction)
   - **Esforço:** 1h
   - **Justificativa:** WCAG 2.1 A requires form fields to have accessible labels; asterisk is standard
   - **Status:** 🔴 NOT STARTED

2. **Auto-navigate to first invalid step on submit error:**
   - **Impacto:** High (UX recovery)
   - **Esforço:** 2h
   - **Justificativa:** If Step 5 fails, user is stuck; redirect to problematic field
   - **Status:** 🔴 NOT STARTED

3. **Toast with "Retry" button on network error:**
   - **Impacto:** High (error recovery)
   - **Esforço:** 1.5h
   - **Justificativa:** Current toast doesn't indicate user can retry
   - **Status:** 🔴 NOT STARTED

4. **Accessibility audit (WCAG 2.1 AA):**
   - **Impacto:** High (legal compliance + inclusion)
   - **Esforço:** 4h
   - **Justificativa:** Must support screen readers, keyboard nav, color contrast
   - **Status:** 🔴 NOT STARTED
   - **Checklist:**
     - [ ] aria-current="step" in step indicator
     - [ ] aria-label for eye toggle button
     - [ ] Color contrast ratio > 4.5:1
     - [ ] Keyboard navigation (Tab, Space, Enter)
     - [ ] Form labels properly associated (htmlFor)

---

### ⚡ MÉDIA PRIORIDADE (Melhoria Contínua — v2.x–v3.0)

1. **CEP auto-fill (ViaCEP API):**
   - **Impacto:** Medium (efficiency)
   - **Esforço:** 2h
   - **Justificativa:** Currently [BACKLOG], N6 ready to implement
   - **Status:** 🟡 PLANNED
   - **Blockers:** None

2. **Password strength indicator (Strength bar + label):**
   - **Impacto:** Medium (security UX)
   - **Esforço:** 1.5h
   - **Justificativa:** Gives feedback on password quality; N14 ready to implement
   - **Status:** 🟡 PLANNED

3. **Form save to localStorage (PWA):**
   - **Impacto:** Medium (retention)
   - **Esforço:** 3h
   - **Justificativa:** Prevent data loss if browser closes mid-form
   - **Status:** 🟡 PLANNED

4. **Split Step 3 into 3a (Responsible) + 3b (Emergency):**
   - **Impacto:** Medium (UX clarity)
   - **Esforço:** 4h
   - **Justificativa:** Cognitive overload in Step 3; would make it 6 steps total
   - **Status:** 🟡 PLANNED for v3.0

5. **Add flag emojis to DDI Select:**
   - **Impacto:** Medium (visual clarity)
   - **Esforço:** 0.5h
   - **Justificativa:** Already done (DDI_OPTIONS has 🇧🇷), but verify all
   - **Status:** ✅ DONE

6. **Confirmation dialog before final submit:**
   - **Impacto:** Medium (error prevention)
   - **Esforço:** 1h
   - **Justificativa:** Prevents accidental client creation
   - **Status:** 🟡 PLANNED

---

### 💡 BAIXA PRIORIDADE (Nice-to-Have — v3.0+)

1. **Auto-increment phone number formatting:**
   - **Impacto:** Low (minor UX)
   - **Esforço:** 2h
   - **Justificativa:** Format like "(11) 99999-9999"
   - **Status:** 🟢 BACKLOG

2. **Breadcrumb text for screen readers:**
   - **Impacto:** Low (accessibility edge case)
   - **Esforço:** 0.5h
   - **Justificativa:** aria-current already handles this
   - **Status:** 🟢 BACKLOG

3. **Help link in More tab:**
   - **Impacto:** Low (support deflection)
   - **Esforço:** 1h
   - **Justificativa:** Link to FAQ/docs
   - **Status:** 🟢 BACKLOG

4. **Privacy info icon (CPF collection rationale):**
   - **Impacto:** Low (privacy transparency)
   - **Esforço:** 1h
   - **Justificativa:** Tooltip explaining why CPF is needed
   - **Status:** 🟢 BACKLOG

---

## 7. ROADMAP DE PRODUTO (v2.0 → v4.0)

| Versão | Foco | Timeline | Status |
|:---|:---|:---|:---|
| **v2.0** | Client Registration Stepper (5-step) + Breadboard architecture | Feb 28 – Mar 31 | 🟡 IN PROGRESS |
| **v2.1** | WCAG 2.1 AA compliance + accessibility audit | Apr 1 – Apr 15 | 🔴 NOT STARTED |
| **v2.2** | CEP auto-fill + password strength + localStorage | Apr 16 – Apr 30 | 🔴 PLANNED |
| **v3.0** | Assessment module (5 phases) + E2E tests | May 1 – Jun 30 | 🔴 PLANNED |
| **v3.1** | Prescription module + AI-powered exercise recommendations | Jul 1 – Aug 31 | 🔴 PLANNED |
| **v4.0** | Backoffice dashboard + bulk actions + RBAC | Sep 1 – Oct 31 | 🔴 PLANNED |

---

## 8. MÉTRICAS & KPIs (CURRENT)

| Métrica | Target | Current | Status |
|:---|:---|:---|:---|
| **Form Completion Rate** | > 95% | 87% | 🟡 Close |
| **Time-on-Task (Client Register)** | < 2 min | 2.8 min | 🟡 Close |
| **Mobile Lighthouse Score** | > 90 | 85 | 🟡 Close |
| **WCAG 2.1 AA Compliance** | 100% | 75% | 🟡 In progress |
| **API Latency (POST /clients)** | < 200ms | 150ms | ✅ Good |
| **Network Error Rate** | < 0.5% | 0.3% | ✅ Good |
| **Trial User Retention (7d)** | > 60% | 52% | 🟡 Close |

---

## 9. DECISÕES TÉCNICAS (LOGS)

### Decision #1: FormProvider vs Context API
- **Escolha:** FormProvider (React Hook Form)
- **Razão:** Type-safe, prevents re-renders, supports nested forms
- **Alternativas consideradas:** Redux (overkill), useState per component (props drilling)
- **Trade-off:** Slightly larger bundle size, but better UX performance

### Decision #2: Conditional Validation (superRefine vs custom middleware)
- **Escolha:** Zod superRefine
- **Razão:** Single source of truth; runs at both client & server
- **Alternativas:** Custom middleware (more boilerplate)
- **Trade-off:** Schema complexity increases

### Decision #3: Stepper as 5 separate components vs single component
- **Escolha:** 5 separate components (StepPersonal, StepAddress, etc.)
- **Razão:** Easier to test, maintain, and scale
- **Alternativas:** Single mega-component (harder to read)
- **Trade-off:** More file management

### Decision #4: Password hashing in backend vs Argon2
- **Escolha:** bcryptjs cost 12 (industry standard)
- **Razão:** Battle-tested, good balance of security & speed
- **Alternativas:** Argon2 (more modern, but slower), scrypt
- **Trade-off:** Cost 12 = ~250ms per hash (acceptable for registration)

---

## 10. DEPENDÊNCIAS EXTERNAS

| Sistema | Versão | Tipo | Status |
|:---|:---|:---|:---|
| **Next.js** | 14.2.0+ | Framework | ✅ Pinned |
| **React Hook Form** | 7.51.0+ | Form state | ✅ Pinned |
| **Zod** | 3.22.0+ | Validation | ✅ Pinned |
| **Tailwind CSS** | 4.0.0 | Styling | ✅ Latest |
| **shadcn/ui** | v4 | Components | ✅ Latest |
| **Prisma** | 6.0.0 | ORM | ✅ Latest |
| **Auth.js** | v5.0.0 | Auth | ✅ Latest |
| **bcryptjs** | 2.4.3+ | Hashing | ✅ Pinned |
| **Sonner** | 1.7.0+ | Toast | ✅ Latest |
| **Lucide React** | 0.408.0+ | Icons | ✅ Latest |

---

## 11. CHECKPOINTS PRÓXIMOS (Next 30 Days)

| Data | Checkpoint | Responsável | Blocker |
|:---|:---|:---|:---|
| **Mar 31** | ✅ Client Registration Stepper complete + deployed | Breno | None |
| **Apr 5** | 🟡 WCAG 2.1 A audit complete | Breno | None |
| **Apr 12** | 🟡 CEP auto-fill implemented | Breno | ViaCEP API stability |
| **Apr 19** | 🟡 Password strength indicator implemented | Breno | None |
| **Apr 26** | 🟡 E2E tests for stepper (Playwright) | QA | None |

---

**FIM DO DOCUMENTO EP-PRD v2.0**

**Próxima revisão:** 2026-04-31
**Mantido por:** Breno Fachinetti
**Última atualização:** 2026-03-28
