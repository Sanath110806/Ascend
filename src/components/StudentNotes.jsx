import { useState, useEffect, useRef } from 'react';
import { getStudentNote, saveStudentNote } from '../firebase';

export default function StudentNotes({ userId, courseId, videoId }) {
    const [content, setContent] = useState('');
    const [saving, setSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const saveTimeoutRef = useRef(null);

    useEffect(() => {
        async function loadNote() {
            const note = await getStudentNote(userId, courseId, videoId);
            setContent(note);
        }
        loadNote();
    }, [userId, courseId, videoId]);

    useEffect(() => {
        // Auto-save with debounce
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(async () => {
            if (content !== undefined) {
                setSaving(true);
                await saveStudentNote(userId, courseId, videoId, content);
                setSaving(false);
                setLastSaved(new Date());
            }
        }, 1000);

        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [content, userId, courseId, videoId]);

    return (
        <div className="student-notes">
            <div className="student-notes-header">
                <h4>My Notes</h4>
                <span className="student-notes-status">
                    {saving ? 'Saving...' : lastSaved ? `Saved` : ''}
                </span>
            </div>
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Take notes for this video..."
                className="student-notes-textarea"
                rows={6}
            />
        </div>
    );
}
