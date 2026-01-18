import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ user, loading, children, requiredRole, userRole }) {
    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Check role-based access
    if (requiredRole && userRole && requiredRole !== userRole) {
        // Redirect to appropriate page based on actual role
        if (userRole === 'teacher') {
            return <Navigate to="/classrooms" replace />;
        }
        return <Navigate to="/" replace />;
    }

    return children;
}
