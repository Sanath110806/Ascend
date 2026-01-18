export default function LessonItem({ lesson, isActive, isCompleted, onClick, onToggleComplete }) {
    const handleCheckboxClick = (e) => {
        e.stopPropagation();
        onToggleComplete(lesson.id, !isCompleted);
    };

    return (
        <li
            className={`lesson-item ${isActive ? 'active' : ''}`}
            onClick={() => onClick(lesson)}
        >
            <div
                className={`lesson-checkbox ${isCompleted ? 'completed' : ''}`}
                onClick={handleCheckboxClick}
            >
                {isCompleted && '✓'}
            </div>
            <span className="lesson-title">{lesson.title}</span>
        </li>
    );
}
