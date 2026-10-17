import type { JSX } from "solid-js";
import { render } from "solid-js/web";
import { proxyClick } from "@/utils/proxy-click";

const OVERLAY_ATTR = "data-custom-overlay";

export function createOverlay(td: HTMLTableCellElement): HTMLDivElement | null {
  td.style.position = "relative";

  const existing = td.querySelector(`[${OVERLAY_ATTR}]`);
  if (existing) {
    return null;
  }

  const overlay = document.createElement("div");
  overlay.setAttribute(OVERLAY_ATTR, "");
  overlay.className = "absolute inset-0 z-10  bg-white pointer-events-none";
  td.appendChild(overlay);
  proxyClick(overlay, td);

  return overlay;
}

const overlayRoots = new Map<HTMLElement, () => void>();
let removalObserver: MutationObserver | undefined;

/** Mount a cell UI and dispose its Solid tree when the host removes it. */
export function renderOverlay(
  content: () => JSX.Element,
  container: HTMLElement,
): void {
  const dispose = render(content, container);
  overlayRoots.set(container, dispose);

  if (removalObserver) return;
  removalObserver = new MutationObserver((records) => {
    if (!records.some((record) => record.removedNodes.length > 0)) return;
    for (const [element, cleanup] of overlayRoots) {
      if (element.isConnected) continue;
      overlayRoots.delete(element);
      cleanup();
    }
    if (overlayRoots.size === 0) {
      removalObserver?.disconnect();
      removalObserver = undefined;
    }
  });
  removalObserver.observe(document.body, { childList: true, subtree: true });
}
