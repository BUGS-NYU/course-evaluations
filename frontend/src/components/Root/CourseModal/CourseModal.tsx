import { FunctionalComponent } from 'react';
import { QuestionSection } from 'lib/types.ts';
import { useGetCourseById } from './use-get-course-by-id.ts';
import styles from './styles.module.css';

const QuestionSection: FunctionalComponent<QuestionSection> = ({ title, questions }) => (
  <>
    <h2>{title}</h2>
    {questions.map(({ question, average }) => (
      <p key={question}>
        {question} <strong>Rating: {average}</strong>
      </p>
    ))}
  </>
);

export const CourseModal: FunctionalComponent<{
  courseId: string | null;
  closeModal: () => void;
}> = ({ courseId, closeModal }) => {
  const { isLoading, data } = useGetCourseById(courseId);

  const className = courseId ? `${styles.container} ${styles.visible}` : styles.container;

  return (
    <div className={className}>
      <div className={styles.modalBg}></div>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={closeModal}>
          Close
        </button>
        {isLoading || data === null ? (
          'Loading...'
        ) : (
          <>
            <h1>{data.data.description}</h1>
            <p>
              <strong>Term: </strong>
              {data.data.term}
            </p>
            <p>
              <strong>Location: </strong>
              {data.data.location}
            </p>
            <p>
              <strong>Instructor(s): </strong>
              {data.data.instructors.join(', ')}
            </p>
            <p>
              <strong>Total enrolled: </strong>
              {data.data.totalEnrolled}
            </p>
            <p>
              <strong>Total responses: </strong>
              {data.data.totalResponses}
            </p>
            <h1>Questions</h1>
            {data.data.questionSections.map((questionSection, index) => (
              <QuestionSection key={index} {...questionSection} />
            ))}
          </>
        )}
      </div>
    </div>
  );
};
