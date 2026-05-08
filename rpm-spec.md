# RateMyProfessors API Specification & Findings

## Overview

RateMyProfessors (RMP) exposes an **undocumented, public GraphQL API** at:

```
POST https://www.ratemyprofessors.com/graphql
```

All queries use GraphQL POST requests with a JSON body containing `query`, `operationName`, and `variables`.

## Authentication

The API requires a **Basic Authorization header** using a static token embedded in the RMP frontend JavaScript:

```
Authorization: Basic dGVzdDp0ZXN0
```

This is `dGVzdDp0ZXN0` which base64-decodes to `test:test`. This token is found in the RMP site HTML:

```html
<script>
  window.process.env = { REACT_APP_GRAPHQL_AUTH: "dGVzdDp0ZXN0" };
</script>
```

This is a hardcoded public token — no per-user authentication is required.

### Required Headers

| Header          | Value                                  |
| --------------- | -------------------------------------- |
| `Content-Type`  | `application/json`                     |
| `Authorization` | `Basic dGVzdDp0ZXN0`                   |
| `User-Agent`    | Any standard browser user-agent string |

---

## ID System (Relay Global IDs)

RMP uses **Relay-style global IDs** — base64-encoded strings that encode both the type and a numeric legacy ID:

| Entity  | Encoded Format                | Example                                  |
| ------- | ----------------------------- | ---------------------------------------- |
| School  | `School-{legacyId}` → base64  | `U2Nob29sLTExMDk=` (School-1109)         |
| Teacher | `Teacher-{legacyId}` → base64 | `VGVhY2hlci0yMDA0MTk4` (Teacher-2004198) |
| Rating  | `Rating-{legacyId}` → base64  | `UmF0aW5nLTM0OTAxNjg4`                   |

**Creating IDs in TypeScript:**

```typescript
function schoolNodeId(legacyId: number): string {
  return btoa(`School-${legacyId}`);
}

function teacherNodeId(legacyId: number): string {
  return btoa(`Teacher-${legacyId}`);
}
```

The `legacyId` is the numeric ID visible in RMP URLs (e.g., `https://www.ratemyprofessors.com/professor/2004198`). The GraphQL API primarily uses the Relay global IDs as `id` fields but also returns `legacyId`.

---

## GraphQL Operations

### 1. Search Schools

Search for a school by name. Returns paginated results.

**Operation:** `SchoolSearchResultsPageQuery`

```graphql
query SchoolSearchResultsPageQuery(
  $query: SchoolSearchQuery!
  $count: Int!
  $cursor: String
) {
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
```

**Variables:**

```json
{
  "query": { "text": "George Mason University" },
  "count": 20,
  "cursor": ""
}
```

**Response type (`SchoolSearchResult`):**

```typescript
interface SchoolSearchResult {
  schools: School[];
  total: number | null;
  page_size: number;
  has_next_page: boolean;
  next_cursor: string | null;
}

interface School {
  id: string; // Numeric legacy ID
  name: string;
  location: string | null; // "City, State"
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
```

---

### 2. Search Teachers (Professors) at a School

Search for professors by name, optionally scoped to a specific school via `schoolID`.

**Operation:** `TeacherSearchResultsPageQuery`

```graphql
query TeacherSearchResultsPageQuery(
  $query: TeacherSearchQuery!
  $count: Int!
  $cursor: String
) {
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
```

**Variables (search by name at a specific school):**

```json
{
  "query": {
    "text": "Smith",
    "schoolID": "U2Nob29sLTI0NA=="
  },
  "count": 20,
  "cursor": ""
}
```

**Variables (search all professors at a school — use a space as text):**

```json
{
  "query": {
    "text": " ",
    "schoolID": "U2Nob29sLTI0NA=="
  },
  "count": 20,
  "cursor": ""
}
```

> **GMU's school IDs:**
>
> - Relay ID: `U2Nob29sLTI0NA==` (base64 of `School-244`)
> - Legacy ID: `244`

**Response type (`ProfessorSearchResult`):**

```typescript
interface ProfessorSearchResult {
  professors: Professor[];
  total: number | null;
  page_size: number;
  has_next_page: boolean;
  next_cursor: string | null;
}

interface Professor {
  id: string; // Numeric legacy ID
  name: string; // "firstName lastName"
  department: string | null;
  school: School | null;
  overall_rating: number | null; // avgRating (1.0 - 5.0)
  num_ratings: number | null;
  percent_take_again: number | null; // wouldTakeAgainPercent (0-100)
  level_of_difficulty: number | null; // avgDifficulty (1.0 - 5.0)
  tags: string[];
  rating_distribution: Record<number, RatingDistributionBucket> | null;
}
```

---

### 3. Get Professor Details + Ratings

Fetch full professor info and paginated ratings using the teacher's Relay global ID.

**Operation:** `RatingsListQuery`

