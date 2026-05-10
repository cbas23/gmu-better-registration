import { removeTooltip } from "@/utils/utils";
import { EnhancedTable } from "../utils/enhanced-table";

function enhanceAdd(td: HTMLTableCellElement): void {
  removeTooltip(td);
}

EnhancedTable.registerEnhancer("add", enhanceAdd);
