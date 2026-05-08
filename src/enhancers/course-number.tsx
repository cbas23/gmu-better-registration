import type { JSX } from "solid-js";
import { render } from "solid-js/web";
import { createOverlay } from "@/utils/overlay";

export interface TextData {
  text: string;
}

export function extractCourseNumberData(
  td: HTMLTableCellElement,
): TextData | null {
  const text = td.textContent?.trim();
  if (!text) return null;
  return { text };
}

function CourseNumberOverlay(props: TextData): JSX.Element {
  return (
    <div class="absolute inset-0 flex items-center">
      <span class="text-red-500 font-semibold">{props.text}</span>
    </div>
  );
}

export function enhanceCourseNumber(td: HTMLTableCellElement): void {
  const data = extractCourseNumberData(td);
  if (!data) return;

  const overlay = createOverlay(td);
  if (!overlay) return;
  render(() => <CourseNumberOverlay {...data} />, overlay);
}
