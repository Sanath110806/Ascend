import { useState, useEffect } from 'react';
import { getUserActivityLogs } from '../firebase';

export default function ActivityHeatmap({ userId }) {
    const [activityData, setActivityData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchActivity() {
            const logs = await getUserActivityLogs(userId);
            setActivityData(logs);
            setLoading(false);
        }
        fetchActivity();
    }, [userId]);

    // Generate full year (365 days)
    const generateDays = () => {
        const days = [];
        const today = new Date();

        for (let i = 364; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            days.push({
                date: dateStr,
                count: activityData[dateStr] || 0
            });
        }

        return days;
    };

    // Activity level based on watch count
    const getLevel = (count) => {
        if (count === 0) return 0;
        if (count === 1) return 1;
        if (count <= 3) return 2;
        return 3; // 4+ watches
    };

    // Group days by week for grid layout
    const getWeeks = () => {
        const days = generateDays();
        const weeks = [];

        for (let i = 0; i < days.length; i += 7) {
            weeks.push(days.slice(i, i + 7));
        }

        return weeks;
    };

    const weeks = getWeeks();

    if (loading) {
        return <div className="activity-heatmap"><div className="loading">Loading...</div></div>;
    }

    return (
        <div className="activity-heatmap">
            <h3 className="heatmap-title">STUDY RHYTHM</h3>

            <div className="heatmap-container">
                <div className="heatmap-grid-year">
                    {weeks.map((week, weekIndex) => (
                        <div key={weekIndex} className="heatmap-week">
                            {week.map((day) => (
                                <div
                                    key={day.date}
                                    className={`heatmap-cell level-${getLevel(day.count)}`}
                                    title={`${day.date}: ${day.count} ${day.count === 1 ? 'video' : 'videos'}`}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
