import { Link } from 'react-router-dom';
import ProgressBar from './ProgressBar';

export default function CourseCard({ course, progress = 0 }) {
    const totalLessons = course.lessons?.length || 0;

    return (
        <div className="course-card">
            <img
                src={course.thumbnail || 'https://via.placeholder.com/400x200?text=Course'}
                alt={course.title}
                className="course-card-image"
            />
            <div className="course-card-content">
                <h3 className="course-card-title">{course.title}</h3>
                <p className="course-card-description">{course.description}</p>

                <ProgressBar value={progress} max={totalLessons} />

                <div className="course-card-footer">
                    <span className="progress-text">
                        {progress} / {totalLessons} lessons
                    </span>
                    <Link to={`/course/${course.id}`} className="btn btn-primary">
                        {progress > 0 ? 'Continue' : 'Start'}
                    </Link>
                </div>
            </div>
        </div>
    );
}
