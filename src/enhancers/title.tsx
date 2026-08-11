import { render } from "solid-js/web";
import { createOverlay } from "@/utils/overlay";
import { removeTooltip } from "@/utils/utils";

interface Data {
  text: string;
}

function extractData(td: HTMLTableCellElement): Data | null {
  removeTooltip(td);

  const text = td.textContent?.trim();

  return { text };
}

function overlay(props: Data) {
  return (
    <div class="absolute inset-0 flex items-center pl-2 pr-0.5 pointer-events-auto">
      <span class="text-xs truncate pl-0.5 py-0.5">{props.text}</span>
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
