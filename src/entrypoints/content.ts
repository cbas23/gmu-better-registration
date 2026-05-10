import "@/assets/tailwind-content.css";
import { enhanceInstructor } from "@/enhancers/instructor";
import { enhanceMeetingTime } from "@/enhancers/meeting-time";
import { enhanceStatus } from "@/enhancers/status";
import { enhanceLinked } from "@/enhancers/linked";
import { enhanceAdd } from "@/enhancers/add";
import { enhanceAttribute } from "@/enhancers/attribute";
import { enhanceNote } from "@/enhancers/note";

export default defineContentScript({
  matches: ["*://ssbstureg.gmu.edu/StudentRegistrationSsb/*"],
  main,
});

const columnEnhancers: Record<
  string,
  (td: HTMLTableCellElement, tr: HTMLTableRowElement) => void
> = {
  instructor: enhanceInstructor,
  meetingTime: enhanceMeetingTime,
  status: enhanceStatus,
  attribute: enhanceAttribute,
  note: enhanceNote,
  linked: enhanceLinked,
  add: enhanceAdd,
};

const observedTables = new WeakSet<HTMLTableElement>();

function main() {
  const container = document.getElementById("tabs-classSearch");
  if (container) {
    observeContainer(container);
  } else {
    const docObserver = new MutationObserver((_, obs) => {
      const el = document.getElementById("tabs-classSearch");
      if (el) {
        obs.disconnect();
        observeContainer(el);
      }
    });
    docObserver.observe(document.body, { childList: true, subtree: true });
  }
}

function observeContainer(container: Element) {
  container.querySelectorAll("table").forEach((table) => {
    if (!observedTables.has(table as HTMLTableElement)) {
      observedTables.add(table as HTMLTableElement);
      observeTable(table as HTMLTableElement);
    }
  });

  const containerObserver = new MutationObserver(() => {
    container.querySelectorAll("table").forEach((table) => {
      if (!observedTables.has(table as HTMLTableElement)) {
        observedTables.add(table as HTMLTableElement);
        observeTable(table as HTMLTableElement);
      }
    });
  });
  containerObserver.observe(container, { childList: true, subtree: true });
}

function observeTable(table: HTMLTableElement) {
  const tableObserver = new MutationObserver(() => {
    tableObserver.disconnect();
    modifyTable(table);
    tableObserver.observe(table, { childList: true, subtree: true });
  });
  modifyTable(table);
  tableObserver.observe(table, { childList: true, subtree: true });
}

function modifyTable(table: HTMLTableElement) {
  const ths = table.querySelectorAll<HTMLElement>("thead th");
  ths.forEach((th) => {
    th.style.setProperty("background-color", "#e5e7eb", "important");
    th.style.setProperty("color", "#1f2937", "important");
    th.style.setProperty("border-bottom", "2px solid #9ca3af", "important");

    console.log(th.getAttribute("data-property"));
  });

  const rows = table.querySelectorAll("tbody tr");
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
      if (key && columnEnhancers[key]) {
        columnEnhancers[key](td, tr);
      }
    });
  });
}
