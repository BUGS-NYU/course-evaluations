import { useEffect, useState } from 'react';
import { searchCourses } from 'lib/api.ts';
import { SearchCoursesResponse } from 'lib/types.ts';
import { usePrevious, useApiWrapper } from 'lib/hooks.ts';
import { useSearchParams } from 'react-router-dom';
import debounce from 'lodash.debounce';

export const useSearchCourse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [phrase, setPhrase] = useState<string>(searchParams.get('phrase') || '');

  const prevPhrase = usePrevious(phrase);
  const currPageQuery = searchParams.get('currPage');
  const currPhraseQuery = searchParams.get('phrase');

  const { data, isLoading, isError, fetchApi } = useApiWrapper<SearchCoursesResponse>(
    { data: [], pagination: { currPage: 1, perPage: 20, totalItems: 0, totalPages: 0 } },
    searchCourses,
  );

  useEffect(() => {
    const search = async () => await fetchApi(phrase || currPhraseQuery, currPageQuery || 1);

    if (!isLoading && (phrase || currPhraseQuery)) {
      search();
    }
  }, [currPageQuery]);

  useEffect(() => {
    const debouncedSearch = debounce(async () => {
      await fetchApi(phrase, 1);
      setSearchParams({ phrase });
    }, 1000);

    if (phrase.length > 0 && !isLoading && prevPhrase !== phrase) {
      debouncedSearch();
    }

    return () => {
      debouncedSearch.cancel();
    };
  }, [phrase]);

  return { data, isError, isLoading, changePhrase: setPhrase, phrase };
};
