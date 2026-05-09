import type { JSX } from "solid-js";
import { render } from "solid-js/web";
import { createOverlay } from "@/utils/overlay";

export interface MeetingInfo {
  schedule: string;
}

export interface MeetingTimeData {
  meetings: MeetingInfo[];
}

export function extractMeetingTimeData(
  td: HTMLTableCellElement,
): MeetingTimeData | null {
  const meetingEls = td.querySelectorAll(".meeting");
  if (meetingEls.length === 0) return null;

  const meetings: MeetingInfo[] = [];
  for (const el of meetingEls) {
    const scheduleEl = el.querySelector(".meeting-schedule");
    if (scheduleEl) {
      meetings.push({ schedule: scheduleEl.textContent?.trim() ?? "" });
    }
  }

  return meetings.length > 0 ? { meetings } : null;
}

function MeetingTimeOverlay(props: MeetingTimeData): JSX.Element {
  return (
    <div class="absolute inset-0 flex items-stretch">
      {props.meetings.map((m) => (
        <div class="flex-1 flex items-center justify-center px-1">
          <span class="text-xs text-gray-800 whitespace-nowrap">
            {m.schedule}
          </span>
        </div>
      ))}
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
}
