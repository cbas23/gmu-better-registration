import { removeTooltip } from "@/utils/utils";

export default function enhancer(td: HTMLTableCellElement): void {
  removeTooltip(td);
}
