import type { z } from "zod";
import type {
  RmpSchoolNodeSchema,
  RmpTeacherNodeSchema,
  RmpRatingNodeSchema,
  RmpSchoolSummarySchema,
  RmpSchoolRatingNodeSchema,
} from "./schemas";
import type { School, Professor, Rating, SchoolRating } from "./types";

export function normalizeSchoolNode(
  node: z.infer<typeof RmpSchoolNodeSchema>,
  summary?: z.infer<typeof RmpSchoolSummarySchema> | null,
): School {
  const location =
    node.city && node.state
      ? `${node.city}, ${node.state}`
      : (node.city ?? node.state ?? null);

  return {
    id: node.legacyId,
    name: node.name,
    location,
    overall_quality: node.avgRating ?? node.avgRatingRounded ?? null,
    num_ratings: node.numRatings ?? null,
    reputation: summary?.schoolReputation ?? null,
    safety: summary?.schoolSafety ?? null,
    happiness: summary?.schoolSatisfaction ?? null,
    facilities: summary?.campusCondition ?? null,
    social: summary?.socialActivities ?? null,
    location_rating: summary?.campusLocation ?? null,
    clubs: summary?.clubAndEventActivities ?? null,
    opportunities: summary?.careerOpportunities ?? null,
    internet: summary?.internetSpeed ?? null,
    food: summary?.foodQuality ?? null,
  };
}

export function normalizeTeacherNode(
  node: z.infer<typeof RmpTeacherNodeSchema>,
): Professor {
  const school = node.school ? normalizeSchoolNode(node.school) : null;

  return {
    id: node.legacyId,
    name: `${node.firstName} ${node.lastName}`,
    first_name: node.firstName,
    last_name: node.lastName,
    department: node.department ?? null,
    school,
    overall_rating: node.avgRating ?? null,
    num_ratings: node.numRatings ?? null,
    percent_take_again: node.wouldTakeAgainPercent ?? null,
    level_of_difficulty: node.avgDifficulty ?? null,
    tags: [],
  };
}

export function normalizeRatingNode(
  node: z.infer<typeof RmpRatingNodeSchema>,
): Rating {
  const tags = node.ratingTags
    ? node.ratingTags.split("--").filter((t) => t.length > 0)
    : [];

  const details: Record<string, unknown> = {};
  if (node.attendanceMandatory != null)
    details.attendance = node.attendanceMandatory;
  if (node.wouldTakeAgain != null)
    details.would_take_again = node.wouldTakeAgain === 1;
  if (node.grade != null) details.grade = node.grade;
  if (node.isForCredit != null) details.for_credit = node.isForCredit;
  if (node.isForOnlineClass != null)
    details.online_class = node.isForOnlineClass;
  if (node.textbookUse != null) details.textbook_use = node.textbookUse;

  return {
    date: node.date ? new Date(node.date) : null,
    comment: node.comment ?? "",
    quality: node.clarityRating ?? node.helpfulRating ?? null,
    difficulty: node.difficultyRating ?? null,
    tags,
    course_raw: node.class ?? null,
    details: Object.keys(details).length > 0 ? details : null,
    thumbs_up: node.thumbsUpTotal ?? null,
    thumbs_down: node.thumbsDownTotal ?? null,
  };
}

export function normalizeSchoolRatingNode(
  node: z.infer<typeof RmpSchoolRatingNodeSchema>,
): SchoolRating {
  return {
    id: node.id,
    comment: node.comment ?? null,
    date: node.date ? new Date(node.date) : null,
    reputation: node.reputationRating ?? null,
    location: node.locationRating ?? null,
    safety: node.safetyRating ?? null,
    social: node.socialRating ?? null,
    opportunities: node.opportunitiesRating ?? null,
    happiness: node.happinessRating ?? null,
    facilities: node.facilitiesRating ?? null,
    internet: node.internetRating ?? null,
    food: node.foodRating ?? null,
    clubs: node.clubsRating ?? null,
    thumbs_up: node.thumbsUpTotal ?? null,
    thumbs_down: node.thumbsDownTotal ?? null,
  };
}
