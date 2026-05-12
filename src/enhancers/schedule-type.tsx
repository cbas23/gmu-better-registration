import { render } from "solid-js/web";
import { createOverlay } from "@/utils/overlay";
import { removeTooltip } from "@/utils/utils";
import { EnhancedTable } from "../utils/enhanced-table";

interface ScheduleTypeData {
  text: string;
  color: string;
}

function extractScheduleTypeData(
  td: HTMLTableCellElement,
): ScheduleTypeData | null {
  removeTooltip(td);

  const text = td.textContent?.trim();
  if (!text) return null;

  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 3) - hash + char;
    hash = hash & hash;
  }

  const hue = Math.abs(hash) % 360;
  const color = `hsl(${hue}, 50%, 40%)`;

  console.log(`hash: ${text}, value: ${hue}`);

  return { text, color };
}

function ScheduleTypeOverlay(props: ScheduleTypeData) {
  return (
    <div class="absolute inset-0 flex items-center px-2 pointer-events-auto">
      <span
        class="text-xs truncate font-bold pl-1.5 py-0.5 rounded-sm"
        style={{ color: props.color }}
      >
        {props.text}
      </span>
    </div>
  );
}

function enhanceScheduleType(td: HTMLTableCellElement): void {
  const data = extractScheduleTypeData(td);
  if (!data) return;

  const overlay = createOverlay(td);
  if (!overlay) return;
  render(() => <ScheduleTypeOverlay {...data} />, overlay);
}

EnhancedTable.registerEnhancer("scheduleType", enhanceScheduleType);
