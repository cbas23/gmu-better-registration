import { createEffect, createSignal, onCleanup, Show, type JSX } from "solid-js";
import { Portal } from "solid-js/web";

export type TooltipPosition = "left" | "right";

export interface TooltipProps {
  children: JSX.Element;
  content: () => JSX.Element;
  position?: TooltipPosition;
  class?: string;
}

let activeClose: (() => void) | null = null;
const FADE_MS = 150;
const GAP_PX = 8;
const VIEWPORT_PADDING_PX = 8;

export function Tooltip(props: TooltipProps): JSX.Element {
  const [mounted, setMounted] = createSignal(false);
  const [visible, setVisible] = createSignal(false);
  const [anchor, setAnchor] = createSignal({ top: 0, left: 0 });
  let trigger!: HTMLDivElement;
  let popup: HTMLDivElement | undefined;
  let hideTimer: ReturnType<typeof setTimeout> | undefined;
  let frame: number | undefined;

  function cancelPending() {
    clearTimeout(hideTimer);
    hideTimer = undefined;
    if (frame !== undefined) cancelAnimationFrame(frame);
    frame = undefined;
  }

  function position() {
    if (!popup) return;
    const rect = trigger.getBoundingClientRect();
    const width = popup.getBoundingClientRect().width;
    const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
    const leftSpace = rect.left - GAP_PX - VIEWPORT_PADDING_PX;
    const rightSpace = viewportWidth - rect.right - GAP_PX - VIEWPORT_PADDING_PX;
    const preferred = props.position ?? "left";
    const side =
      leftSpace >= width && rightSpace >= width
        ? preferred
        : leftSpace >= width
          ? "left"
          : rightSpace >= width
            ? "right"
            : leftSpace >= rightSpace
              ? "left"
              : "right";
    const left = side === "left" ? rect.left - GAP_PX - width : rect.right + GAP_PX;
    setAnchor({
      top: rect.top + rect.height / 2,
      // If neither side fits, keep the popup within the viewport where possible.
      left: Math.max(
        VIEWPORT_PADDING_PX,
        Math.min(left, viewportWidth - width - VIEWPORT_PADDING_PX),
      ),
    });
  }

  function close() {
    cancelPending();
    if (activeClose === close) activeClose = null;
    setVisible(false);
    setMounted(false);
  }

  function show() {
    cancelPending();
    if (activeClose && activeClose !== close) activeClose();
    activeClose = close;
    setMounted(true);
    frame = requestAnimationFrame(() => {
      frame = undefined;
      position();
      setVisible(true);
    });
  }

  function hide() {
    cancelPending();
    setVisible(false);
    hideTimer = setTimeout(close, FADE_MS);
  }

  createEffect(() => {
    if (!mounted()) return;
    position();
    const observer = new ResizeObserver(position);
    if (popup) observer.observe(popup);
    observer.observe(trigger);
    window.addEventListener("resize", position);
    document.addEventListener("scroll", position, true);
    onCleanup(() => {
      observer.disconnect();
      window.removeEventListener("resize", position);
      document.removeEventListener("scroll", position, true);
    });
  });

  onCleanup(() => {
    cancelPending();
    if (activeClose === close) activeClose = null;
  });

  return (
    <>
      <div
        ref={trigger}
        class={props.class}
        onMouseEnter={show}
        onMouseLeave={hide}
        onMouseDown={show}
        onMouseUp={hide}
      >
        {props.children}
      </div>
      <Show when={mounted()}>
        <Portal mount={document.body}>
          <div
            ref={popup}
            role="tooltip"
            class="fixed z-[9999] bg-gray-900 shadow-md whitespace-nowrap pointer-events-none"
            style={{
              top: `${anchor().top}px`,
              left: `${anchor().left}px`,
              transform: "translateY(-50%)",
              opacity: visible() ? "1" : "0",
              transition: `opacity ${FADE_MS}ms ease-in-out`,
            }}
          >
            {props.content()}
          </div>
        </Portal>
      </Show>
    </>
  );
}
