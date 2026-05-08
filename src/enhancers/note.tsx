import type { JSX } from "solid-js";
import { render } from "solid-js/web";
import { createOverlay } from "@/utils/overlay";

export interface TextData {
  text: string;
}

export function extractNoteData(td: HTMLTableCellElement): TextData | null {
  const text = td.textContent?.trim();

  // class="gmu-section-note"
  const note = td.querySelector<HTMLSpanElement>(".gmu-section-note");
  if (!note) return null;
  const noteText = note.textContent?.trim();
  note.style.display = "none";

  return { text: noteText ?? "" };
}

function NoteOverlay(props: TextData): JSX.Element {
  return (
    <div class="absolute inset-0 flex items-center">
      <span class="text-red-400">{props.text}</span>
    </div>
  );
}

export function enhanceNote(td: HTMLTableCellElement): void {
  const data = extractNoteData(td);
  if (!data) return;

  const overlay = createOverlay(td);
  if (!overlay) return;
  render(() => <NoteOverlay {...data} />, overlay);
}
