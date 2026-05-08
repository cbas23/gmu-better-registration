import type { JSX } from "solid-js";
import { render } from "solid-js/web";
import { createOverlay } from "@/utils/overlay";

export interface TextData {
  text: string;
}

export function extractAddData(td: HTMLTableCellElement): TextData | null {
  const text = td.textContent?.trim();
  if (!text) return null;
  return { text };
}

function AddOverlay(props: TextData): JSX.Element {
  return (
    <div class="absolute inset-0 flex items-center">
      <span class="text-purple-600">{props.text}</span>
    </div>
  );
}

export function enhanceAdd(td: HTMLTableCellElement): void {
  const data = extractAddData(td);
  if (!data) return;

  const overlay = createOverlay(td);
  if (!overlay) return;
  render(() => <AddOverlay {...data} />, overlay);
}
