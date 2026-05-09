import type { JSX } from "solid-js";
import { render } from "solid-js/web";
import { createOverlay } from "@/utils/overlay";
import { tooltip } from "@/utils/tooltip";
import { removeTooltip } from "@/utils/removeTooltip";

export interface StatusData {
  seats: number;
  seatsLeft: number;
  waitList: number;
  waitListLeft: number;
  hasTimeConflict: boolean;
  isLinked: boolean;
}

export function extractStatusData(td: HTMLTableCellElement): StatusData | null {
  removeTooltip(td);

  const brElements = td.querySelectorAll("br");
  brElements.forEach((br) => br.remove());

  const boldSpans = Array.from(
    td.querySelectorAll<HTMLSpanElement>("span.status-bold"),
  ).filter((s) => !s.closest(".status-linked"));

  const seatsLeft = parseInt(boldSpans[0]?.textContent ?? "0") || 0;
  const seatMatch = td.innerHTML.match(/of (\d+) seats remain/);
  const seats = parseInt(seatMatch?.[1] ?? "0") || 0;

  const waitListLeft = parseInt(boldSpans[1]?.textContent ?? "0") || 0;
  const waitListMatch = td.innerHTML.match(/of (\d+) waitlist seats remain/);
  const waitList = parseInt(waitListMatch?.[1] ?? "0") || 0;

  const hasTimeConflict = !!td.querySelector("span.time-conflict");
  const isLinked = !!td.querySelector(".status-linked");

  boldSpans.forEach((el) => (el.style.display = "none"));
  td.querySelectorAll<HTMLElement>("span.time-conflict").forEach(
    (el) => (el.style.display = "none"),
  );
  td.querySelectorAll<HTMLElement>(".status-linked").forEach(
    (el) => (el.style.display = "none"),
  );
  td.querySelectorAll<HTMLElement>(".status-full").forEach(
    (el) => (el.style.display = "none"),
  );
  td.querySelectorAll<HTMLElement>(".status-waitlist").forEach(
    (el) => (el.style.display = "none"),
  );

  if (seats === 0 && !hasTimeConflict && !isLinked) return null;

  return {
    seats,
    seatsLeft,
    waitList,
    waitListLeft,
    hasTimeConflict,
    isLinked,
  };
}

function StatusOverlay(props: StatusData): JSX.Element {
  const full = props.seatsLeft === 0;
  const tooltipContent = (
    <div class="flex flex-col bg-white border border-gray-400 p-2 gap-1 text-xs text-gray-800">
      <span>
        Seats:{" "}
        <span class={`${full ? "text-red-700" : "text-sky-800"} font-bold`}>
          {props.seatsLeft}
        </span>{" "}
        / {props.seats} remaining
      </span>
      {props.waitList > 0 && (
        <span>
          Waitlist:{" "}
          <span class="text-amber-700 font-bold">{props.waitListLeft}</span> /{" "}
          {props.waitList} remaining
        </span>
      )}
      {props.hasTimeConflict && (
        <span class="text-red-600 font-bold">Time Conflict!</span>
      )}
      {props.isLinked && (
        <span class="text-sky-600 font-bold">LINKED Section</span>
      )}
    </div>
  );

  return (
    <div
      class="absolute inset-0 flex items-center gap-1 px-1 pointer-events-auto"
      use:tooltip={{ content: tooltipContent, position: "left" }}
    >
      <div class="flex items-center gap-1">
        <span
          class={`${full ? "bg-red-100 text-red-800" : "bg-sky-100 text-sky-800"} relative px-1.5 py-0.5 text-xs rounded-sm font-medium`}
        >
          <b>{props.seatsLeft}</b> / {props.seats}
          {props.hasTimeConflict && (
            <span
              class="absolute w-2 h-2 bg-red-600 rounded-full"
              style={{ top: "-2px", right: "-2px" }}
            />
          )}
        </span>
        {props.waitList > 0 && (
          <span class="bg-amber-100 text-amber-800 px-1.5 py-0.5 text-xs rounded-sm font-medium">
            <b>{props.waitListLeft}</b> / {props.waitList}
          </span>
        )}
      </div>
      <div class="flex items-center gap-1 ml-auto">
        {props.isLinked && (
          <span class="bg-sky-600 text-white font-mono font-bold py-0.5 px-1 text-md rounded-sm font-medium">
            L
          </span>
        )}
      </div>
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
