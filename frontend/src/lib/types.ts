export interface BaseCourse {
  _id: number;
  term: string;
  description: string;
  location: string;
  instructors: string[];
  totalEnrolled: number;
  totalResponses: number;
  responseRate: number;
}

export interface Question {
  question: string;
  average: number;
}

export interface QuestionSection {
  title: string;
  questions: Question[];
}

export interface DetailedCourse extends BaseCourse {
  questionSections: QuestionSection[];
}

export interface SearchCoursesResponse {
  data: BaseCourse[];
  pagination: {
    currPage: number;
    perPage: number;
    totalPages: number;
    totalItems: number;
  };
}

export interface GetCourseByIdResponse {
  data: DetailedCourse;
}
