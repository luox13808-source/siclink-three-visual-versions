"use client";

type Pointer = { x: number; y: number } | null;

const WRAPPED_ATTR = "data-reveal-wrapped";

function splitText(text: string, segmenter: Intl.Segmenter | null) {
  const chunks = text.match(/\s+|[^\s]+/g) || [];

  return chunks.flatMap((chunk) => {
    if (/^\s+$/.test(chunk)) return [chunk];
    if (!segmenter) return Array.from(chunk);
    return Array.from(segmenter.segment(chunk), ({ segment }) => segment);
  });
}

function wrapRevealText(element: Element, segmenter: Intl.Segmenter | null) {
  if (element.hasAttribute(WRAPPED_ATTR)) return;
  element.setAttribute(WRAPPED_ATTR, "true");

  const nodes = Array.from(element.childNodes);

  nodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const fragment = document.createDocumentFragment();

      splitText(node.textContent || "", segmenter).forEach((token) => {
        if (/^\s+$/.test(token)) {
          fragment.append(document.createTextNode(token));
          return;
        }

        const span = document.createElement("span");
        span.className = "reveal-token";
        span.textContent = token;
        fragment.append(span);
      });

      node.replaceWith(fragment);
      return;
    }

    if (node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName !== "BR") {
      wrapRevealText(node as Element, segmenter);
    }
  });
}

export function initPointerReveal(root: ParentNode = document) {
  const segmenter =
    typeof Intl !== "undefined" && "Segmenter" in Intl
      ? new Intl.Segmenter("zh-CN", { granularity: "word" })
      : null;

  const wrapAll = () => {
    root.querySelectorAll("[data-pointer-reveal]").forEach((element) => {
      wrapRevealText(element, segmenter);
    });
  };

  wrapAll();

  let frameRequest = 0;
  let pointer: Pointer = null;

  const updatePointerReveal = () => {
    frameRequest = 0;
    const revealTokens = Array.from(root.querySelectorAll(".reveal-token"));

    if (!revealTokens.length) return;

    if (!pointer) {
      revealTokens.forEach((token) => token.classList.remove("is-lit"));
      return;
    }

    const radius = Math.max(window.innerWidth * 0.12, 150);

    revealTokens.forEach((token) => {
      const rect = token.getBoundingClientRect();
      const tokenX = rect.left + rect.width / 2;
      const tokenY = rect.top + rect.height / 2;
      const distance = Math.hypot(pointer!.x - tokenX, pointer!.y - tokenY);

      token.classList.toggle("is-lit", distance < radius);
    });
  };

  const requestPointerReveal = () => {
    if (frameRequest) return;
    frameRequest = window.requestAnimationFrame(updatePointerReveal);
  };

  const updatePointer = (event: PointerEvent) => {
    pointer = { x: event.clientX, y: event.clientY };
    requestPointerReveal();
  };

  const clearPointer = () => {
    pointer = null;
    requestPointerReveal();
  };

  const refresh = () => {
    root.querySelectorAll(`[${WRAPPED_ATTR}]`).forEach((element) => {
      element.removeAttribute(WRAPPED_ATTR);
    });
    wrapAll();
    requestPointerReveal();
  };

  document.addEventListener("pointermove", updatePointer);
  document.addEventListener("pointerleave", clearPointer);
  document.addEventListener("pointercancel", clearPointer);
  window.addEventListener("resize", requestPointerReveal);
  window.addEventListener("siclink-pointer-reveal-refresh", refresh);

  return () => {
    document.removeEventListener("pointermove", updatePointer);
    document.removeEventListener("pointerleave", clearPointer);
    document.removeEventListener("pointercancel", clearPointer);
    window.removeEventListener("resize", requestPointerReveal);
    window.removeEventListener("siclink-pointer-reveal-refresh", refresh);
    if (frameRequest) window.cancelAnimationFrame(frameRequest);
  };
}

export function refreshPointerReveal() {
  window.dispatchEvent(new Event("siclink-pointer-reveal-refresh"));
}
