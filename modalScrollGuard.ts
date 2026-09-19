import { lockScroll, unlockScroll, forceUnlockScroll } from "./useBodyScrollLock";

/**
 * Guarda global de modais (cobre TODOS os modais/formulários do projecto, incluindo futuros).
 *
 * Qualquer overlay de ecrã inteiro (`fixed inset-0`) que apareça no DOM:
 *  1. bloqueia a rolagem do fundo enquanto existir (e liberta quando o último fecha);
 *  2. abre sempre no topo: repõe a rolagem do overlay e das suas áreas roláveis a 0,
 *     para o formulário/informação aparecer desde o início.
 *
 * Os overlays "internos" (fundos clicáveis dentro de um modal) são ignorados.
 */

const OVERLAY_SELECTOR = ".fixed.inset-0";
const SCROLLABLE_SELECTOR =
  '[class*="overflow-y-auto"], [class*="overflow-auto"], [class*="overflow-y-scroll"], [data-modal-scroll]';

const known = new WeakSet<Element>();
let installed = false;
let holding = false;
let scheduled = false;

function isTopLevelVisibleOverlay(el: HTMLElement): boolean {
  if (el.classList.contains("pointer-events-none")) return false;
  if (el.parentElement && el.parentElement.closest(OVERLAY_SELECTOR)) return false;
  if (el.getClientRects().length === 0) return false; // display:none (nele ou num ascendente)
  const style = getComputedStyle(el);
  return style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0";
}

function resetOverlayScroll(overlay: HTMLElement) {
  overlay.scrollTop = 0;
  overlay.querySelectorAll<HTMLElement>(SCROLLABLE_SELECTOR).forEach((el) => {
    if (el.scrollTop !== 0) el.scrollTop = 0;
  });
}

function sync() {
  const overlays = Array.from(document.querySelectorAll<HTMLElement>(OVERLAY_SELECTOR)).filter(
    isTopLevelVisibleOverlay
  );

  overlays.forEach((el) => {
    if (!known.has(el)) {
      known.add(el);
      requestAnimationFrame(() => resetOverlayScroll(el));
    }
  });

  if (overlays.length > 0) {
    if (!holding) {
      lockScroll();
      holding = true;
    }
  } else {
    if (holding) {
      unlockScroll();
      holding = false;
    }
    // Salvaguarda absoluta: se não há qualquer overlay visível no ecrã, a página tem de poder rolar livremente
    if (typeof document !== "undefined") {
      const body = document.body;
      const html = document.documentElement;
      if (body && (body.style.overflow === "hidden" || (html && html.style.overflow === "hidden"))) {
        forceUnlockScroll();
      }
    }
  }
}

function schedule() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    sync();
  });
}

export function installModalScrollGuard() {
  if (installed || typeof document === "undefined") return;
  installed = true;
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
  window.addEventListener("resize", schedule);
  sync();
}
