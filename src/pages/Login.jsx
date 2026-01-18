import { useState } from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function Login({ onRoleSelect }) {
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
    };

    const handleGoogleSignIn = async () => {
        if (!selectedRole) {
            setError('Please select a role first');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await signInWithPopup(auth, googleProvider);
            if (onRoleSelect) {
                onRoleSelect(selectedRole);
            }
            if (selectedRole === 'teacher') {
                navigate('/classrooms');
            } else {
                navigate('/');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('Failed to sign in. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-branding">
                    <img src="/favicon.png" alt="Ascend" className="login-logo-image" />
                    <h1 className="login-logo">Ascend</h1>
                </div>

                <div className="role-selection">
                    <div className="role-buttons">
                        <button
                            className={`role-button ${selectedRole === 'student' ? 'selected' : ''}`}
                            onClick={() => handleRoleSelect('student')}
                        >
                            Student
                        </button>
                        <button
                            className={`role-button ${selectedRole === 'teacher' ? 'selected' : ''}`}
                            onClick={() => handleRoleSelect('teacher')}
                        >
                            Teacher
                        </button>
                    </div>
                </div>

                {error && <p className="login-error">{error}</p>}

                <button
                    onClick={handleGoogleSignIn}
                    className={`btn btn-google ${!selectedRole ? 'disabled' : ''}`}
                    disabled={loading || !selectedRole}
                >
                    <img
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                        alt="Google"
                    />
                    {loading ? 'Signing in...' : 'Continue with Google'}
                </button>
            </div>
        </div>
    );
}
