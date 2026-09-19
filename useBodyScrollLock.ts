import { useEffect } from "react";

/**
 * Bloqueio de rolagem do ecrã de fundo enquanto um modal está aberto.
 *
 * - Usa contagem de referências: com vários modais abertos ao mesmo tempo
 *   (ex.: perfil -> recrutar), a rolagem só é libertada quando o último fecha.
 * - Compensa a largura da barra de rolagem para a página não "saltar" lateralmente.
 * - Ao abrir, ou quando `resetKey` muda (ex.: passa de um perfil para outro),
 *   repõe para 0 a rolagem de todos os elementos marcados com `data-modal-scroll`.
 */

let lockCount = 0;
let saved = { bodyOverflow: "", htmlOverflow: "", bodyPaddingRight: "" };

export function isScrollLocked(): boolean {
  return lockCount > 0;
}

export function lockScroll() {
  if (typeof document === "undefined") return;
  if (lockCount === 0) {
    const html = document.documentElement;
    const body = document.body;
    const scrollbarWidth = window.innerWidth - html.clientWidth;
    saved = {
      bodyOverflow: body.style.overflow || "",
      htmlOverflow: html.style.overflow || "",
      bodyPaddingRight: body.style.paddingRight || "",
    };
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;
    body.style.overflow = "hidden";
    html.style.overflow = "hidden";
  }
  lockCount += 1;
}

export function unlockScroll() {
  if (typeof document === "undefined") return;
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.body.style.overflow = saved.bodyOverflow || "";
    document.documentElement.style.overflow = saved.htmlOverflow || "";
    document.body.style.paddingRight = saved.bodyPaddingRight || "";
  }
}

/**
 * Liberta incondicionalmente a rolagem do documento, repondo overflow em body e html
 * e zerando a contagem de bloqueios. Essencial ao mudar de página pelo menu.
 */
export function forceUnlockScroll() {
  if (typeof document === "undefined") return;
  lockCount = 0;
  document.body.style.overflow = "";
  document.documentElement.style.overflow = "";
  document.body.style.paddingRight = "";
}

export function resetModalScroll() {
  if (typeof document === "undefined") return;
  document.querySelectorAll<HTMLElement>("[data-modal-scroll]").forEach((el) => {
    el.scrollTop = 0;
  });
}

export function useBodyScrollLock(locked: boolean, resetKey?: string | number | null) {
  useEffect(() => {
    if (!locked) return;
    lockScroll();
    return unlockScroll;
  }, [locked]);

  useEffect(() => {
    if (!locked) return;
    const id = requestAnimationFrame(resetModalScroll);
    return () => cancelAnimationFrame(id);
  }, [locked, resetKey]);
}
