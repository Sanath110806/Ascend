import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import NotificationBell from './NotificationBell';

export default function Navbar({ user, userRole }) {
    const location = useLocation();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const isActive = (path) => location.pathname === path ? 'active' : '';

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <nav className="navbar">
            <div className="navbar-content">
                <Link to={userRole === 'teacher' ? '/classrooms' : '/'} className="navbar-brand">
                    <img src="/favicon.png" alt="" className="navbar-logo" />
                    Ascend
                </Link>

                <div className="navbar-links">
                    {userRole === 'student' && (
                        <>
                            <Link to="/" className={isActive('/')}>Home</Link>
                            <Link to="/courses" className={isActive('/courses')}>My Courses</Link>
                            <Link to="/classrooms" className={isActive('/classrooms')}>Classrooms</Link>
                        </>
                    )}
                    {userRole === 'teacher' && (
                        <Link to="/classrooms" className={isActive('/classrooms')}>My Classrooms</Link>
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {/* Notification Bell - Students only */}
                    {userRole === 'student' && (
                        <NotificationBell userId={user.uid} />
                    )}

                    {/* Profile Dropdown */}
                    <div className="profile-dropdown" ref={dropdownRef}>
                        <button
                            className="profile-dropdown-trigger"
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                        >
                            <img
                                src={user?.photoURL || 'https://via.placeholder.com/32'}
                                alt=""
                                className="navbar-avatar"
                            />
                            <span className="dropdown-arrow">{dropdownOpen ? '▲' : '▼'}</span>
                        </button>

                        {dropdownOpen && (
                            <div className="profile-dropdown-menu">
                                <div className="dropdown-header">
                                    <strong>{user?.displayName || 'User'}</strong>
                                    <span>{user?.email}</span>
                                </div>
                                <div className="dropdown-divider"></div>
                                <Link
                                    to="/profile"
                                    className="dropdown-item"
                                    onClick={() => setDropdownOpen(false)}
                                >
                                    View Profile
                                </Link>
                                <Link
                                    to="/profile?edit=true"
                                    className="dropdown-item"
                                    onClick={() => setDropdownOpen(false)}
                                >
                                    Edit Profile
                                </Link>
                                <Link
                                    to="/settings"
                                    className="dropdown-item"
                                    onClick={() => setDropdownOpen(false)}
                                >
                                    Settings
                                </Link>
                                <div className="dropdown-divider"></div>
                                <button onClick={handleLogout} className="dropdown-item logout">
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
