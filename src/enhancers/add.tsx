import { removeTooltip } from "@/utils/utils";

export function enhanceAdd(td: HTMLTableCellElement): void {
  removeTooltip(td);
}
