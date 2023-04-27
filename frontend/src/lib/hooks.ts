import { useCallback } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import qs from 'qs';

const parseQuery = (query) => qs.parse(query, { ignoreQueryPrefix: true });

export const useQueryState = (query: string) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const setQuery = useCallback(
    (value: string) => {
      const currentQueries = parseQuery(location.search);

      const queryString = qs.stringify({ ...currentQueries, [query]: value }, { skipNulls: true });
      navigate(`${location.pathname}?${queryString}`);
    },
    [navigate, location, query],
  );

  return [parseQuery(location.search)[query], setQuery];
};
