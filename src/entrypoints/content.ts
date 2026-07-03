import "@/assets/tailwind-content.css";
import { EnhancedTable } from "@/utils/enhanced-table";
import "@/enhancers/instructor";
import "@/enhancers/meeting-time";
import "@/enhancers/status";
import "@/enhancers/attribute";
import "@/enhancers/note";
import "@/enhancers/linked";
import "@/enhancers/add";
import "@/enhancers/schedule-type";

export default defineContentScript({
  matches: ["*://ssbstureg.gmu.edu/StudentRegistrationSsb/*"],
  main,
});

const observedTables = new WeakSet<HTMLTableElement>();

function main() {
  console.log("Current page URL:", window.location.href);
  let tableContainerNameID = "tabs-classSearch";

  if (window.location.pathname.includes("classSearch")) {
    tableContainerNameID = "searchResultsParent";
  }
  if (window.location.pathname.includes("registrationHistory")) {
    tableContainerNameID = "lookupScheduleTable";
  }
  if (window.location.pathname.includes("courseSearch")) {
    tableContainerNameID = "searchResults";
  }

  const container = document.getElementById(tableContainerNameID);
  if (container) {
    observeContainer(container);
  } else {
    const docObserver = new MutationObserver((_, obs) => {
      const el = document.getElementById(tableContainerNameID);
      if (el) {
        obs.disconnect();
        observeContainer(el);
      }
    });
    docObserver.observe(document.body, { childList: true, subtree: true });
  }
}

function observeContainer(container: Element) {
  container.querySelectorAll<HTMLTableElement>("table").forEach((table) => {
    if (!observedTables.has(table)) {
      observedTables.add(table);
      new EnhancedTable(table).start();
    }
  });

  const containerObserver = new MutationObserver(() => {
    container.querySelectorAll<HTMLTableElement>("table").forEach((table) => {
      if (!observedTables.has(table)) {
        observedTables.add(table);
        new EnhancedTable(table).start();
      }
    });
  });
  containerObserver.observe(container, { childList: true, subtree: true });
}
