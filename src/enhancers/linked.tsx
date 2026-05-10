import { removeTooltip } from "@/utils/utils";

export function enhanceLinked(td: HTMLTableCellElement): void {
  removeTooltip(td);
}
