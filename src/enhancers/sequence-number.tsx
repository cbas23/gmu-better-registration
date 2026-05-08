import type { JSX } from "solid-js";
import { render } from "solid-js/web";
import { createOverlay } from "@/utils/overlay";

export interface TextData {
  text: string;
}

export function extractSequenceNumberData(
  td: HTMLTableCellElement,
): TextData | null {
  const text = td.textContent?.trim();
  if (!text) return null;
  return { text };
}

function SequenceNumberOverlay(props: TextData): JSX.Element {
  return (
    <div class="absolute inset-0 flex items-center">
      <span class="text-blue-600">{props.text}</span>
    </div>
  );
}

export function enhanceSequenceNumber(td: HTMLTableCellElement): void {
  const data = extractSequenceNumberData(td);
  if (!data) return;

  const overlay = createOverlay(td);
  if (!overlay) return;
  render(() => <SequenceNumberOverlay {...data} />, overlay);
}
