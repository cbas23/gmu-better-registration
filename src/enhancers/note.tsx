import type { JSX } from "solid-js";
import { render } from "solid-js/web";
import { createOverlay } from "@/utils/overlay";
import { tooltip } from "@/utils/tooltip";
import { removeTooltip } from "@/utils/removeTooltip";

export interface TextData {
  text: string;
  lines: string[];
}

export function extractNoteData(td: HTMLTableCellElement): TextData | null {
  // class="gmu-section-note"
  const note = td.querySelector<HTMLSpanElement>(".gmu-section-note");
  if (!note) return null;
  const noteText = note.innerHTML;
  note.style.display = "none";

  removeTooltip(td);

  return { text: noteText ?? "", lines: noteText?.split("<br>") ?? [] };
}

function NoteOverlay(props: TextData): JSX.Element {
  const tooltipContent = (
    <div class="flex flex-col bg-white border border-gray-400 p-2">
      {props.lines.map((line) => (
        <span class="text-xs bg-red-100 px-1.5 py-0.5 text-red-800 first:rounded-t-sm last:rounded-b-sm">
          {line}
        </span>
      ))}
    </div>
  );

  return (
    <div
      class="absolute inset-0 flex items-center justify-center pointer-events-auto"
      use:tooltip={{ content: tooltipContent, position: "left" }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6 text-red-500"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
          clip-rule="evenodd"
        />
      </svg>
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
