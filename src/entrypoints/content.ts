import "@/assets/tailwind-content.css";
import { EnhancedTable } from "@/utils/enhanced-table";
import "@/enhancers/instructor";
import "@/enhancers/meeting-time";
import "@/enhancers/status";
import "@/enhancers/attribute";
import "@/enhancers/note";
import "@/enhancers/linked";
import "@/enhancers/add";

export default defineContentScript({
  matches: ["*://ssbstureg.gmu.edu/StudentRegistrationSsb/*"],
  main,
});

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
      new EnhancedTable(table as HTMLTableElement).start();
    }
  });

  const containerObserver = new MutationObserver(() => {
    container.querySelectorAll("table").forEach((table) => {
      if (!observedTables.has(table as HTMLTableElement)) {
        observedTables.add(table as HTMLTableElement);
        new EnhancedTable(table as HTMLTableElement).start();
      }
    });
  });
  containerObserver.observe(container, { childList: true, subtree: true });
}
