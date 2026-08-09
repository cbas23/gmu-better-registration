import { z } from "zod";

// Extension CSPs disallow runtime code generation; keep Zod on its interpreter path.
z.config({ jitless: true });

export const RmpGraphQLErrorSchema = z.object({
  message: z.string(),
  extensions: z.unknown().optional(),
});

export const RmpGraphQLResponseSchema = z.object({
  data: z.unknown().nullable(),
  errors: z.array(RmpGraphQLErrorSchema).optional(),
});

export const RmpSchoolNodeSchema = z.object({
  id: z.string(),
  legacyId: z.number(),
  name: z.string(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  numRatings: z.number().nullable().optional(),
  avgRating: z.number().nullable().optional(),
  avgRatingRounded: z.number().nullable().optional(),
});

export const RmpTeacherSchoolSchema = z.object({
  id: z.string(),
  legacyId: z.number(),
  name: z.string(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  numRatings: z.number().nullable().optional(),
  avgRating: z.number().nullable().optional(),
});

export const RmpTeacherNodeSchema = z.object({
  id: z.string(),
  legacyId: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  avgRating: z.number().nullable().optional(),
  numRatings: z.number().nullable().optional(),
  wouldTakeAgainPercent: z.number().nullable().optional(),
  avgDifficulty: z.number().nullable().optional(),
  department: z.string().nullable().optional(),
  school: RmpTeacherSchoolSchema.nullable().optional(),
});

export const RmpRatingNodeSchema = z.object({
  id: z.string(),
  comment: z.string().nullable().optional(),
  date: z.string().nullable().optional(),
  helpfulRating: z.number().nullable().optional(),
  clarityRating: z.number().nullable().optional(),
  difficultyRating: z.number().nullable().optional(),
  ratingTags: z.string().nullable().optional(),
  class: z.string().nullable().optional(),
  attendanceMandatory: z.string().nullable().optional(),
  wouldTakeAgain: z.number().nullable().optional(),
  grade: z.string().nullable().optional(),
  isForCredit: z.boolean().nullable().optional(),
  isForOnlineClass: z.boolean().nullable().optional(),
  textbookUse: z.number().nullable().optional(),
  thumbsUpTotal: z.number().nullable().optional(),
  thumbsDownTotal: z.number().nullable().optional(),
});

export const RmpPageInfoSchema = z.object({
  hasNextPage: z.boolean(),
  endCursor: z.string().nullable().optional(),
});

export const RmpSearchSchoolsDataSchema = z.object({
  search: z.object({
    schools: z.object({
      edges: z.array(
        z.object({
          cursor: z.string(),
          node: RmpSchoolNodeSchema,
        }),
      ),
      pageInfo: RmpPageInfoSchema,
      resultCount: z.number().nullable().optional(),
    }),
  }),
});

export const RmpSearchTeachersDataSchema = z.object({
  search: z.object({
    teachers: z.object({
      edges: z.array(
        z.object({
          cursor: z.string(),
          node: RmpTeacherNodeSchema,
        }),
      ),
      pageInfo: RmpPageInfoSchema,
      resultCount: z.number().nullable().optional(),
    }),
  }),
});

export const RmpProfessorRatingsDataSchema = z.object({
  node: z.object({
    __typename: z.literal("Teacher").optional(),
    id: z.string(),
    legacyId: z.number(),
    firstName: z.string(),
    lastName: z.string(),
    department: z.string().nullable().optional(),
    avgRating: z.number().nullable().optional(),
    avgDifficulty: z.number().nullable().optional(),
    numRatings: z.number().nullable().optional(),
    wouldTakeAgainPercent: z.number().nullable().optional(),
    school: RmpTeacherSchoolSchema.nullable().optional(),
    ratings: z.object({
      edges: z.array(
        z.object({
          cursor: z.string(),
          node: RmpRatingNodeSchema,
        }),
      ),
      pageInfo: RmpPageInfoSchema,
    }),
  }),
});

export const RmpSchoolSummarySchema = z.object({
  campusCondition: z.number().nullable().optional(),
  campusLocation: z.number().nullable().optional(),
  careerOpportunities: z.number().nullable().optional(),
  clubAndEventActivities: z.number().nullable().optional(),
  foodQuality: z.number().nullable().optional(),
  internetSpeed: z.number().nullable().optional(),
  schoolReputation: z.number().nullable().optional(),
  schoolSafety: z.number().nullable().optional(),
  schoolSatisfaction: z.number().nullable().optional(),
  socialActivities: z.number().nullable().optional(),
});

export const RmpSchoolRatingNodeSchema = z.object({
  id: z.string(),
  comment: z.string().nullable().optional(),
  date: z.string().nullable().optional(),
  reputationRating: z.number().nullable().optional(),
  locationRating: z.number().nullable().optional(),
  safetyRating: z.number().nullable().optional(),
  socialRating: z.number().nullable().optional(),
  opportunitiesRating: z.number().nullable().optional(),
  happinessRating: z.number().nullable().optional(),
  facilitiesRating: z.number().nullable().optional(),
  internetRating: z.number().nullable().optional(),
  foodRating: z.number().nullable().optional(),
  clubsRating: z.number().nullable().optional(),
  thumbsUpTotal: z.number().nullable().optional(),
  thumbsDownTotal: z.number().nullable().optional(),
});

export const RmpSchoolDetailsDataSchema = z.object({
  node: z.object({
    id: z.string(),
    legacyId: z.number(),
    name: z.string(),
    city: z.string().nullable().optional(),
    state: z.string().nullable().optional(),
    country: z.string().nullable().optional(),
    numRatings: z.number().nullable().optional(),
    avgRatingRounded: z.number().nullable().optional(),
    summary: RmpSchoolSummarySchema.nullable().optional(),
    ratings: z.object({
      edges: z.array(
        z.object({
          cursor: z.string(),
          node: RmpSchoolRatingNodeSchema,
        }),
      ),
      pageInfo: RmpPageInfoSchema,
    }),
  }),
});
