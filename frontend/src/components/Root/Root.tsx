import { FunctionalComponent } from 'react';
import { usePhraseQueryState } from 'lib/hooks.ts';
import { BaseCourse } from 'lib/types.ts';
import { useSearch } from './use-search.ts';
import { PageCounter } from './PageCounter';
import styles from './styles.module.css';

const CourseEntry: FunctionalComponent<BaseCourse> = ({ _id, term, description, instructors }) => {
  return (
    <div className={styles.courseEntry}>
      <h1>{description}</h1>
    </div>
  );
};

const Root = () => {
  const [phrase, setPhrase] = usePhraseQueryState();
  const { data, isLoading } = useSearch();

  const renderData =
    data.data.length > 0
      ? data.data.map((course) => <CourseEntry key={course._id} {...course} />)
      : `No results to display`;

  const setSearchValue = (e) => setPhrase(e.target.value);

  return (
    <div className={styles.siteContainer}>
      <div className={styles.searchInputBg}>
        <input
          type="text"
          placeholder="Type your search phrase..."
          value={phrase}
          onChange={setSearchValue}
          className={styles.searchInput}
        />
      </div>
      {isLoading ? 'Loading...' : renderData}
      <PageCounter totalPages={data.pagination.totalPages} />
    </div>
  );
};

export default Root;
