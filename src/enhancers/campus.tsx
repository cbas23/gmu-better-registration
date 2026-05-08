import type { JSX } from "solid-js";
import { render } from "solid-js/web";
import { createOverlay } from "@/utils/overlay";

export interface TextData {
  text: string;
}

export function extractCampusData(td: HTMLTableCellElement): TextData | null {
  const text = td.textContent?.trim();
  if (!text) return null;
  return { text };
}

function CampusOverlay(props: TextData): JSX.Element {
  return (
    <div class="absolute inset-0 flex items-center">
      <span class="text-lime-500">{props.text}</span>
    </div>
  );
}

export function enhanceCampus(td: HTMLTableCellElement): void {
  const data = extractCampusData(td);
  if (!data) return;

  const overlay = createOverlay(td);
  if (!overlay) return;
  render(() => <CampusOverlay {...data} />, overlay);
}
