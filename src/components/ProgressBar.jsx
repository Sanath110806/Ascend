export default function ProgressBar({ value, max = 100, showText = true }) {
    const percentage = Math.round((value / max) * 100);

    return (
        <div>
            <div className="progress-bar">
                <div
                    className="progress-bar-fill"
                    style={{ width: `${percentage}%` }}
                />
            </div>
            {showText && (
                <div className="progress-text">{percentage}% complete</div>
            )}
        </div>
    );
}
