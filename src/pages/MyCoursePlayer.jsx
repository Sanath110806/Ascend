import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getStudentCourse, getVideoProgress, updateVideoProgress, logVideoWatch } from '../firebase';
import StudentNotes from '../components/StudentNotes';
import ProgressBar from '../components/ProgressBar';

export default function MyCoursePlayer({ user }) {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [currentVideo, setCurrentVideo] = useState(null);
    const [completedVideos, setCompletedVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCourseData() {
            try {
                const courseData = await getStudentCourse(courseId);
                if (!courseData) {
                    console.error('Course not found');
                    return;
                }

                setCourse(courseData);

                // Get user progress
                const completed = await getVideoProgress(user.uid, courseId);
                setCompletedVideos(completed);

                // Set initial video
                if (courseData.videos?.length > 0) {
                    const firstIncomplete = courseData.videos.find(
                        v => !completed.includes(v.id)
                    );
                    setCurrentVideo(firstIncomplete || courseData.videos[0]);
                }
            } catch (error) {
                console.error('Error fetching course:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchCourseData();
    }, [courseId, user.uid]);

    const handleVideoClick = async (video) => {
        setCurrentVideo(video);
        // Log activity when user watches a video
        await logVideoWatch(user.uid);
    };

    const handleToggleComplete = async (videoId) => {
        const isCompleted = completedVideos.includes(videoId);
        const updatedList = await updateVideoProgress(user.uid, courseId, videoId, !isCompleted);
        setCompletedVideos(updatedList);
    };

    if (loading) {
        return <div className="loading">Loading course...</div>;
    }

    if (!course) {
        return (
            <div className="container page">
                <div className="empty-state">
                    <h3 className="empty-state-title">Course not found</h3>
                    <Link to="/courses" className="btn btn-primary" style={{ marginTop: '16px' }}>
                        Back to Courses
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container page">
            <div style={{ marginBottom: '16px' }}>
                <Link to="/courses" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    ← Back to My Courses
                </Link>
            </div>

            <div className="player-layout">
                <div>
                    {/* Video Player */}
                    <div className="video-container">
                        <div className="video-player">
                            {currentVideo ? (
                                <iframe
                                    src={`https://www.youtube.com/embed/${currentVideo.id}?rel=0&modestbranding=1`}
                                    title={currentVideo.title}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            ) : (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '100%',
                                    color: 'var(--text-secondary)'
                                }}>
                                    Select a video to start
                                </div>
                            )}
                        </div>
                        {currentVideo && (
                            <div className="video-title">{currentVideo.title}</div>
                        )}
                    </div>

                    {/* Student Notes */}
                    {currentVideo && (
                        <StudentNotes
                            userId={user.uid}
                            courseId={courseId}
                            videoId={currentVideo.id}
                        />
                    )}
                </div>

                {/* Video Sidebar */}
                <div className="lesson-sidebar">
                    <h3 className="lesson-sidebar-title">{course.title}</h3>

                    <div style={{ marginBottom: '16px' }}>
                        <ProgressBar
                            value={completedVideos.length}
                            max={course.videos?.length || 1}
                        />
                    </div>

                    <div className="lesson-list">
                        {course.videos?.map((video) => (
                            <div
                                key={video.id}
                                className={`video-item ${currentVideo?.id === video.id ? 'active' : ''}`}
                                onClick={() => handleVideoClick(video)}
                            >
                                <div
                                    className={`lesson-checkbox ${completedVideos.includes(video.id) ? 'completed' : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleComplete(video.id);
                                    }}
                                >
                                    {completedVideos.includes(video.id) && '✓'}
                                </div>
                                <img
                                    src={video.thumbnail}
                                    alt=""
                                    className="video-item-thumbnail"
                                />
                                <div className="video-item-info">
                                    <span className="video-item-title">{video.title}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
