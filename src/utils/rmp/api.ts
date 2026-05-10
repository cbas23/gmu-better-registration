import { z } from "zod";
import {
  RmpGraphQLResponseSchema,
  RmpSearchSchoolsDataSchema,
  RmpSearchTeachersDataSchema,
  RmpProfessorRatingsDataSchema,
  RmpSchoolDetailsDataSchema,
} from "./schemas";
import {
  normalizeSchoolNode,
  normalizeTeacherNode,
  normalizeRatingNode,
  normalizeSchoolRatingNode,
} from "./normalize";
import type {
  SchoolSearchResult,
  ProfessorSearchResult,
  ProfessorRatingsPage,
  SchoolDetailsPage,
  SearchSchoolsOptions,
  SearchProfessorsOptions,
  GetProfessorOptions,
  GetSchoolDetailsOptions,
  Professor,
  Rating,
} from "./types";

const RMP_API_URL = "https://www.ratemyprofessors.com/graphql";
const RMP_AUTH_TOKEN = "dGVzdDp0ZXN0";

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
