import { render } from "solid-js/web";
import { createOverlay } from "@/utils/overlay";
import { removeTooltip } from "@/utils/utils";

function extractData(td: HTMLTableCellElement): void {
  removeTooltip(td);

  // td.style.setProperty("display", "flex");
  // td.style.setProperty("flex-direction", "row");
  // td.style.setProperty("align-items", "center");
  // td.style.setProperty("background-color", "#eee");
  // td.style.setProperty("width", "100%");
  // td.style.setProperty("overflow", "hidden");
  // td.style.setProperty("gap", "16px");
}

export default function enhancer(td: HTMLTableCellElement): void {
  extractData(td);
}
