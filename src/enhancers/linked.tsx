import { removeTooltip } from "@/utils/utils";
import { EnhancedTable } from "../utils/enhanced-table";

function enhanceLinked(td: HTMLTableCellElement): void {
  removeTooltip(td);
}

EnhancedTable.registerEnhancer("linked", enhanceLinked);
