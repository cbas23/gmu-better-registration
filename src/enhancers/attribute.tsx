import type { JSX } from "solid-js";
import { render } from "solid-js/web";
import { createOverlay } from "@/utils/overlay";

const PILL_COLORS = [
  "bg-red-200",
  "bg-orange-200",
  "bg-yellow-200",
  "bg-green-200",
  "bg-cyan-200",
  "bg-blue-200",
  "bg-purple-200",
  "bg-pink-200",
];

export interface AttributeData {
  attributes: string[];
}

export function extractAttributeData(
  td: HTMLTableCellElement,
): AttributeData | null {
  const spans = td.querySelectorAll("span");

  const brTags = td.querySelectorAll("br");
  brTags.forEach((br) => br.remove());

  if (spans.length === 0) return null;

  const attributes = Array.from(spans)
    .map((s) => s.textContent?.trim() ?? "")
    .filter((t) => t.length > 0);

  return attributes.length > 0 ? { attributes } : null;
}

function AttributeOverlay(props: AttributeData): JSX.Element {
  return (
    <div class="absolute inset-0 flex flex-wrap items-center gap-0.5 p-0.5 h-4">
      {props.attributes.map((attr, i) => (
        <span
          class={`${PILL_COLORS[i % PILL_COLORS.length]} px-1 py-px rounded text-xs text-gray-800 inline-block`}
        >
          {attr}
        </span>
      ))}
    </div>
  );
}

export function enhanceAttribute(td: HTMLTableCellElement): void {
  const data = extractAttributeData(td);
  if (!data) return;

  const overlay = createOverlay(td);
  if (!overlay) return;
  render(() => <AttributeOverlay {...data} />, overlay);
}
