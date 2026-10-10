import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import BottomNav from './BottomNav';
import ChangePasswordModal from './ChangePasswordModal';

function Perfil() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [cambioAbierto, setCambioAbierto] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    return (
        <div className="bg-perfil overlay">
            <header className="header">
                <button className="btn btn-outline btn-sm header-back" onClick={() => navigate('/menu')}>&lt;</button>
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
                            <button type="button" className="list-item list-item-btn" onClick={() => setCambioAbierto(true)}>
                                <div className="list-item-icon">🔑</div>
                                <div className="list-item-content">
                                    <div className="list-item-title">Cambiar Contraseña</div>
                                    <div className="list-item-subtitle">Actualizar tu contraseña</div>
                                </div>
                                <div className="list-item-chevron">&rsaquo;</div>
                            </button>
                        </div>

                        <button className="btn btn-primary btn-block btn-lg mt-2" onClick={() => navigate('/encomienda')}>
                            Nueva Encomienda
                        </button>

                        <button className="btn btn-danger btn-block btn-lg mt-2" onClick={handleLogout}>
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </main>

            <BottomNav currentView="perfil" />
            <ChangePasswordModal open={cambioAbierto} onClose={() => setCambioAbierto(false)} />
        </div>
    );
}

export default Perfil;