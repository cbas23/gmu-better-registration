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

export function Tooltip(props: TooltipProps): JSX.Element {
  const [mounted, setMounted] = createSignal(false);
  const [visible, setVisible] = createSignal(false);
  const [anchor, setAnchor] = createSignal({ top: 0, left: 0 });
  let trigger!: HTMLDivElement;
  let hideTimer: ReturnType<typeof setTimeout> | undefined;
  let frame: number | undefined;

  function cancelPending() {
    clearTimeout(hideTimer);
    hideTimer = undefined;
    if (frame !== undefined) cancelAnimationFrame(frame);
    frame = undefined;
  }

  function position() {
    const rect = trigger.getBoundingClientRect();
    setAnchor({
      top: rect.top + rect.height / 2,
      left: props.position === "left" ? rect.left : rect.right,
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
    position();
    setMounted(true);
    frame = requestAnimationFrame(() => {
      frame = undefined;
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
    window.addEventListener("resize", position);
    document.addEventListener("scroll", position, true);
    onCleanup(() => {
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
            role="tooltip"
            class="fixed z-[9999] bg-gray-900 shadow-md whitespace-nowrap pointer-events-none"
            style={{
              top: `${anchor().top}px`,
              left: `${anchor().left}px`,
              transform:
                props.position === "left"
                  ? "translateY(-50%) translateX(-100%)"
                  : "translateY(-50%)",
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
