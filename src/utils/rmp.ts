import { z } from "zod";

const RMP_API_URL = "https://www.ratemyprofessors.com/graphql";
const RMP_AUTH_TOKEN = "dGVzdDp0ZXN0"; // TOKEN is PUBLIC for everyone

export const GMU_SCHOOL_LEGACY_ID = 352;
export const GMU_SCHOOL_RELAY_ID = schoolNodeId(GMU_SCHOOL_LEGACY_ID);

export function schoolNodeId(legacyId: number): string {
  return btoa(`School-${legacyId}`);
}

export function teacherNodeId(legacyId: number): string {
  return btoa(`Teacher-${legacyId}`);
}

export class RmpError extends Error {
  constructor(
    message: string,
    public readonly graphqlErrors?: unknown[],
  ) {
    super(message);
    this.name = "RmpError";
  }
}

const RmpGraphQLErrorSchema = z.object({
  message: z.string(),
  extensions: z.unknown().optional(),
});

const RmpGraphQLResponseSchema = z.object({
  data: z.unknown().nullable(),
  errors: z.array(RmpGraphQLErrorSchema).optional(),
});

const RmpSchoolNodeSchema = z.object({
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

const RmpTeacherSchoolSchema = z.object({
  id: z.string(),
  legacyId: z.number(),
  name: z.string(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  numRatings: z.number().nullable().optional(),
  avgRating: z.number().nullable().optional(),
});

const RmpTeacherNodeSchema = z.object({
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

const RmpRatingNodeSchema = z.object({
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

const RmpPageInfoSchema = z.object({
  hasNextPage: z.boolean(),
  endCursor: z.string().nullable().optional(),
});

const RmpSearchSchoolsDataSchema = z.object({
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

const RmpSearchTeachersDataSchema = z.object({
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

const RmpProfessorRatingsDataSchema = z.object({
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

const RmpSchoolSummarySchema = z.object({
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

const RmpSchoolRatingNodeSchema = z.object({
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

const RmpSchoolDetailsDataSchema = z.object({
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

export interface School {
  id: number;
  name: string;
  location: string | null;
  overall_quality: number | null;
  num_ratings: number | null;
  reputation: number | null;
  safety: number | null;
  happiness: number | null;
  facilities: number | null;
  social: number | null;
  location_rating: number | null;
  clubs: number | null;
  opportunities: number | null;
  internet: number | null;
  food: number | null;
}

export interface Professor {
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  department: string | null;
  school: School | null;
  overall_rating: number | null;
  num_ratings: number | null;
  percent_take_again: number | null;
  level_of_difficulty: number | null;
  tags: string[];
}

export interface Rating {
  date: Date | null;
  comment: string;
  quality: number | null;
  difficulty: number | null;
  tags: string[];
  course_raw: string | null;
  details: Record<string, unknown> | null;
  thumbs_up: number | null;
  thumbs_down: number | null;
}

export interface SchoolSearchResult {
  schools: School[];
  total: number | null;
  has_next_page: boolean;
  next_cursor: string | null;
}

export interface ProfessorSearchResult {
  professors: Professor[];
  total: number | null;
  has_next_page: boolean;
  next_cursor: string | null;
}

export interface ProfessorRatingsPage {
  professor: Professor;
  ratings: Rating[];
  has_next_page: boolean;
  next_cursor: string | null;
}

export interface SchoolSummary {
  campus_condition: number | null;
  campus_location: number | null;
  career_opportunities: number | null;
  club_and_event_activities: number | null;
  food_quality: number | null;
  internet_speed: number | null;
  reputation: number | null;
  safety: number | null;
  satisfaction: number | null;
  social_activities: number | null;
}

export interface SchoolRating {
  id: string;
  comment: string | null;
  date: Date | null;
  reputation: number | null;
  location: number | null;
  safety: number | null;
  social: number | null;
  opportunities: number | null;
  happiness: number | null;
  facilities: number | null;
  internet: number | null;
  food: number | null;
  clubs: number | null;
  thumbs_up: number | null;
  thumbs_down: number | null;
}

export interface SchoolDetailsPage {
  school: School;
  summary: SchoolSummary | null;
  ratings: SchoolRating[];
  has_next_page: boolean;
  next_cursor: string | null;
}

function normalizeSchoolNode(
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

function normalizeTeacherNode(
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

function normalizeRatingNode(
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

async function rmpQuery<T>(
  operationName: string,
  query: string,
  variables: Record<string, unknown>,
  responseSchema: z.ZodType<T>,
): Promise<T> {
  const response = await fetch(RMP_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${RMP_AUTH_TOKEN}`,
    },
    body: JSON.stringify({ operationName, query, variables }),
  });

  if (!response.ok) {
    throw new RmpError(
      `RMP API error: ${response.status} ${response.statusText}`,
    );
  }

  const json = await response.json();
  const parsed = RmpGraphQLResponseSchema.safeParse(json);

  if (!parsed.success) {
    throw new RmpError(
      `Invalid RMP response structure: ${JSON.stringify(parsed.error.issues)}`,
    );
  }

  if (parsed.data.errors && parsed.data.errors.length > 0) {
    throw new RmpError(
      `RMP GraphQL errors: ${JSON.stringify(parsed.data.errors)}`,
      parsed.data.errors,
    );
  }

  return responseSchema.parse(parsed.data.data);
}

export interface SearchSchoolsOptions {
  count?: number;
  cursor?: string | null;
}

const SCHOOL_SEARCH_QUERY = `
query SchoolSearchResultsPageQuery($query: SchoolSearchQuery!, $count: Int!, $cursor: String) {
  search: newSearch {
    schools(query: $query, first: $count, after: $cursor) {
      edges {
        cursor
        node {
          id
          legacyId
          name
          city
          state
          numRatings
          avgRating
          avgRatingRounded
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      resultCount
    }
  }
}
`;

export async function searchSchools(
  query: string,
  options?: SearchSchoolsOptions,
): Promise<SchoolSearchResult> {
  const data = await rmpQuery(
    "SchoolSearchResultsPageQuery",
    SCHOOL_SEARCH_QUERY,
    {
      query: { text: query },
      count: options?.count ?? 20,
      cursor: options?.cursor ?? "",
    },
    RmpSearchSchoolsDataSchema,
  );

  return {
    schools: data.search.schools.edges.map((e) => normalizeSchoolNode(e.node)),
    total: data.search.schools.resultCount ?? null,
    has_next_page: data.search.schools.pageInfo.hasNextPage,
    next_cursor: data.search.schools.pageInfo.endCursor ?? null,
  };
}

export interface SearchProfessorsOptions {
  schoolLegacyId?: number;
  count?: number;
  cursor?: string | null;
}

const TEACHER_SEARCH_QUERY = `
query TeacherSearchResultsPageQuery($query: TeacherSearchQuery!, $count: Int!, $cursor: String) {
  search: newSearch {
    teachers(query: $query, first: $count, after: $cursor) {
      edges {
        cursor
        node {
          id
          legacyId
          firstName
          lastName
          avgRating
          numRatings
          wouldTakeAgainPercent
          avgDifficulty
          department
          school {
            id
            legacyId
            name
            city
            state
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      resultCount
    }
  }
}
`;

export async function searchProfessors(
  text: string,
  options?: SearchProfessorsOptions,
): Promise<ProfessorSearchResult> {
  const variables: Record<string, unknown> = {
    query: { text },
    count: options?.count ?? 20,
    cursor: options?.cursor ?? "",
  };

  if (options?.schoolLegacyId != null) {
    (variables.query as Record<string, unknown>).schoolID = schoolNodeId(
      options.schoolLegacyId,
    );
  }

  const data = await rmpQuery(
    "TeacherSearchResultsPageQuery",
    TEACHER_SEARCH_QUERY,
    variables,
    RmpSearchTeachersDataSchema,
  );

  return {
    professors: data.search.teachers.edges.map((e) =>
      normalizeTeacherNode(e.node),
    ),
    total: data.search.teachers.resultCount ?? null,
    has_next_page: data.search.teachers.pageInfo.hasNextPage,
    next_cursor: data.search.teachers.pageInfo.endCursor ?? null,
  };
}

export async function getAllProfessorsAtSchool(
  schoolLegacyId: number,
  pageSize: number = 20,
): Promise<Professor[]> {
  const professors: Professor[] = [];
  let cursor: string | null = null;

  while (true) {
    const result = await searchProfessors(" ", {
      schoolLegacyId,
      count: pageSize,
      cursor,
    });
    professors.push(...result.professors);

    if (!result.has_next_page || !result.next_cursor) break;
    cursor = result.next_cursor;
  }

  return professors;
}

export interface GetProfessorOptions {
  courseFilter?: string;
  count?: number;
  cursor?: string | null;
}

const PROFESSOR_RATINGS_QUERY = `
query RatingsListQuery($count: Int!, $id: ID!, $courseFilter: String, $cursor: String) {
  node(id: $id) {
    ... on Teacher {
      id
      legacyId
      firstName
      lastName
      department
      avgRating
      avgDifficulty
      numRatings
      wouldTakeAgainPercent
      school {
        id
        legacyId
        name
        city
        state
      }
      ratings(first: $count, after: $cursor, courseFilter: $courseFilter) {
        edges {
          cursor
          node {
            id
            comment
            helpfulRating
            clarityRating
            difficultyRating
            ratingTags
            date
            class
            attendanceMandatory
            wouldTakeAgain
            grade
            isForCredit
            isForOnlineClass
            textbookUse
            thumbsUpTotal
            thumbsDownTotal
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
}
`;

export async function getProfessor(
  legacyId: number,
  options?: GetProfessorOptions,
): Promise<ProfessorRatingsPage> {
  const data = await rmpQuery(
    "RatingsListQuery",
    PROFESSOR_RATINGS_QUERY,
    {
      id: teacherNodeId(legacyId),
      count: options?.count ?? 20,
      cursor: options?.cursor ?? null,
      courseFilter: options?.courseFilter ?? null,
    },
    RmpProfessorRatingsDataSchema,
  );

  const professor = normalizeTeacherNode({
    id: data.node.id,
    legacyId: data.node.legacyId,
    firstName: data.node.firstName,
    lastName: data.node.lastName,
    department: data.node.department,
    avgRating: data.node.avgRating,
    avgDifficulty: data.node.avgDifficulty,
    numRatings: data.node.numRatings,
    wouldTakeAgainPercent: data.node.wouldTakeAgainPercent,
    school: data.node.school,
  });

  const ratings = data.node.ratings.edges.map((e) =>
    normalizeRatingNode(e.node),
  );

  return {
    professor,
    ratings,
    has_next_page: data.node.ratings.pageInfo.hasNextPage,
    next_cursor: data.node.ratings.pageInfo.endCursor ?? null,
  };
}

export async function getAllProfessorRatings(
  legacyId: number,
  courseFilter?: string,
  pageSize: number = 20,
): Promise<Rating[]> {
  const ratings: Rating[] = [];
  let cursor: string | null = null;

  while (true) {
    const page = await getProfessor(legacyId, {
      courseFilter,
      count: pageSize,
      cursor,
    });
    ratings.push(...page.ratings);

    if (!page.has_next_page || !page.next_cursor) break;
    cursor = page.next_cursor;
  }

  return ratings;
}

export interface GetSchoolDetailsOptions {
  count?: number;
  cursor?: string | null;
}

const SCHOOL_DETAILS_QUERY = `
query SchoolRatingsListQuery($count: Int!, $id: ID!, $cursor: String) {
  node(id: $id) {
    ... on School {
      id
      legacyId
      name
      city
      state
      country
      numRatings
      avgRatingRounded
      summary {
        campusCondition
        campusLocation
        careerOpportunities
        clubAndEventActivities
        foodQuality
        internetSpeed
        schoolReputation
        schoolSafety
        schoolSatisfaction
        socialActivities
      }
      ratings(first: $count, after: $cursor) {
        edges {
          cursor
          node {
            id
            comment
            date
            reputationRating
            locationRating
            safetyRating
            socialRating
            opportunitiesRating
            happinessRating
            facilitiesRating
            internetRating
            foodRating
            clubsRating
            thumbsUpTotal
            thumbsDownTotal
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
}
`;

function normalizeSchoolRatingNode(
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

export async function getSchoolDetails(
  legacyId: number,
  options?: GetSchoolDetailsOptions,
): Promise<SchoolDetailsPage> {
  const data = await rmpQuery(
    "SchoolRatingsListQuery",
    SCHOOL_DETAILS_QUERY,
    {
      id: schoolNodeId(legacyId),
      count: options?.count ?? 20,
      cursor: options?.cursor ?? null,
    },
    RmpSchoolDetailsDataSchema,
  );

  const summary = data.node.summary
    ? {
        campus_condition: data.node.summary.campusCondition ?? null,
        campus_location: data.node.summary.campusLocation ?? null,
        career_opportunities: data.node.summary.careerOpportunities ?? null,
        club_and_event_activities:
          data.node.summary.clubAndEventActivities ?? null,
        food_quality: data.node.summary.foodQuality ?? null,
        internet_speed: data.node.summary.internetSpeed ?? null,
        reputation: data.node.summary.schoolReputation ?? null,
        safety: data.node.summary.schoolSafety ?? null,
        satisfaction: data.node.summary.schoolSatisfaction ?? null,
        social_activities: data.node.summary.socialActivities ?? null,
      }
    : null;

  const school = normalizeSchoolNode(
    {
      id: data.node.id,
      legacyId: data.node.legacyId,
      name: data.node.name,
      city: data.node.city,
      state: data.node.state,
      numRatings: data.node.numRatings,
      avgRating: null,
      avgRatingRounded: data.node.avgRatingRounded,
    },
    data.node.summary,
  );

  const ratings = data.node.ratings.edges.map((e) =>
    normalizeSchoolRatingNode(e.node),
  );

  return {
    school,
    summary,
    ratings,
    has_next_page: data.node.ratings.pageInfo.hasNextPage,
    next_cursor: data.node.ratings.pageInfo.endCursor ?? null,
  };
}
