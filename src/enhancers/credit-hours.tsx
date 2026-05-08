import type { JSX } from "solid-js";
import { render } from "solid-js/web";
import { createOverlay } from "@/utils/overlay";

export interface TextData {
  text: string;
}

export function extractCreditHoursData(
  td: HTMLTableCellElement,
): TextData | null {
  const text = td.textContent?.trim();
  if (!text) return null;
  return { text };
}

function CreditHoursOverlay(props: TextData): JSX.Element {
  return (
    <div class="absolute inset-0 flex items-center">
      <span class="text-orange-500">{props.text}</span>
    </div>
  );
}

export function enhanceCreditHours(td: HTMLTableCellElement): void {
  const data = extractCreditHoursData(td);
  if (!data) return;

  const overlay = createOverlay(td);
  if (!overlay) return;
  render(() => <CreditHoursOverlay {...data} />, overlay);
}
