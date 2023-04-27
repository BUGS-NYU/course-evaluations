import { usePhraseQueryState } from 'lib/hooks.ts';
import { useSearch } from './use-search.ts';
import { PageCounter } from './PageCounter';
import styles from './styles.module.css';

const Root = () => {
  const [phrase, setPhrase] = usePhraseQueryState();
  const { data, isLoading } = useSearch();

  const renderData = data.length > 0 ? 'data' : 'no data';

  const setSearchValue = (e) => setPhrase(e.target.value);

  return (
    <div className={styles.siteContainer}>
      <div className={styles.searchInputBg}>
        <input
          type="text"
          value={phrase}
          onChange={setSearchValue}
          className={styles.searchInput}
        />
      </div>
      {isLoading ? 'loading...' : renderData}
      <PageCounter totalPages={data.pagination.totalPages} />
    </div>
  );
};

export default Root;
