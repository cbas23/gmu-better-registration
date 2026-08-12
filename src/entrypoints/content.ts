import "@/assets/tailwind-content.css";
import add from "@/enhancers/add";
import attribute from "@/enhancers/attribute";
import instructor from "@/enhancers/instructor";
import linked from "@/enhancers/linked";
import meetingTime from "@/enhancers/meeting-time";
import note from "@/enhancers/note";
import reservedSeats from "@/enhancers/reserved-seats";
import scheduleType from "@/enhancers/schedule-type";
import status from "@/enhancers/status";
import title from "@/enhancers/title";

import { EnhancedTable } from "@/utils/enhanced-table";

export default defineContentScript({
  matches: ["*://ssbstureg.gmu.edu/StudentRegistrationSsb/*"],
  main,
});

const observedTables = new WeakSet<HTMLTableElement>();

function main() {
  EnhancedTable.registerEnhancer("add", add);
  EnhancedTable.registerEnhancer("attribute", attribute);
  EnhancedTable.registerEnhancer("instructor", instructor);
  EnhancedTable.registerEnhancer("linked", linked);
  EnhancedTable.registerEnhancer("meetingTime", meetingTime);
  EnhancedTable.registerEnhancer("note", note);
  EnhancedTable.registerEnhancer("reservedSeats", reservedSeats);
  EnhancedTable.registerEnhancer("scheduleType", scheduleType);
  EnhancedTable.registerEnhancer("courseTitle", title);
  EnhancedTable.registerEnhancer("status", status);

  // console.log("Current page URL:", window.location.href);
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
