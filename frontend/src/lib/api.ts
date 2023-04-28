import { API_BASE_URL, PER_PAGE } from './constants.ts';
import { SearchCoursesResponse, GetCourseByIdResponse } from './types.ts';

const fetchApi = async <T>(endpoint: string): Promise<T> => {
  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`);
    const result = await response.json();
    return result;
  } catch (err) {
    console.error(err);
  }
};

export const searchCourses = async (phrase: string, currPage: string) => {
  return await fetchApi<SearchCoursesResponse>(
    `search?phrase=${phrase}&currPage=${currPage}&perPage=${PER_PAGE}`,
  );
};

export const getCourseById = async (courseId: string) => {
  return await fetchApi<GetCourseByIdResponse>(`course/${courseId}`);
};
