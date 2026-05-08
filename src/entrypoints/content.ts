import "@/assets/tailwind-content.css";
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
  enhanceNote,
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
  instructor: enhanceInstructor,
  // meetingTime: enhanceMeetingTime,
  status: enhanceStatus,
  attribute: enhanceAttribute,
  note: enhanceNote,
  // courseNumber: enhanceCourseNumber,
  // sequenceNumber: enhanceSequenceNumber,
  // courseTitle: enhanceCourseTitle,
  // courseReferenceNumber: enhanceCourseReferenceNumber,
  // creditHours: enhanceCreditHours,
  // campus: enhanceCampus,
  // linked: enhanceLinked,
  // add: enhanceAdd,
};

function main() {
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
  const tableObserver = new MutationObserver(() => {
    tableObserver.disconnect();
    modifyTable(table);
    tableObserver.observe(table, { childList: true, subtree: true });
  });
  modifyTable(table);
  tableObserver.observe(table, { childList: true, subtree: true });
}

function modifyTable(table: HTMLTableElement) {
  const rows = table.querySelectorAll("tbody tr");
  if (rows.length === 0) return;

  rows.forEach((row) => {
    const tr = row as HTMLTableRowElement;
    if (tr.dataset.rmpEnhanced) return;

    tr.dataset.rmpEnhanced = "true";

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
