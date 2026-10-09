import BottomNav from './BottomNav';

function Perfil({ user, onLogout, onBack, onNavigate }) {
    const handleLogout = () => {
        localStorage.removeItem('user');
        onLogout();
    };

    return (
        <div className="bg-perfil overlay">
            <header className="header">
                <button className="btn btn-outline btn-sm header-back" onClick={() => onBack('menu')}>&lt;</button>
                <img src="/images/logoX.png" alt="Expreso Santa Cruz" className="header-logo" />
                <div style={{ width: '44px' }}></div>
            </header>

            <main className="app">
                <div className="container">
                    <div className="perfil-container">
                        <div className="perfil-avatar">
                            <div className="avatar avatar-lg">
                                {(user?.nombre || 'U').charAt(0).toUpperCase()}
                            </div>
                        </div>
                        <div className="perfil-name">{user?.nombre || 'Usuario'}</div>
                        <div className="perfil-email">{user?.email || 'email@example.com'}</div>

                        <div className="perfil-card">
                            <div className="list-item">
                                <div className="list-item-icon">👤</div>
                                <div className="list-item-content">
                                    <div className="list-item-title">Rol</div>
                                    <div className="list-item-subtitle">{user?.rol || 'Operador'}</div>
                                </div>
                            </div>
                            <div className="list-item">
                                <div className="list-item-icon">📱</div>
                                <div className="list-item-content">
                                    <div className="list-item-title">App Móvil</div>
                                    <div className="list-item-subtitle">Versión 1.0.0</div>
                                </div>
                            </div>
                        </div>

                        <button className="btn btn-primary btn-block btn-lg mt-2" onClick={() => onNavigate('encomienda')}>
                            Nueva Encomienda
                        </button>

                        <button className="btn btn-danger btn-block btn-lg mt-2" onClick={handleLogout}>
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </main>

            <BottomNav currentView="perfil" onNavigate={onNavigate} />
        </div>
    );
}

export default Perfil;
