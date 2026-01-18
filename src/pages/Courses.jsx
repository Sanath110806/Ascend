import { useState, useEffect } from 'react';
import { getStudentCourses, deleteStudentCourse, getVideoProgress } from '../firebase';
import AddPlaylist from '../components/AddPlaylist';
import StudentCourseCard from '../components/StudentCourseCard';

export default function Courses({ user }) {
    const [courses, setCourses] = useState([]);
    const [progressMap, setProgressMap] = useState({});
    const [loading, setLoading] = useState(true);

    const fetchCourses = async () => {
        try {
            const userCourses = await getStudentCourses(user.uid);
            setCourses(userCourses);

            const progressData = {};
            for (const course of userCourses) {
                const completed = await getVideoProgress(user.uid, course.id);
                progressData[course.id] = completed.length;
            }
            setProgressMap(progressData);
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, [user.uid]);

    const handleCourseAdded = (newCourse) => {
        setCourses([newCourse, ...courses]);
        setProgressMap({ ...progressMap, [newCourse.id]: 0 });
    };

    const handleDeleteCourse = async (courseId) => {
        if (window.confirm('Delete this course?')) {
            await deleteStudentCourse(courseId);
            setCourses(courses.filter(c => c.id !== courseId));
        }
    };

    if (loading) {
        return <div className="loading">Loading courses...</div>;
    }

    return (
        <div className="container page">
            <h1 className="page-title">My Courses</h1>

            <AddPlaylist userId={user.uid} onCourseAdded={handleCourseAdded} />

            {courses.length === 0 ? (
                <div className="empty-state">
                    <h3 className="empty-state-title">No courses yet</h3>
                    <p className="empty-state-description">
                        Add a YouTube playlist to start learning.
                    </p>
                </div>
            ) : (
                <div className="card-grid">
                    {courses.map(course => (
                        <StudentCourseCard
                            key={course.id}
                            course={course}
                            progress={progressMap[course.id] || 0}
                            onDelete={handleDeleteCourse}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
