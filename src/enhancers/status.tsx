import type { JSX } from "solid-js";
import { render } from "solid-js/web";
import { createOverlay } from "@/utils/overlay";

export interface TextData {
  text: string;
}

export function extractStatusData(td: HTMLTableCellElement): TextData | null {
  const text = td.textContent?.trim();

  const brTags = td.querySelectorAll("br");
  brTags.forEach((br) => br.remove());
  //class="status-linked
  const linked = td.querySelectorAll<HTMLElement>("[class*='status']");
  linked.forEach((el) => (el.style.display = "none"));

  if (!text) return null;
  return { text };
}

function StatusOverlay(props: TextData): JSX.Element {
  return (
    <div class="absolute inset-0 flex items-center">
      <span class="text-sky-600">{props.text}</span>
    </div>
  );
}

export function enhanceStatus(td: HTMLTableCellElement): void {
  const data = extractStatusData(td);
  if (!data) return;

  const overlay = createOverlay(td);
  if (!overlay) return;
  render(() => <StatusOverlay {...data} />, overlay);
}
