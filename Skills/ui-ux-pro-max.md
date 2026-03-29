# UI/UX Pro Max — Design Intelligence Skill

Antes de gerar qualquer código de interface, siga este framework de análise:

## 1. ANÁLISE DE CONTEXTO DO PRODUTO
- Identifique o tipo de produto (SaaS, e-commerce, dashboard, landing page)
- Defina o público-alvo e suas necessidades primárias
- Mapeie os fluxos de usuário críticos (happy path + edge cases)

## 2. HIERARQUIA VISUAL (Lei de Fitts + Gestalt)
- **Proximidade**: Agrupe elementos relacionados com spacing consistente (4px grid)
- **Contraste**: CTAs primários devem ter ratio mínimo de 3:1 contra background
- **Alinhamento**: Use grid system (12 colunas desktop, 4 mobile)
- **Repetição**: Padrões visuais consistentes em toda a interface

## 3. PSICOLOGIA DAS CORES
- **Primary**: Ação principal, CTAs, links ativos — deve transmitir confiança
- **Destructive**: Ações irreversíveis (deletar, cancelar) — vermelho/coral
- **Muted**: Informação secundária, placeholders — baixo contraste
- **Success/Warning**: Feedback de sistema — verde/amber semânticos
- Nunca use mais de 3 cores de destaque por tela

## 4. PADRÕES DE INTERAÇÃO
- **Progressive Disclosure**: Revele complexidade gradualmente (wizards, accordions)
- **Feedback Imediato**: Loading states, toasts, skeleton screens para toda ação
- **Error Prevention**: Validação inline, confirmação em ações destrutivas
- **Affordance**: Botões parecem clicáveis, inputs parecem editáveis

## 5. MICRO-INTERAÇÕES
- Transições entre estados: 200-300ms ease-out
- Hover states em todos elementos interativos
- Focus rings visíveis para acessibilidade
- Animações sutis de entrada/saída (fade, slide)

## 6. MOBILE-FIRST CHECKLIST
- [ ] Touch targets mínimo 44x44px
- [ ] Texto legível sem zoom (16px base)
- [ ] Formulários com input types corretos (tel, email, number)
- [ ] Bottom sheet / drawer em vez de modais grandes
- [ ] Scroll horizontal evitado

## APLICAÇÃO
Ao receber um pedido de UI, analise TODOS os pontos acima antes de gerar código.
Documente decisões de design como comentários no código.
