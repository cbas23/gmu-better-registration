import type { JSX } from "solid-js";
import { render } from "solid-js/web";
import { createOverlay } from "@/utils/overlay";
import { tooltip } from "@/utils/tooltip";
import { clearTitle, removeTooltip } from "@/utils/utils";

interface Data {
  unreservedSeats: number;
  unreservedSeatsLeft: number;
  reservedSeats: number;
  reservedSeatsLeft: number;
}

function extractSeatCount(
  text: string,
  seatType: "unreserved" | "reserved",
): { seats: number; seatsLeft: number } | null {
  const match = text.match(
    new RegExp(`(\\d+)\\s+of\\s+(\\d+)\\s+${seatType} seats remain`, "i"),
  );
  if (!match) return null;

  return {
    seatsLeft: Number.parseInt(match[1]!, 10),
    seats: Number.parseInt(match[2]!, 10),
  };
}

function extractData(td: HTMLTableCellElement): Data | null {
  const text = td.textContent ?? "";
  const unreserved = extractSeatCount(text, "unreserved");
  const reserved = extractSeatCount(text, "reserved");
  if (!unreserved || !reserved) return null;

  removeTooltip(td);
  clearTitle(td);
  td.querySelectorAll<HTMLElement>("span, br").forEach((element) => {
    element.style.display = "none";
  });

  return {
    unreservedSeats: unreserved.seats,
    unreservedSeatsLeft: unreserved.seatsLeft,
    reservedSeats: reserved.seats,
    reservedSeatsLeft: reserved.seatsLeft,
  };
}

function overlay(props: Data): JSX.Element {
  const tooltipContent = (
    <div class="flex flex-col gap-1 border border-gray-400 bg-white p-2 text-xs text-gray-800">
      <span>
        Unreserved: {" "}
        <span class="font-bold text-violet-800">
          {props.unreservedSeatsLeft}
        </span>{" "}
        / {props.unreservedSeats} remaining
      </span>
      <span>
        Reserved: {" "}
        <span class="font-bold text-emerald-800">
          {props.reservedSeatsLeft}
        </span>{" "}
        / {props.reservedSeats} remaining
      </span>
    </div>
  );

  return (
    <div
      class="absolute inset-0 flex items-center gap-1 px-1 pointer-events-auto"
      use:tooltip={{ content: tooltipContent, position: "left" }}
    >
      <span
        class="rounded-sm bg-violet-100 px-1.5 py-0.5 text-xs font-medium text-violet-800"
        aria-label={`${props.unreservedSeatsLeft} of ${props.unreservedSeats} unreserved seats remaining`}
      >
        <b>{props.unreservedSeatsLeft}</b> / {props.unreservedSeats}
      </span>
      <span
        class="rounded-sm bg-emerald-100 px-1.5 py-0.5 text-xs font-medium text-emerald-800"
        aria-label={`${props.reservedSeatsLeft} of ${props.reservedSeats} reserved seats remaining`}
      >
        <b>{props.reservedSeatsLeft}</b> / {props.reservedSeats}
      </span>
    </div>
  );
}

export default function enhancer(td: HTMLTableCellElement): void {
  const data = extractData(td);
  if (!data) return;

  const container = createOverlay(td);
  if (!container) return;
  render(() => overlay(data), container);
}
