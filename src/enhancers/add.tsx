import { removeTooltip } from "@/utils/utils";

export default function enhancer(td: HTMLTableCellElement): void {
  removeTooltip(td);
  td.style.setProperty("height", "32px");
  td.style.setProperty("padding-top", "0px");
  td.style.setProperty("padding-bottom", "0px");
}
