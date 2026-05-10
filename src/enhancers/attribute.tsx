import type { JSX } from "solid-js";
import { render } from "solid-js/web";
import { createOverlay } from "@/utils/overlay";
import { Carousel } from "@/utils/carousel";
import { removeTooltip } from "@/utils/removeTooltip";
// import { tooltip } from "@/utils/tooltip";

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

  td.setAttribute("data-id", "0");
  // remove the original tooltip when the mouse enters
  removeTooltip(td);

  const brTags = td.querySelectorAll("br");
  brTags.forEach((br) => br.remove());

  if (spans.length === 0) return null;

  const attributes = Array.from(spans)
    .map((s) => s.textContent?.trim() ?? "")
    .filter((t) => t.length > 0);

  return attributes.length > 0 ? { attributes } : null;
}

function AttributeOverlay(props: AttributeData): JSX.Element {
  const tooltipContent = (
    <div class="flex flex-col border border-gray-400 bg-white p-2 gap-2">
      <span class="font-bold">Attributes:</span>
      {props.attributes.map((attr) => (
        <span class="bg-gray-200 px-2 py-1 text-xs text-gray-800 flex items-center w-max rounded-sm">
          {attr}
        </span>
      ))}
    </div>
  );

  return (
    <div
      class="absolute inset-0 flex flex-col h-full pointer-events-auto"
      use:tooltip={{ content: tooltipContent, position: "left" }}
    >
      <Carousel>
        {props.attributes.map((attr) => (
          <div class="w-full h-full flex items-center px-1">
            <span class="bg-gray-200 px-2 py-1 text-xs text-gray-800 flex items-center w-max rounded-sm">
              {attr}
            </span>
          </div>
        ))}
      </Carousel>
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
