type CellEnhancer = (td: HTMLTableCellElement) => void;

export class EnhancedTable {
  private static enhancers = new Map<string, CellEnhancer>();

  static registerEnhancer(key: string, fn: CellEnhancer) {
    EnhancedTable.enhancers.set(key, fn);
  }

  private table: HTMLTableElement;
  private observer: MutationObserver;

  constructor(table: HTMLTableElement) {
    this.table = table;
    this.observer = new MutationObserver(() => {
      this.observer.disconnect();
      this.enhance();
      this.observer.observe(this.table, { childList: true, subtree: true });
    });
  }

  start() {
    this.enhance();
    this.observer.observe(this.table, { childList: true, subtree: true });
  }

  private enhance() {
    this.styleHeaders();
    this.enhanceRows();
  }

  private styleHeaders() {
    const ths = this.table.querySelectorAll<HTMLElement>("thead th");
    ths.forEach((th) => {
      th.style.setProperty("background-color", "#e5e7eb", "important");
      th.style.setProperty("color", "#1f2937", "important");
      th.style.setProperty("border-bottom", "2px solid #9ca3af", "important");
    });
  }

  private enhanceRows() {
    const rows = this.table.querySelectorAll("tbody tr");
    if (rows.length === 0) return;

    rows.forEach((row) => {
      const tr = row as HTMLTableRowElement;
      if (tr.dataset.rmpEnhanced) return;
      tr.dataset.rmpEnhanced = "true";

      const tds = tr.querySelectorAll("td");
      tds.forEach((td) => {
        td.style.setProperty("padding", "2px");
        td.style.setProperty("padding-left", "8px");
      });

      tds.forEach((td) => {
        const key = td.getAttribute("xe-field");
        if (key) {
          const enhancer = EnhancedTable.enhancers.get(key);
          if (enhancer) enhancer(td);
        }
      });
    });
  }
}
