export default function ClassroomCard({ classroom }) {
    return (
        <div className="classroom-card">
            <h3 className="classroom-card-subject">{classroom.subject}</h3>
            <p className="classroom-card-teacher">Instructor: {classroom.teacher}</p>

            {classroom.announcements?.length > 0 && (
                <>
                    <h4 className="classroom-section-title">Announcements</h4>
                    <ul className="announcement-list">
                        {classroom.announcements.slice(0, 3).map((announcement, index) => (
                            <li key={index} className="announcement-item">
                                {announcement}
                            </li>
                        ))}
                    </ul>
                </>
            )}

            {classroom.assignments?.length > 0 && (
                <>
                    <h4 className="classroom-section-title">Upcoming Assignments</h4>
                    <ul className="assignment-list">
                        {classroom.assignments.map((assignment, index) => (
                            <li key={index} className="assignment-item">
                                <span className="assignment-title">{assignment.title}</span>
                                <span className="assignment-due">Due: {assignment.dueDate}</span>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
}
