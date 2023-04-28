import { useEffect } from 'react';
import { getCourseById } from 'lib/api.ts';
import { GetCourseByIdResponse } from 'lib/types.ts';
import { useApiWrapper } from 'lib/hooks.ts';

export const useGetCourseById = (courseId: string | null) => {
  const { data, isLoading, isError, fetchApi } = useApiWrapper<GetCourseByIdResponse>(
    null,
    getCourseById,
  );

  useEffect(() => {
    if (courseId) {
      fetchApi(courseId);
    }
  }, [courseId]);

  return { data, isLoading, isError };
};