```graphql
query RatingsListQuery(
  $count: Int!
  $id: ID!
  $courseFilter: String
  $cursor: String
) {
  node(id: $id) {
    __typename
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
        country
        avgRating
        numRatings
      }
      ratings(first: $count, after: $cursor, courseFilter: $courseFilter) {
        edges {
          cursor
          node {
            id
            __typename
            comment
            helpfulRating
            clarityRating
            difficultyRating
            ratingTags
            date
            class
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
```

**Variables:**

```json
{
  "id": "VGVhY2hlci0yMDA0MTk4",
  "count": 20,
  "cursor": null,
  "courseFilter": null
}
```

**`courseFilter` (optional):** Filter ratings to a specific course code, e.g. `"CS 112"`.

**Extended rating fields available but not in minimal query:**

| Field                 | Type      | Description                                                               |
| --------------------- | --------- | ------------------------------------------------------------------------- |
| `comment`             | String    | Review text                                                               |
| `date`                | String    | e.g. `"2021-06-09 04:28:01 +0000 UTC"`                                    |
| `helpfulRating`       | Int (1-5) | Helpful score                                                             |
| `clarityRating`       | Int (1-5) | Clarity score                                                             |
| `difficultyRating`    | Int (1-5) | Difficulty score                                                          |
| `class`               | String    | Course code, e.g. `"COSC2440"`                                            |
| `ratingTags`          | String    | Tags joined by `"--"`, e.g. `"Gives good feedback--Caring--EXTRA CREDIT"` |
| `attendanceMandatory` | String    | `"mandatory"`, `"non mandatory"`, or `""`                                 |
| `wouldTakeAgain`      | Int       | `1` = yes, `0` = no                                                       |
| `grade`               | String    | e.g. `"A+"`, `"B"`, `"Not sure yet"`                                      |
| `isForCredit`         | Boolean   | Whether taken for credit                                                  |
| `isForOnlineClass`    | Boolean   | Whether online class                                                      |
| `textbookUse`         | Int       | Textbook usage (1-5 or 0)                                                 |
| `thumbsUpTotal`       | Int       | Upvotes                                                                   |
| `thumbsDownTotal`     | Int       | Downvotes                                                                 |
| `flagStatus`          | String    | `"UNFLAGGED"` etc.                                                        |
| `adminReviewedAt`     | String    | Admin review timestamp                                                    |

**Full rating fields query (from au5ton docs):**

```graphql
fragment Rating_rating on Rating {
  comment
  date
  class
  helpfulRating
  clarityRating
  difficultyRating
  ratingTags
  attendanceMandatory
  wouldTakeAgain
  grade
  isForCredit
  isForOnlineClass
  textbookUse
  thumbsUpTotal
  thumbsDownTotal
  flagStatus
  id
  legacyId
  teacherNote {
    id
    comment
    createdAt
    updatedAt
  }
}
```

**Teacher tags (aggregate):**

```graphql
fragment TeacherTags_teacher on Teacher {
  lastName
  teacherRatingTags {
    legacyId
    tagCount
    tagName
    id
  }
}
```

**Response type:**

```typescript
interface ProfessorRatingsPage {
  professor: Professor;
  ratings: Rating[];
  has_next_page: boolean;
  next_cursor: string | null;
}

interface Rating {
  date: Date;
  comment: string;
  quality: number | null; // clarityRating (or helpfulRating)
  difficulty: number | null;
  tags: string[]; // ratingTags split by "--"
  course_raw: string | null; // "class" field
  details: Record<string, unknown> | null; // for_credit, attendance, grade, textbook
  thumbs_up: number | null;
  thumbs_down: number | null;
}
```

---

### 4. Autocomplete School Search (Lighter Query)

A simpler autocomplete endpoint for school search (no pagination):

```graphql
query AutocompleteSearchQuery($query: String!) {
  autocomplete(query: $query) {
    schools {
      edges {
        node {
          id
          name
          city
          state
        }
      }
    }
  }
}
```

**Variables:**

```json
{ "query": "George Mason" }
```

---

### 5. Autocomplete Teacher Search (Lighter Query)

```graphql
query AutocompleteSearchQuery($query: String!) {
  autocomplete(query: $query) {
    teachers {
      edges {
        node {
          id
          firstName
          lastName
          school {
            name
            id
          }
        }
      }
    }
  }
}
```

**Variables:**

```json
{ "query": "Smith" }
```

> **Note:** Autocomplete queries return less data but are faster. Use the `NewSearch` queries for paginated, detailed results.

---

### 6. Get School Details + Ratings

Fetch full school info and paginated school ratings.

**Operation:** `SchoolRatingsListQuery`

```graphql
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
```

**Variables:**

```json
{
  "id": "U2Nob29sLTI0NA==",
  "count": 20,
  "cursor": null
}
```

---

## Pagination

All list endpoints use **cursor-based pagination** (Relay-style):

1. First request: set `cursor` to `""` or `null`
2. Check `pageInfo.hasNextPage` — if `true`, use `pageInfo.endCursor` as the `cursor` in the next request
3. Repeat until `hasNextPage` is `false`

**TypeScript pagination pattern:**

