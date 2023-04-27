import { FunctionalComponent } from 'react';
import { useCurrPageQueryState } from 'lib/hooks.ts';
import styles from './styles.module.css';

export const PageCounter: FunctionalComponent<{ totalPages: number }> = ({ totalPages }) => {
  const [currPage, setCurrPage] = useCurrPageQueryState();

  if (totalPages < 1) {
    return null;
  }

  const renderPages = [...new Array(totalPages)].map((_, page) => (
    <div
      key={page}
      className={page + 1 === Number(currPage || 1) ? `${styles.page} ${styles.curr}` : styles.page}
      onClick={() => setCurrPage(page + 1)}
    >
      {page + 1}
    </div>
  ));

  return <div className={styles.pageList}>{renderPages}</div>;
};
