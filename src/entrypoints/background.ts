import { searchProfessors, GMU_SCHOOL_LEGACY_ID } from "@/utils/rmp";

function normalizeProfessorName(name: string): string {
  const commaIndex = name.indexOf(",");
  if (commaIndex !== -1) {
    const last = name.slice(0, commaIndex).trim();
    const first = name.slice(commaIndex + 1).trim();
    if (first && last) return `${first} ${last}`;
  }
  return name.trim();
}

export default defineBackground(() => {
  console.log("Hello background!", { id: browser.runtime.id });

  browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === "rmp:searchProfessors") {
      searchProfessors(normalizeProfessorName(message.name), {
        schoolLegacyId: GMU_SCHOOL_LEGACY_ID,
        count: 10,
      })
        .then((result) => sendResponse(result))
        .catch(() => sendResponse(null));
      return true;
    }
  });
});
