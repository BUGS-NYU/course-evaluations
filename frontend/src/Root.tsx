import { useState, useCallback, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {useSearchParams} from "react-router-dom";
import {searchCourses} from './lib/api.ts';
import debounce from 'lodash.debounce';

const useQueryState = (query: string) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const setQuery = useCallback((value) => {
    const modifiedSearchParams = new URLSearchParams(searchParams.entries());

    if (value === "") {
      modifiedSearchParams.delete(query);
    } else {
      modifiedSearchParams.set(query, value);
    }

    setSearchParams(modifiedSearchParams);
  }, [searchParams]);

  return [searchParams.get(query) || "", setQuery];
}

const useSearch = () => {
  const [phrase, setPhrase] = useQueryState("phrase");
  const [currPage] = useQueryState("currPage");
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const setSearchValue = (e) => setPhrase(e.target.value);

  useEffect(() => {
    const debouncedSearch = debounce(async () => {
      try {
        setIsError(false);
        setIsLoading(true);
        const res = await searchCourses(phrase, currPage || 1);
        setData(res);
        console.log(res);
      } catch (err) {
        setIsError(true);
        console.log(err);
      } finally {
        setIsLoading(false);
      }
    }, 1000);

    if (phrase.length > 0) {
      debouncedSearch();
    }

    return () => {
      debouncedSearch.cancel();
    }
  }, [currPage, phrase]);

  return {data, isLoading, isError, setSearchValue, searchValue: phrase};
}

function Root() {
  const {data, isLoading, isError, setSearchValue, searchValue} = useSearch();

  const renderData = data.length > 0 ? "data" : "no data";

  return (
    <>
      <input type="text" value={searchValue} onChange={setSearchValue} />
      {renderData}
    </>
  )
}

export default Root
