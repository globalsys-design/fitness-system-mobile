---
name: design-spec-evolution
description: Transform design analysis into evolutionary, versionable specs with UX maturity scoring. Use when analyzing a design system, documenting a new feature, or reviewing design iterations. Generates versionable SPEC files (v1.md, v2.md...) that serve as the single source of truth for Design, PRD, Backend, Database, and Frontend teams. Includes automatic UX maturity scoring based on Nielsen's heuristics, comparison with previous versions, and ready-to-use engineering prompts for addressing identified gaps.
compatibility: Figma MCP (optional but recommended), Claude with markdown output capability
---

# 🎨 Design Spec Evolution Skill

**Purpose:** Transform your design analysis into a living, versionable specification system that evolves alongside your product, serving as the single source of truth across all teams.

---

## Overview

This skill guides you through a systematic design analysis process that:

1. **Reads design context** (from Figma or description) using the Figma MCP connector when available
2. **Generates a versionable SPEC document** with automatic semantic versioning (v1.md → v2.md → v3.md...)
3. **Calculates UX maturity scores** automatically (0–10) based on Nielsen's 10 heuristics
4. **Compares with previous versions** (delta, what changed, impact analysis)
5. **Auto-generates engineering prompts** for fixing identified issues (ready-to-use format)
6. **Maintains complete history** in a `_spec-design/` repository folder

The output is not just documentation — it's an actionable artifact that feeds directly into PRD, Backend specs, Database schemas, and Frontend component specs.

---

## When to Use

Use this skill when:

- **Starting a new design project** — Create the baseline SPEC (v1)
- **Completing a user journey** — Evolve to v2, v3 as design matures
- **Iterating on feedback** — Document what changed from previous version
- **Bridging design to engineering** — Generate context-aware engineering prompts
- **Tracking design quality over time** — Watch UX maturity score evolve
- **Documenting design decisions** — Create a decision tree with rationale
- **Preparing handoff to teams** — Each team extracts what they need from one SPEC

**Not for:**
- Quick wireframe feedback (too lightweight)
- Design system component documentation (use a Design System Spec instead)
- Post-launch review (use different tool)

---

## Process

### Phase 1: Prepare Design Context

**Option A: From Figma (Recommended)**
If you have a Figma file:
1. Provide the Figma file URL or node ID
2. I'll use the Figma MCP to read: component structure, layer names, design tokens, variants, annotations
3. This extracts the "source of truth" directly from your design file

**Option B: From Description or Screenshot**
If you don't have Figma or prefer manual input:
1. Describe your design (what it is, core flows, user segments)
2. List key pages, components, features
3. Provide any wireframes, screenshots, or design specs as reference

---

### Phase 2: Check for Previous Versions

Before generating a new SPEC:
1. Do you have a previous version? (v1, v2, etc.) If yes, provide it
2. What version number should this be? (v1 if first, v2 if updating, etc.)
3. What changed since the last version?

This allows delta calculation and comparison table generation.

---

### Phase 3: Generate SPEC Document

I will create a markdown file named: **`[system-name]-spec.v[N].md`**

The file contains:

#### **Header with Metadata**
```
Versão:       vX
Score UX:     X.X / 10
Delta:        +X.X (vs vX-1) | — (first version)
Data:         DD/MM/AAAA
Arquivo:      [system-name]-spec.vX.md
```

#### **Part 1: Product Requirements Document (PRD)**
- Visão Geral do Produto (objectives, target audience, stack)
- Arquitetura de Informação (navigation structure)
- Páginas e Funcionalidades (detailed page specs)
- Componentes Globais (header, footer, design tokens)
- Funcionalidades Interativas (forms, integrations, workflows)
- Integrações e Tecnologias (backend, CMS, external services)
- Observações e Gaps (missing pages, incomplete specs)
- Considerações Finais (summary, strengths, opportunities)

**Section markers:** Each section includes a `🔄 Mudanças desde a versão anterior` field (filled only in v2+)

#### **Part 2: Heuristic Analysis (Nielsen's 10 Heuristics)**