```typescript
async function getAllProfessorsAtSchool(
  schoolId: string,
  pageSize: number = 20,
): Promise<Professor[]> {
  const professors: Professor[] = [];
  let cursor: string | null = null;

  while (true) {
    const result = await searchProfessors(" ", {
      school_id: schoolId,
      page_size: pageSize,
      cursor,
    });
    professors.push(...result.professors);

    if (!result.has_next_page || !result.next_cursor) break;
    cursor = result.next_cursor;
  }

  return professors;
}
```

---

## TypeScript Implementation

### Minimal Client Implementation

```typescript
const RMP_API_URL = "https://www.ratemyprofessors.com/graphql";
const AUTH_TOKEN = "dGVzdDp0ZXN0";

async function rmpQuery<T = unknown>(
  operationName: string,
  query: string,
  variables: Record<string, unknown>,
): Promise<T> {
  const response = await fetch(RMP_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${AUTH_TOKEN}`,
    },
    body: JSON.stringify({ operationName, query, variables }),
  });

  if (!response.ok) {
    throw new Error(`RMP API error: ${response.status} ${response.statusText}`);
  }

  const json = await response.json();

  if (json.errors) {
    throw new Error(`RMP GraphQL errors: ${JSON.stringify(json.errors)}`);
  }

  return json.data as T;
}
```

### Search Schools

```typescript
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

async function searchSchools(
  query: string,
  count: number = 20,
  cursor: string | null = null,
) {
  return rmpQuery("SchoolSearchResultsPageQuery", SCHOOL_SEARCH_QUERY, {
    query: { text: query },
    count,
    cursor: cursor ?? "",
  });
}
```

### Search Professors at a School

```typescript
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

async function searchProfessorsAtSchool(
  searchText: string,
  schoolLegacyId: number,
  count: number = 20,
  cursor: string | null = null,
) {
  return rmpQuery("TeacherSearchResultsPageQuery", TEACHER_SEARCH_QUERY, {
    query: {
      text: searchText,
      schoolID: btoa(`School-${schoolLegacyId}`),
    },
    count,
    cursor: cursor ?? "",
  });
}
```

### Get Professor Details

```typescript
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

async function getProfessor(
  legacyId: number,
  count: number = 20,
  cursor: string | null = null,
) {
  return rmpQuery("RatingsListQuery", PROFESSOR_RATINGS_QUERY, {
    id: btoa(`Teacher-${legacyId}`),
    count,
    cursor: cursor ?? null,
    courseFilter: null,
  });
}
```

---

## Existing TypeScript Libraries

| Package                                                                                             | Install                                      | Notes                                                                                            |
| --------------------------------------------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| [`@mtucourses/rate-my-professors`](https://www.npmjs.com/package/@mtucourses/rate-my-professors)    | `npm install @mtucourses/rate-my-professors` | Basic wrapper, returns averages only, no rating pagination                                       |
| [`ratemyprofessors-client`](https://www.npmjs.com/package/ratemyprofessors-client) (by amaanjaved1) | `npm install ratemyprofessors-client`        | Full-featured typed client with pagination, retries, rate limiting. Has TS types for all models. |

---

## GMU-Specific Notes

**George Mason University** on RMP:

| Property           | Value                                         |
| ------------------ | --------------------------------------------- |
| School name        | George Mason University                       |
| Legacy ID          | `244`                                         |
| Relay (GraphQL) ID | `U2Nob29sLTI0NA==` (base64 of `School-244`)   |
| RMP URL            | `https://www.ratemyprofessors.com/campus/244` |

### Workflow: Find a GMU Professor

1. **Search for GMU** (if school ID unknown):

   ```typescript
   const result = await searchSchools("George Mason University");
   // result.search.schools.edges[0].node.id === "U2Nob29sLTI0NA=="
   // result.search.schools.edges[0].node.legacyId === 244
   ```

2. **Search professors at GMU** by name:

   ```typescript
   const result = await searchProfessorsAtSchool("Dana Goluboff", 244);
   // result.search.teachers.edges[i].node contains professor info
   ```

3. **Get full professor details + ratings**:

   ```typescript
   // Use the legacyId from step 2
   const result = await getProfessor(1234567);
   // result.node contains full teacher data + ratings
   ```

4. **Paginate through all ratings**:

   ```typescript
   let cursor: string | null = null;
   let allRatings: Rating[] = [];

   while (true) {
     const page = await getProfessor(1234567, 20, cursor);
     allRatings.push(...page.node.ratings.edges.map((e) => e.node));

     if (!page.node.ratings.pageInfo.hasNextPage) break;
     cursor = page.node.ratings.pageInfo.endCursor;
   }
   ```

---

## Rate Limiting & Best Practices

- **Rate limit**: The RMP API is not officially documented. Practical rate is ~60 requests/minute. Implement a token-bucket or similar rate limiter.
- **Retry strategy**: Use exponential backoff. Retry on 429 (rate limited) and 5xx errors.
- **Timeout**: 10 seconds is a reasonable default.
- **User-Agent**: Use a standard browser user-agent string. Some clients report 403 responses with non-browser user-agents.
- **No official support**: The API is undocumented and may change without notice.
