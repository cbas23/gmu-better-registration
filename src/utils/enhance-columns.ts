export { enhanceCourseNumber } from "@/enhancers/course-number";
export { enhanceSequenceNumber } from "@/enhancers/sequence-number";
export { enhanceCourseTitle } from "@/enhancers/course-title";
export { enhanceCourseReferenceNumber } from "@/enhancers/course-reference-number";
export { enhanceCreditHours } from "@/enhancers/credit-hours";
export { enhanceInstructor } from "@/enhancers/instructor";
export { enhanceMeetingTime } from "@/enhancers/meeting-time";
export { enhanceStatus } from "@/enhancers/status";
export { enhanceCampus } from "@/enhancers/campus";
export { enhanceLinked } from "@/enhancers/linked";
export { enhanceAdd } from "@/enhancers/add";
export { enhanceAttribute } from "@/enhancers/attribute";
export { enhanceNote } from "@/enhancers/note";

export function enhanceRow(tr: HTMLTableRowElement) {
  const tds = tr.querySelectorAll("td");
  tds.forEach((td) => {
    td.style.setProperty("padding", "2px");
  });
}
