import { Link } from 'react-router-dom';
import ProgressBar from './ProgressBar';

export default function StudentCourseCard({ course, progress = 0, onDelete }) {
    const totalVideos = course.videos?.length || 0;
    const thumbnail = course.videos?.[0]?.thumbnail || 'https://via.placeholder.com/400x200?text=Course';

    return (
        <div className="course-card">
            <img
                src={thumbnail}
                alt={course.title}
                className="course-card-image"
            />
            <div className="course-card-content">
                <h3 className="course-card-title">{course.title}</h3>
                <p className="course-card-description">
                    {totalVideos} video{totalVideos !== 1 ? 's' : ''} • YouTube Playlist
                </p>

                <ProgressBar value={progress} max={totalVideos} />

                <div className="course-card-footer">
                    <span className="progress-text">
                        {progress} / {totalVideos} completed
                    </span>
                    <div className="course-card-actions">
                        {onDelete && (
                            <button
                                onClick={() => onDelete(course.id)}
                                className="btn btn-secondary"
                                style={{ marginRight: '8px', padding: '8px 12px' }}
                            >
                                ✕
                            </button>
                        )}
                        <Link to={`/my-course/${course.id}`} className="btn btn-primary">
                            {progress > 0 ? 'Continue' : 'Start'}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
