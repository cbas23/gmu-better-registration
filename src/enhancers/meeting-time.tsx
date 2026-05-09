import type { JSX } from "solid-js";
import { render } from "solid-js/web";
import { createOverlay } from "@/utils/overlay";
import { Carousel } from "@/utils/carousel";
import { tooltip, type TooltipOptions } from "@/utils/tooltip";

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      tooltip: TooltipOptions | JSX.Element;
    }
  }
}

export interface MeetingInfo {
  days: string[];
  startTime: string;
  endTime: string;
  type: string;
  building: string;
  room: string;
  startDate: string;
  endDate: string;
  schedule: string;
}

export interface MeetingTimeData {
  meetings: MeetingInfo[];
}

function parseDays(scheduleEl: Element): string[] {
  const activeLis = scheduleEl.querySelectorAll(
    "li.ui-state-highlight, li[aria-checked='true']",
  );
  return Array.from(activeLis).map(
    (li) => (li as HTMLElement).dataset.name ?? "",
  );
}

function parseTime(scheduleEl: Element): {
  startTime: string;
  endTime: string;
} {
  const timeContainer = scheduleEl.querySelector(
    ":scope > span:not(.ui-pillbox)",
  );
  if (!timeContainer) return { startTime: "", endTime: "" };

  const spans = timeContainer.querySelectorAll("span");
  if (spans.length < 4) return { startTime: "", endTime: "" };

  const rawText = timeContainer.textContent?.trim() ?? "";
  const startMatch = rawText.match(/(\d+:\d+\s*(?:AM|PM))/i);
  const endMatch = rawText.match(/-\s*(\d+:\d+\s*(?:AM|PM))/i);

  return {
    startTime: startMatch?.[1]?.trim() ?? "",
    endTime: endMatch?.[1]?.trim() ?? "",
  };
}

function parseTooltipRows(meetingEl: Element): Record<string, string> {
  const rows = meetingEl.querySelectorAll(".tooltip-row");
  const result: Record<string, string> = {};
  for (const row of rows) {
    const labelEl = row.querySelector(":scope > span");
    const label =
      labelEl?.textContent
        ?.replace(/\u00a0/g, " ")
        .trim()
        .replace(/:$/, "") ?? "";
    const value =
      row.textContent?.replace(labelEl?.textContent ?? "", "").trim() ?? "";
    if (label) result[label] = value;
  }
  return result;
}

export function extractMeetingTimeData(
  td: HTMLTableCellElement,
): MeetingTimeData | null {
  const meetingEls = td.querySelectorAll(".meeting");
  if (meetingEls.length === 0) return null;

  removeTooltip(td);

  const meetings: MeetingInfo[] = [];
  for (const el of meetingEls) {
    const scheduleEl = el.querySelector(".meeting-schedule");
    if (!scheduleEl) continue;

    const days = parseDays(scheduleEl);
    const { startTime, endTime } = parseTime(scheduleEl);
    const tooltip = parseTooltipRows(el);

    const summary =
      scheduleEl.querySelector(".ui-pillbox-summary")?.textContent?.trim() ??
      "";
    const scheduleText =
      summary === "None" || !startTime
        ? ""
        : `${days.join(",")} ${startTime} - ${endTime}`.trim();

    meetings.push({
      days,
      startTime,
      endTime,
      type: tooltip["Type"] ?? "",
      building: tooltip["Building"] ?? "",
      room: tooltip["Room"] ?? "",
      startDate: tooltip["Start Date"] ?? "",
      endDate: tooltip["End Date"] ?? "",
      schedule: scheduleText,
    });
  }

  return meetings.length > 0 ? { meetings } : null;
}

const ALL_DAYS = ["S", "M", "T", "W", "T", "F", "S"] as const;
const ALL_DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

function DayPillbox(props: { days: string[] }): JSX.Element {
  return (
    <span class="inline-flex rounded-xs overflow-hidden border border-gray-700 shrink-0">
      {ALL_DAYS.map((abbr, i) => {
        const active = props.days.includes(ALL_DAY_NAMES[i]);
        return (
          <span
            class="w-3.5 h-3.5 flex items-center justify-center text-[12px] font-mono leading-none border-r border-gray-700 last:border-r-0 pt-px"
            style={{
              background: active ? "#364153" : "#fff",
              color: active ? "#fff" : "#364153",
            }}
          >
            {abbr}
          </span>
        );
      })}
    </span>
  );
}

