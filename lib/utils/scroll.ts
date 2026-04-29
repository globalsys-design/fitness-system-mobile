/**
 * Helpers de scroll para o `<MobileLayout>`.
 *
 * O scroll container real é o `<main>` interno do MobileLayout (não o
 * window), porque `body` tem `height: 100dvh` para ancorar bottom-nav
 * e header.
 *
 * Por que essa implementação é robusta para mobile:
 *  1. Faz `blur()` no elemento ativo — fecha teclado virtual em iOS,
 *     que pode estar segurando o scroll context.
 *  2. Usa `requestAnimationFrame` — espera o React re-renderizar antes
 *     de tentar scrolar, garantindo que a posição alvo seja válida no
 *     novo layout.
 *  3. Usa `behavior: "auto"` (instantâneo) por padrão — `smooth` é
 *     historicamente bugado em iOS Safari e pode ser interrompido por
 *     re-renders ou outros scrolls subsequentes (ex: `scrollIntoView`
 *     de um Stepper). "auto" é determinístico.
 *  4. Aplica scroll no `<main>` E em fallbacks (window, document.body)
 *     para cobrir telas que eventualmente não usem MobileLayout.
 */

export function scrollMobileTop(behavior: ScrollBehavior = "auto") {
  if (typeof document === "undefined") return;

  // Libera o foco — fecha teclado virtual e remove qualquer scroll-lock
  // que o input ativo possa ter capturado.
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }

  // Espera o próximo paint (após React commit) para garantir que o DOM
  // já está com o novo conteúdo da etapa.
  requestAnimationFrame(() => {
    const main = document.querySelector("main");
    if (main) {
      main.scrollTo({ top: 0, behavior });
    }
    // Fallbacks defensivos
    window.scrollTo({ top: 0, behavior });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  });
}

export function scrollMobileTo(top: number, behavior: ScrollBehavior = "auto") {
  if (typeof document === "undefined") return;
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
  requestAnimationFrame(() => {
    const main = document.querySelector("main");
    if (main) {
      main.scrollTo({ top, behavior });
      return;
    }
    window.scrollTo({ top, behavior });
  });
}
