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

export interface SearchSchoolsOptions {
  count?: number;
  cursor?: string | null;
}

export interface SearchProfessorsOptions {
  schoolLegacyId?: number;
  count?: number;
  cursor?: string | null;
}

export interface GetProfessorOptions {
  courseFilter?: string;
  count?: number;
  cursor?: string | null;
}

export interface GetSchoolDetailsOptions {
  count?: number;
  cursor?: string | null;
}
