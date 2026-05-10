import type { JSX } from "solid-js";
import { render } from "solid-js/web";
import { createOverlay } from "@/utils/overlay";

export interface TextData {
  text: string;
}

export function extractLinkedData(td: HTMLTableCellElement): TextData | null {
  const text = td.textContent?.trim();
  removeTooltip(td);
  if (!text) return null;
  return { text };
}

export function enhanceLinked(td: HTMLTableCellElement): void {
  extractLinkedData(td);
}
