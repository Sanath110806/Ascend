import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getStudentCourses, getVideoProgress, getClassrooms, getTeacherClassrooms, updateUserName } from '../firebase';
import ProgressBar from '../components/ProgressBar';
import ActivityHeatmap from '../components/ActivityHeatmap';

export default function Profile({ user, userRole, onNameUpdate }) {
    const [searchParams] = useSearchParams();
    const [stats, setStats] = useState({});
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [classrooms, setClassrooms] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isEditing, setIsEditing] = useState(searchParams.get('edit') === 'true');
    const [editName, setEditName] = useState(user?.displayName || '');
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        async function fetchProfileData() {
            try {
                if (userRole === 'student') {
                    const courses = await getStudentCourses(user.uid);
                    const allClassrooms = await getClassrooms();
                    const joinedClassrooms = allClassrooms.filter(c =>
                        c.students?.some(s => s.id === user.uid)
                    );

                    let totalCompleted = 0;
                    let totalVideos = 0;

                    const coursesWithProgress = [];

                    for (const course of courses) {
                        const completed = await getVideoProgress(user.uid, course.id);
                        const videoCount = course.videos?.length || 0;

                        totalCompleted += completed.length;
                        totalVideos += videoCount;

                        coursesWithProgress.push({
                            ...course,
                            progress: completed.length,
                            total: videoCount
                        });
                    }

                    setEnrolledCourses(coursesWithProgress);
                    setClassrooms(joinedClassrooms);
                    setStats({
                        coursesCount: courses.length,
                        videosCompleted: totalCompleted,
                        totalVideos,
                        classroomsJoined: joinedClassrooms.length
                    });
                } else {
                    const teacherClassrooms = await getTeacherClassrooms(user.uid);

                    let totalStudents = 0;
                    let totalAssignments = 0;
                    let totalNotes = 0;

                    teacherClassrooms.forEach(c => {
                        totalStudents += c.students?.length || 0;
                        totalAssignments += c.assignments?.length || 0;
                        totalNotes += c.referenceNotes?.length || 0;
                    });

                    setClassrooms(teacherClassrooms);
                    setStats({
                        classroomsCreated: teacherClassrooms.length,
                        totalStudents,
                        totalAssignments,
                        totalNotes
                    });
                }
            } catch (error) {
                console.error('Error fetching profile data:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchProfileData();
    }, [user.uid, userRole]);

    const handleSaveName = async () => {
        if (!editName.trim()) return;
        setSaving(true);
        await updateUserName(user.uid, editName);
        setDisplayName(editName);
        setSaving(false);
        setIsEditing(false);
    };

    if (loading) {
        return <div className="loading">Loading profile...</div>;
    }

    return (
        <div className="container page">
            <h1 className="page-title">Profile</h1>

            <div className="profile-header">
                <img
                    src={user.photoURL || 'https://via.placeholder.com/100'}
                    alt={displayName}
                    className="profile-avatar"
                />
                <div className="profile-info">
                    {isEditing ? (
                        <div className="edit-profile-form">
                            <div className="form-group">
                                <label className="form-label">Display Name</label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    style={{ maxWidth: '300px' }}
                                />
                            </div>
                            <div className="form-actions">
                                <button
                                    className="btn btn-primary"
                                    onClick={handleSaveName}
                                    disabled={saving}
                                >
                                    {saving ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setIsEditing(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h2>{displayName || 'User'}</h2>
                            <p>{user.email}</p>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                {userRole}
                            </p>
                            <button
                                className="btn btn-secondary"
                                style={{ marginTop: '8px' }}
                                onClick={() => setIsEditing(true)}
                            >
                                Edit
                            </button>
                        </>
                    )}
                </div>
            </div>

            {userRole === 'student' && (
                <div className="profile-section">
                    <ActivityHeatmap userId={user.uid} />
                </div>
            )}

            <div className="profile-section">
                <h3 className="profile-section-title">Statistics</h3>
                <div className="stats-grid">
                    {userRole === 'student' ? (
                        <>
                            <div className="stat-card">
                                <div className="stat-value">{stats.coursesCount || 0}</div>
                                <div className="stat-label">Courses</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">{stats.videosCompleted || 0}</div>
                                <div className="stat-label">Videos</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">{stats.classroomsJoined || 0}</div>
                                <div className="stat-label">Classrooms</div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="stat-card">
                                <div className="stat-value">{stats.classroomsCreated || 0}</div>
                                <div className="stat-label">Classrooms</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">{stats.totalStudents || 0}</div>
                                <div className="stat-label">Students</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">{stats.totalAssignments || 0}</div>
                                <div className="stat-label">Assignments</div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {userRole === 'student' && enrolledCourses.length > 0 && (
                <div className="profile-section">
                    <h3 className="profile-section-title">Courses</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {enrolledCourses.map(course => (
                            <div key={course.id} className="card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <h4 style={{ fontSize: '1rem', fontWeight: '500' }}>{course.title}</h4>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                        {course.progress} / {course.total}
                                    </span>
                                </div>
                                <ProgressBar
                                    value={course.progress}
                                    max={course.total || 1}
                                    showText={false}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {userRole === 'teacher' && classrooms.length > 0 && (
                <div className="profile-section">
                    <h3 className="profile-section-title">Classrooms</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {classrooms.map(c => (
                            <div key={c.id} className="card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h4 style={{ fontSize: '1rem', fontWeight: '500' }}>{c.subject}</h4>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                        {c.students?.length || 0} students
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
