import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStudentCourses, getVideoProgress, getClassrooms } from '../firebase';
import ProgressBar from '../components/ProgressBar';

export default function Dashboard({ user }) {
    const [stats, setStats] = useState({
        coursesEnrolled: 0,
        videosCompleted: 0,
        classroomsJoined: 0
    });
    const [currentCourse, setCurrentCourse] = useState(null);
    const [currentProgress, setCurrentProgress] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDashboardData() {
            try {
                const courses = await getStudentCourses(user.uid);
                const classrooms = await getClassrooms();

                let totalVideosCompleted = 0;
                let lastCourse = null;
                let lastCourseProgress = 0;

                for (const course of courses) {
                    const completed = await getVideoProgress(user.uid, course.id);
                    totalVideosCompleted += completed.length;

                    if (completed.length > 0) {
                        lastCourse = course;
                        lastCourseProgress = completed.length;
                    }
                }

                setStats({
                    coursesEnrolled: courses.length,
                    videosCompleted: totalVideosCompleted,
                    classroomsJoined: classrooms.length
                });

                if (lastCourse) {
                    setCurrentCourse(lastCourse);
                    setCurrentProgress(lastCourseProgress);
                } else if (courses.length > 0) {
                    setCurrentCourse(courses[0]);
                    setCurrentProgress(0);
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchDashboardData();
    }, [user.uid]);

    if (loading) {
        return <div className="loading">Loading dashboard...</div>;
    }

    return (
        <div className="container page">
            <div className="welcome-section">
                <h1 className="welcome-title">Welcome back, {user.displayName?.split(' ')[0] || 'Student'}</h1>
                <p className="welcome-subtitle">Continue your learning journey</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-value">{stats.coursesEnrolled}</div>
                    <div className="stat-label">My Courses</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats.videosCompleted}</div>
                    <div className="stat-label">Videos Completed</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats.classroomsJoined}</div>
                    <div className="stat-label">Classrooms</div>
                </div>
            </div>

            {currentCourse ? (
                <>
                    <h2 className="page-title">Continue Learning</h2>
                    <div className="current-course">
                        <div className="current-course-header">
                            <img
                                src={currentCourse.videos?.[0]?.thumbnail || 'https://via.placeholder.com/80x60'}
                                alt={currentCourse.title}
                                className="current-course-image"
                            />
                            <div className="current-course-info">
                                <h3>{currentCourse.title}</h3>
                                <p>{currentCourse.videos?.length || 0} videos</p>
                            </div>
                        </div>
                        <ProgressBar
                            value={currentProgress}
                            max={currentCourse.videos?.length || 1}
                        />
                        <div style={{ marginTop: '16px' }}>
                            <Link to={`/my-course/${currentCourse.id}`} className="btn btn-primary">
                                {currentProgress > 0 ? 'Continue Course' : 'Start Course'}
                            </Link>
                        </div>
                    </div>
                </>
            ) : (
                <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
                    <p style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>
                        You have not added any courses yet. Add a YouTube playlist to start learning.
                    </p>
                    <Link to="/courses" className="btn btn-primary">
                        Add Your First Course
                    </Link>
                </div>
            )}

            <div style={{ marginTop: '24px' }}>
                <Link to="/courses" className="btn btn-secondary">
                    Browse My Courses
                </Link>
            </div>
        </div>
    );
}
