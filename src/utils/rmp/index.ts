export {
  schoolNodeId,
  teacherNodeId,
  GMU_SCHOOL_LEGACY_ID,
  GMU_SCHOOL_RELAY_ID,
} from "./ids";

export {
  RmpError,
  searchSchools,
  searchProfessors,
  getAllProfessorsAtSchool,
  getProfessor,
  getAllProfessorRatings,
  getSchoolDetails,
} from "./api";

export type {
  School,
  Professor,
  Rating,
  SchoolSearchResult,
  ProfessorSearchResult,
  ProfessorRatingsPage,
  SchoolSummary,
  SchoolRating,
  SchoolDetailsPage,
  SearchSchoolsOptions,
  SearchProfessorsOptions,
  GetProfessorOptions,
  GetSchoolDetailsOptions,
} from "./types";

export {
  normalizeSchoolNode,
  normalizeTeacherNode,
  normalizeRatingNode,
  normalizeSchoolRatingNode,
} from "./normalize";
