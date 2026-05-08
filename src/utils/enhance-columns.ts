import type { Professor } from "@/utils/rmp";

const professorCache = new Map<string, Professor | null>();

function normalizeName(name: string): string[] {
  return name
    .toLowerCase()
    .replace(/[,.\s]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0);
}

function matchProfessor(
  searchName: string,
  professors: Professor[],
): Professor | null {
  const searchWords = normalizeName(searchName);
  for (const prof of professors) {
    const rmpWords = normalizeName(prof.name);
    const allMatch = searchWords.every((w) => rmpWords.includes(w));
    if (allMatch) return prof;
  }
  return null;
}

function ratingColor(rating: number): string {
  if (rating >= 4) return "#2a9d8f";
  if (rating >= 3) return "#e9c46a";
  if (rating >= 2) return "#f4a261";
  return "#e63946";
}

function ratingBgColor(rating: number): string {
  if (rating >= 4) return "#d4f0eb";
  if (rating >= 3) return "#fdf3d7";
  if (rating >= 2) return "#fde8d0";
  return "#fad4d7";
}

export function enhanceRow(tr: HTMLTableRowElement) {
  const tds = tr.querySelectorAll("td");
  tds.forEach((td) => {
    td.style.setProperty("padding", "2px");
  });
}

export function enhanceCourseNumber(
  td: HTMLTableCellElement,
  tr: HTMLTableRowElement,
): void {
  td.style.color = "#e63946";
}

export function enhanceSequenceNumber(
  td: HTMLTableCellElement,
  tr: HTMLTableRowElement,
): void {
  td.style.color = "#457b9d";
}

export function enhanceCourseTitle(
  td: HTMLTableCellElement,
  tr: HTMLTableRowElement,
): void {
  td.style.color = "#2a9d8f";
}

export function enhanceCourseReferenceNumber(
  td: HTMLTableCellElement,
  tr: HTMLTableRowElement,
): void {
  td.style.color = "#e9c46a";
}

export function enhanceCreditHours(
  td: HTMLTableCellElement,
  tr: HTMLTableRowElement,
): void {
  td.style.color = "#f4a261";
}

export function enhanceInstructor(
  td: HTMLTableCellElement,
  tr: HTMLTableRowElement,
): void {
  const profLink = td.querySelector("a");
  const profName = profLink?.textContent
    ?.trim()
    ?.replace(/\s*\(.*?\)\s*/g, "")
    .trim();
  if (!profName) return;
  if (td.dataset.rmpEnhanced) return;
  td.dataset.rmpEnhanced = "pending";

  td.style.display = "flex";
  td.style.alignItems = "stretch";
  td.style.backgroundColor = "#ffffff";
  td.style.width = "max-content";

  if (profLink) {
    profLink.style.flex = "1";
    profLink.style.padding = "4px 6px";
    profLink.style.color = "#264653";
  }

  const cached = professorCache.get(profName);
  if (cached !== undefined) {
    renderRatingBadge(td, cached);
    return;
  }

  (async () => {
    console.log(`Searching Prof: "${profName}"`);
    try {
      const result = await browser.runtime.sendMessage({
        type: "rmp:searchProfessors",
        name: profName,
      });
      const match =
        result?.professors?.length > 0
          ? matchProfessor(profName, result.professors)
          : null;
      professorCache.set(profName, match);
      renderRatingBadge(td, match);
    } catch {
      professorCache.set(profName, null);
      renderRatingBadge(td, null);
    }
  })();
}

function renderRatingBadge(
  td: HTMLTableCellElement,
  prof: Professor | null,
): void {
  const badge = document.createElement("a");
  badge.style.fontFamily = "monospace";
  badge.style.fontWeight = "bold";
  badge.style.fontSize = "11px";
  badge.style.display = "flex";
  badge.style.alignItems = "center";
  badge.style.justifyContent = "center";
  badge.style.textDecoration = "none";
  badge.style.padding = "0 6px";
  badge.style.boxSizing = "border-box";

  if (!prof || prof.overall_rating == null) {
    badge.textContent = "nul";
    badge.style.backgroundColor = "#eee";
    badge.style.color = "#999";
    badge.style.cursor = "default";
    td.prepend(badge);
    td.dataset.rmpEnhanced = "no-data";
    return;
  }

  const rating = prof.overall_rating;
  badge.textContent = rating.toFixed(1);
  badge.href = `https://www.ratemyprofessors.com/professor/${prof.id}`;
  badge.target = "_blank";
  badge.rel = "noopener noreferrer";
  badge.style.backgroundColor = ratingBgColor(rating);
  badge.style.color = ratingColor(rating);
  badge.style.cursor = "pointer";

  const details: string[] = [];
  details.push(`${prof.overall_rating.toFixed(1)}/5 overall`);
  if (prof.num_ratings != null) details.push(`${prof.num_ratings} ratings`);
  if (prof.percent_take_again != null)
    details.push(`${Math.round(prof.percent_take_again)}% would take again`);
  if (prof.level_of_difficulty != null)
    details.push(`${prof.level_of_difficulty.toFixed(1)}/5 difficulty`);
  if (prof.department) details.push(prof.department);
  badge.title = details.join("\n");

  td.prepend(badge);
  td.dataset.rmpEnhanced = "done";
}

