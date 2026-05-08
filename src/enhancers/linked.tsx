import type { JSX } from "solid-js";
import { render } from "solid-js/web";
import { createOverlay } from "@/utils/overlay";

export interface TextData {
  text: string;
}

export function extractLinkedData(td: HTMLTableCellElement): TextData | null {
  const text = td.textContent?.trim();
  if (!text) return null;
  return { text };
}

function LinkedOverlay(props: TextData): JSX.Element {
  return (
    <div class="absolute inset-0 flex items-center">
      <span class="text-red-400">{props.text}</span>
    </div>
  );
}

export function enhanceLinked(td: HTMLTableCellElement): void {
  const data = extractLinkedData(td);
  if (!data) return;

  const overlay = createOverlay(td);
  if (!overlay) return;
  render(() => <LinkedOverlay {...data} />, overlay);
}
