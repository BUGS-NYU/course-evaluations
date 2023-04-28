import { FunctionalComponent } from 'react';
import { useSearchParams } from 'react-router-dom';
import styles from './styles.module.css';

export const PageCounter: FunctionalComponent<{ totalPages: number }> = ({ totalPages }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const currPage = Number(searchParams.get('currPage') || 1);

  const setCurrPage = (page: number) =>
    setSearchParams((prevParams) => {
      prevParams.set('currPage', page);
      return prevParams;
    });

  if (totalPages < 1) {
    return null;
  }

  const renderPages = [...new Array(totalPages)].map((_, page) => (
    <div
      key={page}
      className={page + 1 === currPage ? `${styles.page} ${styles.curr}` : styles.page}
      onClick={() => setCurrPage(page + 1)}
    >
      {page + 1}
    </div>
  ));

  return <div className={styles.pageList}>{renderPages}</div>;
};