function MeetingTooltip(props: MeetingTimeData): JSX.Element {
  const cols =
    props.meetings.length <= 4 ? 1 : props.meetings.length <= 8 ? 2 : 3;

  return (
    <div
      class="bg-white border border-gray-400 p-3"
      style={{
        display: "grid",
        "grid-template-rows": `repeat(4, auto)`,
        "grid-auto-flow": "column",
        "grid-template-columns": `repeat(${cols}, 1fr)`,
        gap: "6px 12px",
      }}
    >
      {props.meetings.map((m, i) => (
        <div
          class="flex flex-col gap-1.5"
          style={{
            "border-top": i % 4 !== 0 ? "1px solid #e5e7eb" : undefined,
            "padding-top": i % 4 !== 0 ? "12px" : undefined,
          }}
        >
          <div class="flex items-center gap-2">
            <DayPillbox days={m.days} />
          </div>
          <div class="flex flex-col gap-0.5 text-xs">
            <span class="text-xs font-medium text-gray-800">
              {m.startTime && m.endTime
                ? `${m.startTime} - ${m.endTime}`
                : "Asynchronous"}
            </span>
            {m.type && (
              <div class="flex gap-1">
                <span class="text-gray-500">Type:</span>
                <span class="text-gray-800">{m.type}</span>
              </div>
            )}
            {m.building && (
              <div class="flex gap-1">
                <span class="text-gray-500">Building:</span>
                <span class="text-gray-800">{m.building}</span>
              </div>
            )}
            {m.room && (
              <div class="flex gap-1">
                <span class="text-gray-500">Room:</span>
                <span class="text-gray-800">{m.room}</span>
              </div>
            )}
            {m.startDate && (
              <div class="flex gap-1">
                <span class="text-gray-500">Start Date:</span>
                <span class="text-gray-800">{m.startDate}</span>
              </div>
            )}
            {m.endDate && (
              <div class="flex gap-1">
                <span class="text-gray-500">End Date:</span>
                <span class="text-gray-800">{m.endDate}</span>
              </div>
            )}
            {m.schedule && (
              <div class="flex gap-1 flex-col">
                <span class="text-gray-500">Schedule:</span>
                <span class="text-gray-800">{m.schedule}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function MeetingCarouselWrapper(props: {
  meetings: MeetingInfo[];
  children: JSX.Element;
}): JSX.Element {
  if (props.meetings.length <= 1) {
    return <>{props.children}</>;
  }
  return <Carousel>{props.children}</Carousel>;
}

function MeetingTimeOverlay(props: MeetingTimeData): JSX.Element {
  return (
    <div
      class="pointer-events-auto absolute inset-0 flex flex-col justify-center gap-0.5 px-1 cursor-default"
      use:tooltip={{
        content: <MeetingTooltip {...props} />,
        position: "left",
      }}
    >
      <MeetingCarouselWrapper meetings={props.meetings}>
        {props.meetings.map((m) =>
          m.startTime ? (
            <div class="w-full h-full flex items-center gap-2 px-1">
              <DayPillbox days={m.days} />
              <span class="text-[11px] text-gray-600 whitespace-nowrap">
                {m.startTime} - {m.endTime}
              </span>
            </div>
          ) : (
            <div class="w-full h-full flex items-center gap-2 px-1">
              <DayPillbox days={m.days} />
              <span class="text-[11px] text-gray-400 italic">Async</span>
            </div>
          ),
        )}
      </MeetingCarouselWrapper>
    </div>
  );
}

export function enhanceMeetingTime(td: HTMLTableCellElement): void {
  const data = extractMeetingTimeData(td);
  if (!data) return;

  const overlay = createOverlay(td);
  if (!overlay) return;
  overlay.style.position = "absolute";
  overlay.style.inset = "0";
  overlay.style.zIndex = "10";

  render(() => <MeetingTimeOverlay {...data} />, overlay);

  for (const el of td.querySelectorAll(".meeting, .accordion")) {
    (el as HTMLElement).style.display = "none";
  }
}
