import {
  enhanceCourseNumber,
  enhanceSequenceNumber,
  enhanceCourseTitle,
  enhanceCourseReferenceNumber,
  enhanceCreditHours,
  enhanceInstructor,
  enhanceMeetingTime,
  enhanceStatus,
  enhanceCampus,
  enhanceLinked,
  enhanceAdd,
  enhanceAttribute,
  enhanceRow,
} from "@/utils/enhance-columns";

export default defineContentScript({
  matches: ["*://ssbstureg.gmu.edu/StudentRegistrationSsb/*"],
  main,
});

const columnEnhancers: Record<
  string,
  (td: HTMLTableCellElement, tr: HTMLTableRowElement) => void
> = {
  courseNumber: enhanceCourseNumber,
  sequenceNumber: enhanceSequenceNumber,
  courseTitle: enhanceCourseTitle,
  courseReferenceNumber: enhanceCourseReferenceNumber,
  creditHours: enhanceCreditHours,
  instructor: enhanceInstructor,
  meetingTime: enhanceMeetingTime,
  status: enhanceStatus,
  campus: enhanceCampus,
  linked: enhanceLinked,
  add: enhanceAdd,
  attribute: enhanceAttribute,
};

function injectStyles() {
  const style = document.createElement("style");
  style.textContent = `#table1 { table-layout: auto !important; } #table1 th, #table1 td { width: max-content !important; padding: 2px !important; }`;
  document.head.appendChild(style);
}

function main() {
  injectStyles();
  const existingTable = document.getElementById("table1");
  if (existingTable) {
    observeTable(existingTable as HTMLTableElement);
  } else {
    const docObserver = new MutationObserver((_, obs) => {
      const table = document.getElementById("table1");
      if (table) {
        obs.disconnect();
        observeTable(table as HTMLTableElement);
      }
    });
    docObserver.observe(document.body, { childList: true, subtree: true });
  }
}

function observeTable(table: HTMLTableElement) {
  modifyTable(table);
  const tableObserver = new MutationObserver(() => {
    modifyTable(table);
  });
  tableObserver.observe(table, { childList: true, subtree: true });
}

function modifyTable(table: HTMLTableElement) {
  const rows = table.querySelectorAll("tbody tr");
  if (rows.length === 0) return;

  rows.forEach((row) => {
    const tr = row as HTMLTableRowElement;
    enhanceRow(tr);
    const tds = tr.querySelectorAll("td");
    tds.forEach((td) => {
      const key = td.getAttribute("xe-field");
      if (key && columnEnhancers[key]) {
        columnEnhancers[key](td, tr);
      }
    });
  });
}
