import { createEffect, createSignal, onCleanup, Show, type JSX } from "solid-js";
import { Portal } from "solid-js/web";

export type TooltipPosition = "left" | "right";

export interface TooltipProps {
  children: JSX.Element;
  content: () => JSX.Element;
  position?: TooltipPosition;
  class?: string;
  /** Lets the pointer travel from the trigger into the tooltip and interact with it. */
  interactive?: boolean;
}

type Point = { x: number; y: number };

let activeClose: (() => void) | null = null;
// Hit-test for the safe polygon of the tooltip the pointer is currently travelling towards.
let activeSafeZone: ((p: Point) => boolean) | null = null;
const FADE_MS = 150;
const GAP_PX = 8;
const VIEWPORT_PADDING_PX = 8;
const SAFE_APEX_BUFFER_PX = 3;
const SAFE_REST_MS = 300;

// Ray-casting point-in-polygon test.
function inPolygon(p: Point, poly: Point[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i]!;
    const b = poly[j]!;
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) {
      inside = !inside;
    }
  }
  return inside;
}

export function Tooltip(props: TooltipProps): JSX.Element {
  const [mounted, setMounted] = createSignal(false);
  const [visible, setVisible] = createSignal(false);
  const [anchor, setAnchor] = createSignal({ top: 0, left: 0 });
  let trigger!: HTMLDivElement;
  let popup: HTMLDivElement | undefined;
  let hideTimer: ReturnType<typeof setTimeout> | undefined;
  let frame: number | undefined;
  let side: TooltipPosition = props.position ?? "left";
  let stopTracking: (() => void) | undefined;
  let deferred = false;

  function cancelPending() {
    stopTracking?.();
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
    side =
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

  function onTriggerEnter(e: MouseEvent) {
    // Another tooltip's safe polygon covers this trigger; let the pointer reach that tooltip
    // and retry on later moves in case it leaves the polygon while still over this trigger.
    deferred = activeClose !== close && !!activeSafeZone?.({ x: e.clientX, y: e.clientY });
    if (!deferred) show();
  }

  function onTriggerMove(e: MouseEvent) {
    if (deferred) onTriggerEnter(e);
  }

  // Triangle from the exit point to the popup's two near corners.
  function safePolygon(exit: Point): Point[] {
    const r = popup!.getBoundingClientRect();
    const edgeX = side === "left" ? r.right : r.left;
    // Nudge the apex away from the popup so the first pixels of movement stay inside.
    const apexX = exit.x + (side === "left" ? SAFE_APEX_BUFFER_PX : -SAFE_APEX_BUFFER_PX);
    return [
      { x: apexX, y: exit.y },
      { x: edgeX, y: r.top },
      { x: edgeX, y: r.bottom },
    ];
  }

  function onTriggerLeave(e: MouseEvent) {
    deferred = false;
    if (!props.interactive || !popup || !visible()) return hide();
    cancelPending();
    const exit = { x: e.clientX, y: e.clientY };
    const inZone = (p: Point) => inPolygon(p, safePolygon(exit));
    let restTimer: ReturnType<typeof setTimeout> | undefined;
    // Close if the pointer rests inside the polygon without reaching the popup.
    const rest = () => {
      clearTimeout(restTimer);
      restTimer = setTimeout(hide, SAFE_REST_MS);
    };
    const onMove = (ev: PointerEvent) => {
      if (inZone({ x: ev.clientX, y: ev.clientY })) rest();
      else hide();
    };
    document.addEventListener("pointermove", onMove);
    activeSafeZone = inZone;
    rest();
    stopTracking = () => {
      document.removeEventListener("pointermove", onMove);
      clearTimeout(restTimer);
      if (activeSafeZone === inZone) activeSafeZone = null;
      stopTracking = undefined;
    };
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
        onMouseEnter={onTriggerEnter}
        onMouseMove={onTriggerMove}
        onMouseLeave={onTriggerLeave}
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
            class="fixed z-[9999] bg-gray-900 shadow-md whitespace-nowrap"
            classList={{ "pointer-events-none": !props.interactive }}
            style={{
              top: `${anchor().top}px`,
              left: `${anchor().left}px`,
              transform: "translateY(-50%)",
              opacity: visible() ? "1" : "0",
              transition: `opacity ${FADE_MS}ms ease-in-out`,
            }}
            onMouseEnter={() => props.interactive && show()}
            onMouseLeave={() => props.interactive && hide()}
          >
            {props.content()}
          </div>
        </Portal>
      </Show>
    </>
  );
}
