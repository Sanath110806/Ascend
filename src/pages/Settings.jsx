export default function Settings({ user, userRole }) {
    return (
        <div className="container page">
            <h1 className="page-title">Settings</h1>

            <div className="card" style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '16px' }}>Account Settings</h3>

                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                        Display Name
                    </label>
                    <input
                        type="text"
                        value={user?.displayName || ''}
                        disabled
                        style={{ opacity: 0.7 }}
                    />
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Managed by your Google account
                    </p>
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                        Email
                    </label>
                    <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        style={{ opacity: 0.7 }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                        Role
                    </label>
                    <div className={`role-badge ${userRole}`} style={{ display: 'inline-block' }}>
                        {userRole}
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Role is set during first login
                    </p>
                </div>
            </div>

            <div className="card">
                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '16px' }}>Preferences</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    More settings coming soon...
                </p>
            </div>
        </div>
    );
}
