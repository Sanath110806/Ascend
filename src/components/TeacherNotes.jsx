import { useState } from 'react';

export default function TeacherNotes({ notes }) {
    const [expandedNote, setExpandedNote] = useState(null);

    if (!notes || notes.length === 0) {
        return null;
    }

    return (
        <div className="teacher-notes">
            <h4 className="teacher-notes-title">Reference Notes</h4>
            <div className="teacher-notes-list">
                {notes.map((note) => (
                    <div key={note.id} className="teacher-note-item">
                        <button
                            className="teacher-note-header"
                            onClick={() => setExpandedNote(expandedNote === note.id ? null : note.id)}
                        >
                            <span>{note.title}</span>
                            <span className="teacher-note-toggle">
                                {expandedNote === note.id ? '−' : '+'}
                            </span>
                        </button>
                        {expandedNote === note.id && (
                            <div className="teacher-note-content">
                                <pre>{note.content}</pre>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
