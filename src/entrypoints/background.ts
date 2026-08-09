import { searchProfessors, GMU_SCHOOL_LEGACY_ID } from "@/utils/rmp";
import { normalizeTableProf } from "@/utils/names";

export default defineBackground(() => {
  // console.log("Hello background!", { id: browser.runtime.id });

  browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === "rmp:searchProfessors") {
      searchProfessors(normalizeTableProf(message.name), {
        schoolLegacyId: GMU_SCHOOL_LEGACY_ID,
        count: 10,
      })
        .then((result) => sendResponse(result))
        .catch(() => sendResponse(null));
      return true;
    }
  });
});
