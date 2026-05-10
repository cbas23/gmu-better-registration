import type { JSX } from "solid-js";
import { render } from "solid-js/web";
import { createOverlay } from "@/utils/overlay";

export interface TextData {
  text: string;
}

export function extractAddData(td: HTMLTableCellElement): TextData | null {
  removeTooltip(td);
  const text = td.textContent?.trim();
  if (!text) return null;
  return { text };
}

export function enhanceAdd(td: HTMLTableCellElement): void {
  const data = extractAddData(td);
  if (!data) return;
}
