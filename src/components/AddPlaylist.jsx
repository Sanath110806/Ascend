import { useState } from 'react';
import { createStudentCourse } from '../firebase';

export default function AddPlaylist({ userId, onCourseAdded }) {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!url.trim()) return;

        setLoading(true);
        setError('');

        try {
            const course = await createStudentCourse(userId, url);
            setUrl('');
            if (onCourseAdded) onCourseAdded(course);
        } catch (err) {
            setError(err.message || 'Failed to add playlist');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-playlist">
            <h3 className="add-playlist-title">Add YouTube Playlist</h3>
            <form onSubmit={handleSubmit} className="add-playlist-form">
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Paste YouTube playlist URL..."
                    className="add-playlist-input"
                    disabled={loading}
                />
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Adding...' : 'Add Playlist'}
                </button>
            </form>
            {error && <p className="add-playlist-error">{error}</p>}
            <p className="add-playlist-hint">
                Example: https://www.youtube.com/playlist?list=PLxxxxxx
            </p>
        </div>
    );
}