Scoring breakdown:
- **Each heuristic scored:** 10 (Bom) / 5 (Médio) / 1 (Fraco)
- **Final score:** Average of all 10 = X.X / 10
- **Delta:** Change from previous version (e.g., +1.2)

For each heuristic:
- Strengths (what works well)
- Problems / Opportunities (gaps and issues)

#### **Part 3: Engineering Backlog with Auto-Generated Prompts**

High, Medium, Low priority sections with:
- Problem description
- **Auto-generated engineering prompt** (5-section format, see below)
- Affected heuristics
- Estimated impact

---

### Phase 4: UX Maturity Score Calculation

**Automatic calculation:**
```
Score = (H1 + H2 + H3 + H4 + H5 + H6 + H7 + H8 + H9 + H10) / 10

Where each H = 10 (Bom) | 5 (Médio) | 1 (Fraco)

Example: (10 + 8 + 5 + 10 + 8 + 7 + 5 + 9 + 6 + 3) / 10 = 7.1 / 10
```

**Qualitative analysis supplement:**
After calculation, I provide:
- Which 2-3 heuristics have the biggest impact (highest/lowest scores)
- Why they scored that way (specific evidence from analysis)
- Quick wins (low effort, high impact improvements)
- Strategic challenges (harder problems worth tackling)

**Delta reporting:**
```
v1: 6.8/10 (baseline)
v2: 7.5/10 (+0.7) ← Improved consistency, estética
v3: 8.2/10 (+0.7) ← Better error handling, documentation
```

---

### Phase 5: Auto-Generate Engineering Prompts

For each identified opportunity/problem, I generate a ready-to-use **engineering command prompt** in your standardized 5-section format:

#### Template Structure:

```markdown
# 🚀 COMANDO DE ENGENHARIA: [Project Name]

**Status do Sistema:** [Technology Stack from SPEC]

## 🎭 1. ROLE & CONTEXTO GLOBAL

**Atue como:** [Role inferred from design context]

**O nosso Contexto:** [2-3 sentences with user segment, environment, constraints from SPEC]

## 📜 2. OS MANDAMENTOS DO NOSSO PWA/SYSTEM (NÃO QUEBRAR)

[1-5 critical architecture rules specific to this project]
- Based on constraints identified in design analysis
- Extracted from design tokens, component patterns, integrations
- Focused on performance, accessibility, consistency

## 🎯 3. A MISSÃO ATUAL

**Tipo de Tarefa:** [Create Feature / Refactor Screen / Fix Bug / Implement Design]

**Objetivo:** [Specific, from the opportunity/problem identified]

## 🛠️ 4. REGRAS ESPECÍFICAS DESTA TAREFA

- **Dados:** [Data flow from SPEC]
- **Design:** [Design requirements from current SPEC version]
- **Prevenção:** [Common pitfalls from identified gaps]
- **Ação Extra:** [Additional success criteria]

## 📦 5. OUTPUT ESPERADO

[Clear, actionable output specification]
```

**Key:** Each prompt is **self-contained** — no additional context needed. A dev can grab it and start coding immediately.

---

### Phase 6: Generate Version File

Output file saved as: `/path/to/_spec-design/[system-name]-spec.v[N].md`

File includes:
- Complete PRD
- Complete heuristic analysis
- Auto-calculated score
- Delta vs previous version (if v2+)
- Engineering prompts for every identified opportunity
- Decision tree (rationale behind design choices)
- Risk & mitigation matrix (optional, when relevant)

---

## Figma Integration (Optional but Recommended)

If you provide a Figma URL or node ID, I will:

1. **Read design structure** using Figma MCP:
   - Component hierarchy and naming
   - Variants and component sets
   - Design tokens (colors, spacing, typography)
   - Annotations and component descriptions
   - Layer organization

2. **Extract architecture from design:**
   - Page flow from artboard structure
   - Components list from component set
   - Interactions from prototypes (if available)
   - Constraints and responsive behavior

