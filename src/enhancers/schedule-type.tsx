import { render } from "solid-js/web";
import { createOverlay } from "@/utils/overlay";
import { removeTooltip } from "@/utils/utils";

interface Data {
  text: string;
  color: string;
}

function extractData(td: HTMLTableCellElement): Data | null {
  removeTooltip(td);

  const text = td.textContent?.trim();

  if (td.className.includes("footable-row-detail-cell")) return null;

  if (!text) return null;

  const part = text.split(" ", 1)[0] ?? text; // used for hash

  let hash = 0;
  for (let i = 0; i < part.length; i++) {
    const char = part.charCodeAt(i);
    hash = (hash << 3) - hash + char;
    hash = hash & hash;
  }

  const hue = (Math.abs(hash) % 18) * 20;
  const color = `hsl(${hue}, 50%, 40%)`;

  return { text, color };
}

function overlay(props: Data) {
  return (
    <div
      class="absolute inset-0 flex items-center px-2 pointer-events-auto"
      title={props.text}
    >
      <span
        class="text-xs truncate font-bold pl-1.5 py-0.5 rounded-sm"
        style={{ color: props.color }}
      >
        {props.text}
      </span>
    </div>
  );
}

export default function enhancer(td: HTMLTableCellElement): void {
  const data = extractData(td);
  if (!data) return;


  const container = createOverlay(td);
  if (!container) return;
  render(() => overlay(data), container);
}
