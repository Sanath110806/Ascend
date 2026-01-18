import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, seedSampleData, getOrCreateUser, getUserRole, setUserRole } from './firebase';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import MyCoursePlayer from './pages/MyCoursePlayer';
import Classrooms from './pages/Classrooms';
import ClassroomDetail from './pages/ClassroomDetail';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

function App() {
  const [user, setUser] = useState(null);
  const [userRole, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingRole, setPendingRole] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // If there's a pending role from login, save it
        if (pendingRole) {
          await setUserRole(currentUser.uid, pendingRole);
          setRole(pendingRole);
          setPendingRole(null);
        } else {
          // Get existing role
          const role = await getUserRole(currentUser.uid);
          setRole(role);
        }

        // Seed sample classroom data
        await seedSampleData();
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [pendingRole]);

  const handleRoleSelect = (role) => {
    setPendingRole(role);
  };

  if (loading) {
    return <div className="loading" style={{ minHeight: '100vh' }}>Loading...</div>;
  }

  // Determine home route based on role
  const getHomeRoute = () => {
    if (userRole === 'teacher') {
      return <Navigate to="/classrooms" replace />;
    }
    return <Dashboard user={user} />;
  };

  return (
    <BrowserRouter>
      {user && <Navbar user={user} userRole={userRole} />}
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <Login onRoleSelect={handleRoleSelect} />}
        />

        {/* Home - redirects teachers to classrooms */}
        <Route
          path="/"
          element={
            <ProtectedRoute user={user} loading={loading}>
              {getHomeRoute()}
            </ProtectedRoute>
          }
        />

        {/* Student-only routes */}
        <Route
          path="/courses"
          element={
            <ProtectedRoute user={user} loading={loading} requiredRole="student" userRole={userRole}>
              <Courses user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-course/:courseId"
          element={
            <ProtectedRoute user={user} loading={loading} requiredRole="student" userRole={userRole}>
              <MyCoursePlayer user={user} />
            </ProtectedRoute>
          }
        />

        {/* Shared routes */}
        <Route
          path="/classrooms"
          element={
            <ProtectedRoute user={user} loading={loading}>
              <Classrooms user={user} userRole={userRole} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/classroom/:classroomId"
          element={
            <ProtectedRoute user={user} loading={loading}>
              <ClassroomDetail user={user} userRole={userRole} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute user={user} loading={loading}>
              <Profile user={user} userRole={userRole} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute user={user} loading={loading}>
              <Settings user={user} userRole={userRole} />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
