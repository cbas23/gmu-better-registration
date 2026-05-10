import type { JSX } from "solid-js";
import { render } from "solid-js/web";
import { createOverlay } from "@/utils/overlay";

export interface TextData {
  text: string;
}

function extractText(td: HTMLTableCellElement): TextData | null {
  const text = td.textContent?.trim();
  if (!text) return null;
  return { text };
}

function TextOverlay(props: { text: string; colorClass: string }): JSX.Element {
  return (
    <div class="absolute inset-0 flex items-center">
      <span class={props.colorClass}>{props.text}</span>
    </div>
  );
}

export function createTextEnhancer(colorClass: string) {
  return function enhance(td: HTMLTableCellElement): void {
    const data = extractText(td);
    if (!data) return;

    const overlay = createOverlay(td);
    if (!overlay) return;
    render(() => <TextOverlay text={data.text} colorClass={colorClass} />, overlay);
  };
}
