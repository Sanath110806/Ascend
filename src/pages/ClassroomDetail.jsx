import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getClassroom, addStudentToClassroom } from '../firebase';
import TeacherNotes from '../components/TeacherNotes';
import TeacherPanel from '../components/TeacherPanel';

export default function ClassroomDetail({ user, userRole }) {
    const { classroomId } = useParams();
    const [classroom, setClassroom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);

    const fetchClassroom = async () => {
        try {
            const data = await getClassroom(classroomId);
            setClassroom(data);
        } catch (error) {
            console.error('Error fetching classroom:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClassroom();
    }, [classroomId]);

    const isTeacherOwner = userRole === 'teacher' && classroom?.teacherId === user.uid;
    const isEnrolled = classroom?.students?.some(s => s.id === user.uid);

    const handleJoinClassroom = async () => {
        setJoining(true);
        await addStudentToClassroom(classroomId, user.uid, user.displayName, user.email);
        await fetchClassroom();
        setJoining(false);
    };

    if (loading) {
        return <div className="loading">Loading classroom...</div>;
    }

    if (!classroom) {
        return (
            <div className="container page">
                <div className="empty-state">
                    <h3 className="empty-state-title">Classroom not found</h3>
                    <Link to="/classrooms" className="btn btn-primary" style={{ marginTop: '16px' }}>
                        Back to Classrooms
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container page">
            <div style={{ marginBottom: '16px' }}>
                <Link to="/classrooms" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Back to Classrooms
                </Link>
            </div>

            <div className="classroom-detail-header">
                <h1 className="classroom-detail-subject">{classroom.subject}</h1>
                <p className="classroom-detail-teacher">
                    Instructor: {classroom.teacherName}
                </p>

                {userRole === 'student' && !isEnrolled && (
                    <button
                        className="btn btn-primary"
                        style={{ marginTop: '12px' }}
                        onClick={handleJoinClassroom}
                        disabled={joining}
                    >
                        {joining ? 'Joining...' : 'Join Classroom'}
                    </button>
                )}
                {userRole === 'student' && isEnrolled && (
                    <span style={{
                        display: 'inline-block',
                        marginTop: '12px',
                        color: 'var(--text-secondary)',
                        fontSize: '0.9rem'
                    }}>
                        You are enrolled in this classroom
                    </span>
                )}
            </div>

            {isTeacherOwner && (
                <TeacherPanel classroomId={classroomId} onUpdate={fetchClassroom} />
            )}

            <div className="classroom-detail-grid">
                <div>
                    <div className="classroom-detail-section">
                        <h3 className="classroom-detail-section-title">Announcements</h3>
                        {classroom.announcements?.length > 0 ? (
                            <ul className="announcement-list">
                                {classroom.announcements.map((announcement, index) => (
                                    <li key={index} className="announcement-item">
                                        {announcement}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                No announcements yet.
                            </p>
                        )}
                    </div>

                    <div className="classroom-detail-section">
                        <h3 className="classroom-detail-section-title">Assignments</h3>
                        {classroom.assignments?.length > 0 ? (
                            <ul className="assignment-list">
                                {classroom.assignments.map((assignment) => (
                                    <li key={assignment.id} className="assignment-item" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                            <span className="assignment-title">{assignment.title}</span>
                                            <span className="assignment-due">Due: {assignment.dueDate}</span>
                                        </div>
                                        {assignment.description && (
                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                                {assignment.description}
                                            </p>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                No assignments yet.
                            </p>
                        )}
                    </div>

                    {isTeacherOwner && (
                        <div className="classroom-detail-section">
                            <h3 className="classroom-detail-section-title">Enrolled Students ({classroom.students?.length || 0})</h3>
                            {classroom.students?.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {classroom.students.map((student) => (
                                        <div
                                            key={student.id}
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: '12px',
                                                backgroundColor: 'var(--bg-secondary)',
                                                borderRadius: '6px'
                                            }}
                                        >
                                            <div>
                                                <div style={{ fontWeight: '500' }}>{student.name}</div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{student.email}</div>
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                Joined: {new Date(student.joinedAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    No students enrolled yet.
                                </p>
                            )}
                        </div>
                    )}
                </div>

                <div>
                    <div className="classroom-detail-section">
                        <h3 className="classroom-detail-section-title">Reference Notes</h3>
                        {classroom.referenceNotes?.length > 0 ? (
                            <TeacherNotes notes={classroom.referenceNotes} />
                        ) : (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                No reference notes yet.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
