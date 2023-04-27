import { useEffect } from 'react';
import { searchCourses } from 'lib/api.ts';
import { SearchCoursesResponse } from 'lib/types.ts';
import {
  usePhraseQueryState,
  usePrevious,
  useApiWrapper,
  useCurrPageQueryState,
} from 'lib/hooks.ts';
import debounce from 'lodash.debounce';

export const useSearch = () => {
  const [phrase] = usePhraseQueryState();
  const prevPhrase = usePrevious(phrase);
  const [currPage, setCurrPage] = useCurrPageQueryState();
  const { data, isLoading, isError, fetchApi } = useApiWrapper<SearchCoursesResponse>(
    { data: [], pagination: { currPage: 1, perPage: 20, totalItems: 0, totalPages: 0 } },
    searchCourses,
  );

  useEffect(() => {
    const search = async () => await fetchApi(phrase, currPage || 1);

    if (!isLoading && !!phrase) {
      search();
    }
  }, [currPage]);

  useEffect(() => {
    const debouncedSearch = debounce(async () => {
      await fetchApi(phrase, 1);
      setCurrPage(1);
    }, 1000);

    if (phrase.length > 0 && !isLoading && prevPhrase !== phrase) {
      debouncedSearch();
    }

    return () => {
      debouncedSearch.cancel();
    };
  }, [phrase]);

  return { data, isError, isLoading };
};
