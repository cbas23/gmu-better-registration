import { type Accessor, type JSX } from "solid-js";
import { render } from "solid-js/web";

export type TooltipPosition = "left" | "right";

export interface TooltipOptions {
  content: JSX.Element;
  position?: TooltipPosition;
}

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      tooltip: TooltipOptions | JSX.Element;
    }
  }
}

function tooltip(
  el: HTMLElement,
  options: Accessor<TooltipOptions | JSX.Element>,
) {
  let tooltipEl: HTMLDivElement | null = null;
  let dispose: (() => void) | null = null;

  function position() {
    if (!tooltipEl) return;
    const rect = el.getBoundingClientRect();
    const opts = options();
    const pos =
      typeof opts === "object" && opts !== null && "position" in opts
        ? opts.position
        : undefined;

    tooltipEl.style.top = `${rect.top + rect.height / 2}px`;
    tooltipEl.style.transform = "translateY(-50%)";

    if (pos === "left") {
      tooltipEl.style.left = `${rect.left}px`;
      tooltipEl.style.transform += " translateX(-100%)";
    } else {
      tooltipEl.style.left = `${rect.right}px`;
    }
  }

  function show() {
    if (tooltipEl) return;

    const opts = options();
    const isOptions = (v: unknown): v is TooltipOptions =>
      typeof v === "object" && v !== null && "content" in v;

    const content = isOptions(opts) ? opts.content : opts;

    tooltipEl = document.createElement("div");
    tooltipEl.className =
      "fixed z-[9999] bg-gray-900 shadow-md whitespace-nowrap pointer-events-none";
    tooltipEl.style.opacity = "0";
    tooltipEl.style.transition = "opacity 150ms ease-in-out";

    dispose = render(() => content, tooltipEl!);
    document.body.appendChild(tooltipEl);
    position();
    requestAnimationFrame(() => {
      if (tooltipEl) tooltipEl.style.opacity = "1";
    });
  }

  function hide() {
    if (!tooltipEl) return;
    tooltipEl.style.opacity = "0";
    setTimeout(() => {
      dispose?.();
      dispose = null;
      tooltipEl?.remove();
      tooltipEl = null;
    }, 150);
  }

  el.addEventListener("mouseenter", show);
  el.addEventListener("mouseleave", hide);
  el.addEventListener("mousedown", show);
  el.addEventListener("mouseup", hide);

  return () => {
    hide();
    el.removeEventListener("mouseenter", show);
    el.removeEventListener("mouseleave", hide);
    el.removeEventListener("mousedown", show);
    el.removeEventListener("mouseup", hide);
  };
}

export { tooltip };
