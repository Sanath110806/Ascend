import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getClassrooms, getTeacherClassrooms, createClassroom } from '../firebase';

export default function Classrooms({ user, userRole }) {
    const [classrooms, setClassrooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newSubject, setNewSubject] = useState('');
    const [creating, setCreating] = useState(false);

    const fetchClassrooms = async () => {
        try {
            let data;
            if (userRole === 'teacher') {
                data = await getTeacherClassrooms(user.uid);
            } else {
                data = await getClassrooms();
            }
            setClassrooms(data);
        } catch (error) {
            console.error('Error fetching classrooms:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClassrooms();
    }, [user.uid, userRole]);

    const handleCreateClassroom = async (e) => {
        e.preventDefault();
        if (!newSubject.trim()) return;

        setCreating(true);
        const classroom = await createClassroom(
            user.uid,
            user.displayName,
            user.email,
            newSubject
        );

        if (classroom) {
            setClassrooms([classroom, ...classrooms]);
            setNewSubject('');
            setShowCreateForm(false);
        }
        setCreating(false);
    };

    if (loading) {
        return <div className="loading">Loading classrooms...</div>;
    }

    return (
        <div className="container page">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 className="page-title" style={{ marginBottom: 0 }}>
                    {userRole === 'teacher' ? 'My Classrooms' : 'Classrooms'}
                </h1>
                {userRole === 'teacher' && (
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowCreateForm(!showCreateForm)}
                    >
                        {showCreateForm ? 'Cancel' : 'Create Classroom'}
                    </button>
                )}
            </div>

            {userRole === 'teacher' && showCreateForm && (
                <div className="card" style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '16px' }}>Create New Classroom</h3>
                    <form onSubmit={handleCreateClassroom} style={{ display: 'flex', gap: '12px' }}>
                        <input
                            type="text"
                            value={newSubject}
                            onChange={(e) => setNewSubject(e.target.value)}
                            placeholder="Subject name (e.g., CS 101 - Introduction to Programming)"
                            style={{ flex: 1 }}
                        />
                        <button type="submit" className="btn btn-primary" disabled={creating}>
                            {creating ? 'Creating...' : 'Create'}
                        </button>
                    </form>
                </div>
            )}

            {classrooms.length === 0 ? (
                <div className="empty-state">
                    <h3 className="empty-state-title">
                        {userRole === 'teacher' ? 'No classrooms created yet' : 'No classrooms available'}
                    </h3>
                    <p className="empty-state-description">
                        {userRole === 'teacher'
                            ? 'Create your first classroom to get started.'
                            : 'No classrooms have been created yet.'}
                    </p>
                </div>
            ) : (
                <div className="card-grid">
                    {classrooms.map(classroom => (
                        <Link
                            key={classroom.id}
                            to={`/classroom/${classroom.id}`}
                            style={{ textDecoration: 'none' }}
                        >
                            <div className="classroom-card">
                                <h3 className="classroom-card-subject">{classroom.subject}</h3>
                                <p className="classroom-card-teacher">
                                    {userRole === 'teacher' ? 'Your Classroom' : `Instructor: ${classroom.teacherName}`}
                                </p>

                                <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        {classroom.announcements?.length || 0} announcements
                                    </span>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        {classroom.assignments?.length || 0} assignments
                                    </span>
                                </div>

                                {userRole === 'teacher' && (
                                    <span style={{
                                        fontSize: '0.85rem',
                                        color: 'var(--text-secondary)',
                                        display: 'block',
                                        marginTop: '8px'
                                    }}>
                                        {classroom.students?.length || 0} students enrolled
                                    </span>
                                )}

                                {classroom.referenceNotes?.length > 0 && (
                                    <span style={{
                                        fontSize: '0.85rem',
                                        color: 'var(--text-secondary)',
                                        display: 'block',
                                        marginTop: '8px'
                                    }}>
                                        {classroom.referenceNotes.length} reference notes
                                    </span>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
