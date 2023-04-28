import { useCallback, useRef, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export const useQueryState = (query: string) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const setQuery = useCallback(
    (value) => {
      const modifiedSearchParams = new URLSearchParams(searchParams.entries());

      if (value === '') {
        modifiedSearchParams.delete(query);
      } else {
        modifiedSearchParams.set(query, value);
      }

      setSearchParams(modifiedSearchParams);
    },
    [searchParams],
  );

  return [searchParams.get(query) || '', setQuery];
};

export const usePhraseQueryState = () => useQueryState('phrase');

export const useCurrPageQueryState = () => useQueryState('currPage');

export const useViewingCourseIdQueryState = () => useQueryState('viewingId');

export const usePrevious = <T>(value: T) => {
  const ref = useRef<T>(value);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
};

export const useApiWrapper = <T>(
  initialData: T | null,
  fetchFunc: (...args: Array<any>) => Promise<T>,
) => {
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const fetchApi = async (...args: Array<any>) => {
    try {
      setIsLoading(true);
      const res = await fetchFunc(...args);
      setData(res);
      console.log(res);
    } catch (err) {
      setIsError(true);
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  return { fetchApi, data, isLoading, isError };
};
