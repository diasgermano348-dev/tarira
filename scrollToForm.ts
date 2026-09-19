/**
 * Leva o utilizador ao TOPO de um formulário, com o título e os primeiros campos visíveis.
 *
 * Problemas que resolve nos botões que "levam a um formulário":
 *  - o cabeçalho fixo (header `fixed top-0`) tapava o início do formulário com scrollIntoView();
 *  - `block: "center"` cortava o topo de formulários altos;
 *  - o formulário ainda não existia no DOM (mudança de separador) quando o scroll corria;
 *  - o layout mexia (imagens/animações) depois do scroll e o formulário ficava deslocado.
 *
 * Dentro de um modal (overlay fixo) usa o scroll do próprio modal, sem tocar na página de fundo.
 */

type Target = string | HTMLElement | null | undefined;

const DEFAULT_HEADER_HEIGHT = 112;
const EXTRA_BREATHING_SPACE = 12;

function resolve(target: Target): HTMLElement | null {
  if (!target) return null;
  return typeof target === "string" ? document.getElementById(target) : target;
}

export function getFixedHeaderOffset(): number {
  const header = document.querySelector<HTMLElement>("header.fixed");
  const height = header ? header.getBoundingClientRect().height : 0;
  return (height > 0 ? height : DEFAULT_HEADER_HEIGHT) + EXTRA_BREATHING_SPACE;
}

function alignToTop(el: HTMLElement, behavior: ScrollBehavior) {
  // Dentro de um modal: rola o próprio modal (a página de fundo está bloqueada)
  if (el.closest(".fixed.inset-0")) {
    el.scrollIntoView({ behavior, block: "start" });
    return;
  }
  const top = el.getBoundingClientRect().top + window.scrollY - getFixedHeaderOffset();
  window.scrollTo({ top: Math.max(0, top), behavior });
}

export function scrollToForm(
  target: Target,
  options: { behavior?: ScrollBehavior; waitMs?: number } = {}
) {
  if (typeof window === "undefined") return;
  const behavior = options.behavior ?? "smooth";
  const waitMs = options.waitMs ?? 1200;
  const startedAt = performance.now();

  const attempt = () => {
    const el = resolve(target);
    if (!el) {
      // O formulário pode ainda estar a renderizar (ex.: mudança de separador)
      if (performance.now() - startedAt < waitMs) requestAnimationFrame(attempt);
      return;
    }
    alignToTop(el, behavior);
    // Correcção final: se o layout mexeu entretanto, volta a alinhar o topo do formulário
    window.setTimeout(() => {
      const again = resolve(target);
      if (!again || again.closest(".fixed.inset-0")) return;
      const drift = again.getBoundingClientRect().top - getFixedHeaderOffset();
      if (Math.abs(drift) > 16) alignToTop(again, "auto");
    }, behavior === "smooth" ? 700 : 150);
  };

  requestAnimationFrame(attempt);
}
