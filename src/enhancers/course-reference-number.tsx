import type { JSX } from "solid-js";
import { render } from "solid-js/web";
import { createOverlay } from "@/utils/overlay";

export interface TextData {
  text: string;
}

export function extractCourseReferenceNumberData(
  td: HTMLTableCellElement,
): TextData | null {
  const text = td.textContent?.trim();
  if (!text) return null;
  return { text };
}

function CourseReferenceNumberOverlay(props: TextData): JSX.Element {
  return (
    <div class="absolute inset-0 flex items-center">
      <span class="text-yellow-500">{props.text}</span>
    </div>
  );
}

export function enhanceCourseReferenceNumber(td: HTMLTableCellElement): void {
  const data = extractCourseReferenceNumberData(td);
  if (!data) return;

  const overlay = createOverlay(td);
  if (!overlay) return;
  render(() => <CourseReferenceNumberOverlay {...data} />, overlay);
}
