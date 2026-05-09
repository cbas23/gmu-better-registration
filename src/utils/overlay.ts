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

  return overlay;
}
