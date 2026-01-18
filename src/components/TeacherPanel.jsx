import { useState } from 'react';
import { addAnnouncement, addAssignment, addReferenceNote } from '../firebase';

export default function TeacherPanel({ classroomId, onUpdate }) {
    const [activeTab, setActiveTab] = useState('announcements');
    const [loading, setLoading] = useState(false);

    // Form states
    const [announcement, setAnnouncement] = useState('');
    const [assignment, setAssignment] = useState({ title: '', description: '', dueDate: '' });
    const [note, setNote] = useState({ title: '', content: '' });

    const handleAddAnnouncement = async (e) => {
        e.preventDefault();
        if (!announcement.trim()) return;

        setLoading(true);
        await addAnnouncement(classroomId, announcement);
        setAnnouncement('');
        setLoading(false);
        if (onUpdate) onUpdate();
    };

    const handleAddAssignment = async (e) => {
        e.preventDefault();
        if (!assignment.title.trim() || !assignment.dueDate) return;

        setLoading(true);
        await addAssignment(classroomId, assignment);
        setAssignment({ title: '', description: '', dueDate: '' });
        setLoading(false);
        if (onUpdate) onUpdate();
    };

    const handleAddNote = async (e) => {
        e.preventDefault();
        if (!note.title.trim() || !note.content.trim()) return;

        setLoading(true);
        await addReferenceNote(classroomId, note);
        setNote({ title: '', content: '' });
        setLoading(false);
        if (onUpdate) onUpdate();
    };

    return (
        <div className="teacher-panel">
            <h3 className="teacher-panel-title">Teacher Panel</h3>

            <div className="teacher-panel-tabs">
                <button
                    className={`teacher-panel-tab ${activeTab === 'announcements' ? 'active' : ''}`}
                    onClick={() => setActiveTab('announcements')}
                >
                    Announcement
                </button>
                <button
                    className={`teacher-panel-tab ${activeTab === 'assignments' ? 'active' : ''}`}
                    onClick={() => setActiveTab('assignments')}
                >
                    Assignment
                </button>
                <button
                    className={`teacher-panel-tab ${activeTab === 'notes' ? 'active' : ''}`}
                    onClick={() => setActiveTab('notes')}
                >
                    Reference Note
                </button>
            </div>

            <div className="teacher-panel-content">
                {activeTab === 'announcements' && (
                    <form onSubmit={handleAddAnnouncement}>
                        <textarea
                            value={announcement}
                            onChange={(e) => setAnnouncement(e.target.value)}
                            placeholder="Enter announcement..."
                            rows={3}
                        />
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Posting...' : 'Post Announcement'}
                        </button>
                    </form>
                )}

                {activeTab === 'assignments' && (
                    <form onSubmit={handleAddAssignment}>
                        <input
                            type="text"
                            value={assignment.title}
                            onChange={(e) => setAssignment({ ...assignment, title: e.target.value })}
                            placeholder="Assignment title"
                        />
                        <textarea
                            value={assignment.description}
                            onChange={(e) => setAssignment({ ...assignment, description: e.target.value })}
                            placeholder="Description (optional)"
                            rows={2}
                        />
                        <input
                            type="date"
                            value={assignment.dueDate}
                            onChange={(e) => setAssignment({ ...assignment, dueDate: e.target.value })}
                        />
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Adding...' : 'Add Assignment'}
                        </button>
                    </form>
                )}

                {activeTab === 'notes' && (
                    <form onSubmit={handleAddNote}>
                        <input
                            type="text"
                            value={note.title}
                            onChange={(e) => setNote({ ...note, title: e.target.value })}
                            placeholder="Note title"
                        />
                        <textarea
                            value={note.content}
                            onChange={(e) => setNote({ ...note, content: e.target.value })}
                            placeholder="Note content..."
                            rows={4}
                        />
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Uploading...' : 'Upload Note'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