3. **Map to SPEC sections:**
   - Figma pages → SPEC sections
   - Components → Componentes Globais
   - Design tokens → Paleta de Cores
   - Interactions → Funcionalidades Interativas

This reduces manual work from 2 hours → 30 minutes and ensures alignment between Figma and SPEC.

---

## Common Rationalizations (Don't Fall For These)

| Rationalization | Reality |
|:--|:--|
| "This will be too long, let's skip the analysis" | SPEC v1 is foundation. Time invested now prevents rework. Even v1 takes 2–3 hours max. |
| "Score doesn't matter, only qualitative feedback" | Score is a north star metric. Showing v1: 6.8 → v3: 8.2 proves progress and justifies investment. |
| "We can skip the heuristic analysis, just do PRD" | Heuristics catch UX debt early. Problems identified in v1 cost 1 hour to fix; in production they cost 40 hours. |
| "Engineering prompts are overkill, devs will figure it out" | Prompts remove ambiguity. Without them: back-and-forth, rework, inconsistency. With them: ship in 1 sprint. |
| "Delta comparison is just change tracking" | Delta is how you prove you're improving. It shows which heuristics moved, why, and what worked. |

---

## Red Flags

🚩 **Stop and clarify if:**

- You don't know your primary user segment (→ can't assess UX heuristics fairly)
- Design has no clear information architecture (→ too early for spec, do IA first)
- You're trying to spec a design before flows are finalized (→ iterate flows first)
- No stakeholder alignment on success criteria (→ spec PRD section first, then heuristics)
- Previous version doesn't exist but you're claiming v2 (→ check git history or create v1 baseline)

---

## Verification

After I generate your SPEC:

- [ ] **PRD accuracy:** Does it match what's in Figma / your description?
- [ ] **Heuristic scoring:** Do the scores feel fair? (Can you point to specific reasons for each score?)
- [ ] **Delta clarity:** Is it obvious what changed from v1 → v2?
- [ ] **Engineering prompts:** Would a dev be able to execute on these without asking questions?
- [ ] **Gaps identified:** Are the "problems/opportunities" sections revealing real work?

If any are ❌, we iterate the SPEC before finalizing.

---

## Version Control & Repository

**File naming convention:**
```
_spec-design/
├── [system-name]-spec.v1.md    (baseline)
├── [system-name]-spec.v2.md    (iteration 1)
├── [system-name]-spec.v3.md    (iteration 2)
└── README.md                   (index of all versions)
```

**Version increments:**
- **v1 → v2:** New feature, new flow, or 3+ heuristics improved by 2+ points
- **v2 → v3:** Refinement, iteration on feedback, or ongoing optimization
- **NEVER rewrite v1:** Always create new versions; history is precious

**Metadata in each file:**
```markdown
| Versão | Data | Score UX | Delta | Mudanças Principais |
|--------|------|----------|-------|---------------------|
| v1 | 15/01 | 6.8 | — | Versão inicial |
| v2 | 01/02 | 7.5 | +0.7 | [List 2-3 main changes] |
```

---

## Example: Full Cycle

### Start
```
Design completed in Figma
→ Run spec-evolution on Figma URL
→ Generate [system-name]-spec.v1.md
→ Score: 6.8/10
```

### 2 weeks later (after feedback loop)
```
Design iterated based on feedback
→ Run spec-evolution again
→ Generate [system-name]-spec.v2.md
→ Score: 7.5/10 (+0.7)
→ Delta shows: improved Consistency, better Error Handling
→ Engineering prompts updated for new issues
```

### Archive
```
Both files live in _spec-design/
History intact, full traceability
Team can see score evolution over time
```

---

## Next Steps

1. **Prepare your input:** Figma URL (recommended) or design description + screenshots
2. **Confirm previous version:** If this is an update, share the previous SPEC file
3. **Clarify version number:** Is this v1 (first), v2 (iteration), etc.?
4. **Run the analysis:** I'll generate complete SPEC with all sections

**Ready? Let's go.**

---

**Skill Status:** Production-ready
**Last Updated:** April 2026
**Author:** Design + Claude
