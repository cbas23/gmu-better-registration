import { removeTooltip } from "@/utils/utils";
import { EnhancedTable } from "../utils/enhanced-table";

function enhanceAdd(td: HTMLTableCellElement): void {
  removeTooltip(td);
  td.style.setProperty("height", "32px");
  td.style.setProperty("padding-top", "0px");
  td.style.setProperty("padding-bottom", "0px");
}

EnhancedTable.registerEnhancer("add", enhanceAdd);
