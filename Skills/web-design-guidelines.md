# Web Design Guidelines — Quality Checker Skill

Atua como verificador de qualidade revisando UI contra melhores práticas.

## 1. SPACING SYSTEM (4px Grid)
```
4px  → gap-1  → Micro spacing (entre ícone e texto)
8px  → gap-2  → Tight spacing (entre items relacionados)
12px → gap-3  → Default spacing (entre campos de form)
16px → gap-4  → Section spacing (entre grupos)
24px → gap-6  → Large spacing (entre seções principais)
32px → gap-8  → XL spacing (entre blocos de página)
```

### Regras:
- Padding interno de cards: `p-4` (16px) mínimo, `p-6` (24px) ideal
- Margin entre seções: `space-y-6` ou `space-y-8`
- Gap em grids: `gap-3` (forms) ou `gap-4` (cards)
- **Consistência**: Mesmo spacing para elementos de mesmo nível hierárquico

## 2. TIPOGRAFIA
```
text-2xl font-bold     → Título de página (h1)
text-lg font-semibold  → Título de seção (h2)
text-sm font-semibold  → Título de card/subsection (h3)
text-sm font-medium    → Labels, nomes em listas
text-sm                → Corpo de texto
text-xs                → Captions, metadata, timestamps
text-[10px]            → Stepper labels (exceção)
```

### Regras:
- Máximo 3 tamanhos de fonte por componente
- Nunca misturar font-weight sem propósito hierárquico
- Line-height: `leading-tight` para headings, `leading-normal` para corpo

## 3. HIERARQUIA VISUAL
```
Nível 1: Cor primária + bold + tamanho grande → CTAs, títulos
Nível 2: Cor foreground + medium              → Subtítulos, labels
Nível 3: Cor muted-foreground + regular       → Descrições, hints
Nível 4: Cor muted-foreground/50              → Placeholders, disabled
```

### Regras:
- Cada tela deve ter 1 foco visual claro (CTA principal)
- Informação secundária recua visualmente (menor, mais clara)
- Máximo 2 CTAs primários por tela
- Empty states: ícone grande (h-12) + texto + CTA

## 4. PADRÕES DE INTERAÇÃO

### Botões
```
Primary   → Ação principal (1 por seção)
Outline   → Ação secundária (cancelar, voltar)
Ghost     → Ação terciária (deletar, opções)
Link      → Navegação textual
```

### Feedback
```
Sucesso  → toast.success() → verde, 3s auto-dismiss
Erro     → toast.error()   → vermelho, 5s auto-dismiss
Loading  → Skeleton/Spinner → durante fetch
Vazio    → Empty state      → ícone + texto + CTA
```

### Formulários
```
Validação inline  → Mostrar erro ao blur do campo
Validação submit  → Scroll até primeiro erro
Campos opcionais  → "(opcional)" no placeholder
Campos obrigatórios → Label sem indicador (padrão é obrigatório)
```

## 5. CHECKLIST DE REVISÃO

### Layout
- [ ] Alinhamento consistente (nenhum elemento "solto")
- [ ] Espaçamento uniforme entre seções
- [ ] Responsivo em 320px, 768px, 1280px
- [ ] Scroll vertical funciona sem sobreposição

### Componentes
- [ ] Botões com padding adequado (`px-4 py-2` mínimo)
- [ ] Inputs com altura consistente (`h-10` padrão)
- [ ] Cards com padding e border-radius uniformes
- [ ] Badges com contraste legível

### Cores
- [ ] Zero hex hardcoded
- [ ] Tokens semânticos corretos (primary ≠ destructive)
- [ ] Contraste AA em todos os textos
- [ ] Hover/focus states visíveis

### Tipografia
- [ ] Hierarquia clara (h1 > h2 > body > caption)
- [ ] Truncation com `truncate` em textos longos
- [ ] Max-width em parágrafos para legibilidade

### Interação
- [ ] Loading state em todo botão que faz request
- [ ] Confirmação antes de ações destrutivas
- [ ] Toast feedback para toda ação do usuário
- [ ] Transições suaves (200-300ms)

## 6. ANTI-PATTERNS (Evitar)
- ❌ Modais dentro de modais
- ❌ Scroll horizontal em mobile
- ❌ Texto sobre imagem sem overlay
- ❌ Botões muito próximos em mobile (< 8px gap)
- ❌ Formulários sem feedback de sucesso/erro
- ❌ Tabelas sem versão mobile (use cards)
- ❌ Ícones sem labels em navegação principal
- ❌ Mais de 7 items em menu dropdown