export function enhanceMeetingTime(
  td: HTMLTableCellElement,
  tr: HTMLTableRowElement,
): void {
  td.style.cssText = "";
  td.style.padding = "0";
  td.style.backgroundColor = "white";
  td.style.position = "relative";

  const overDiv = document.createElement("div");
  overDiv.setAttribute("data-enhanced", "overDiv");
  overDiv.style.backgroundColor = "blue";
  overDiv.style.padding = "0";
  overDiv.style.margin = "0";
  overDiv.style.display = "flex";
  overDiv.style.alignItems = "stretch";
  overDiv.style.position = "absolute";
  overDiv.style.top = "0";
  overDiv.style.left = "0";
  overDiv.style.width = "100%";
  overDiv.style.height = "100%";
  overDiv.style.zIndex = "1000";

  if (!td.querySelector("[data-enhanced='overDiv']")) {
    td.prepend(overDiv);
  }

  const meetingDiv: NodeListOf<HTMLElement> = td.querySelectorAll(".meeting");
  for (const elem of meetingDiv) {
    elem.style.height = "100%";
    elem.style.backgroundColor = "#ddd";
    const meetingTime: HTMLElement | null =
      elem.querySelector(".meeting-schedule");
    if (!meetingTime) continue;
    meetingTime.style.padding = "2px 4px";
    meetingTime.style.backgroundColor = "yellow";
    meetingTime.style.display = "flex";
    meetingTime.style.alignItems = "center";
    meetingTime.style.justifyContent = "center";
    meetingTime.style.width = "max-content";
  }

  // const toolTipText: NodeListOf<HTMLElement> =
  //   meetingDiv.querySelectorAll(".tooltip-row");
  // for (const elem of toolTipText) {
  //   console.log("Tooltip: ", elem);
  //   elem.style.setProperty("width", "0", "important");
  //   elem.style.setProperty("overflow", "hidden", "important");
  // }
}

export function enhanceStatus(
  td: HTMLTableCellElement,
  tr: HTMLTableRowElement,
): void {
  td.style.color = "#1982c4";
}

export function enhanceCampus(
  td: HTMLTableCellElement,
  tr: HTMLTableRowElement,
): void {
  td.style.color = "#8ac926";
}

export function enhanceLinked(
  td: HTMLTableCellElement,
  tr: HTMLTableRowElement,
): void {
  td.style.color = "#ff595e";
}

export function enhanceAdd(
  td: HTMLTableCellElement,
  tr: HTMLTableRowElement,
): void {
  td.style.color = "#6a4c93";
}

export function enhanceAttribute(
  td: HTMLTableCellElement,
  tr: HTMLTableRowElement,
): void {
  td.style.color = "#034aff";
  const attrs = td.querySelectorAll("span");
  // const strings = Array.from(attrs).map((attr) => attr.textContent);

  // Remove all <br> tags from td
  const brTags = td.querySelectorAll("br");
  brTags.forEach((br) => br.remove());

  if (attrs.length === 0) return;

  attrs.forEach((attr, index) => {
    const colors = [
      "#ffadad",
      "#ffd6a5",
      "#fdffb6",
      "#caffbf",
      "#9bf6ff",
      "#a0c4ff",
      "#bdb2ff",
      "#ffc6ff",
    ];
    attr.style.backgroundColor = colors[index % colors.length];
    attr.style.padding = "2px 4px";
    attr.style.borderRadius = "3px";
    attr.style.display = "inline-block";
    attr.style.margin = "1px";
  });

  // const carousel = createVerticalCarousel(
  //   strings
  //     .map(() => document.createElement("div"))
  //     .map((span, i) => {
  //       span.textContent = strings[i];
  //       return span;
  //     }),
  // );
  // td.appendChild(carousel);
}
