import { useState, useEffect } from 'react';
import './styles/variables.css';
import './styles/components.css';
import './styles/mobile.css';
import Login from './components/Login';
import Menu from './components/Menu';
import Perfil from './components/Perfil';
import EncomiendaForm from './modules/encomiendas/components/EncomiendaForm';
import HistorialEncomiendas from './modules/encomiendas/components/HistorialEncomiendas';
import { clearEncomiendasCache } from './modules/encomiendas/services/cacheService';

function App() {
    const [view, setView] = useState('login');
    const [user, setUser] = useState(null);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
            setView('menu');
        }
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleLogin = (userData) => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            const prevUser = JSON.parse(savedUser);
            if (prevUser.nombre !== userData.nombre) {
                clearEncomiendasCache();
            }
        }
        setUser(userData);
        setView('menu');
        showToast('Bienvenido, ' + (userData.nombre || 'Usuario'));
    };

    const handleLogout = () => {
        clearEncomiendasCache();
        setUser(null);
        setView('login');
    };

    const handleNavigate = (newView) => {
        setView(newView);
    };

    const handleSaveEncomienda = () => {
        showToast('Encomienda guardada correctamente');
        setView('historial');
    };

    const renderView = () => {
        switch (view) {
            case 'login':
                return <Login onLogin={handleLogin} />;
            case 'menu':
                return <Menu user={user} onNavigate={handleNavigate} />;
            case 'encomienda':
                return <EncomiendaForm onBack={handleNavigate} onSave={handleSaveEncomienda} user={user} />;
            case 'historial':
                return <HistorialEncomiendas onBack={handleNavigate} user={user} />;
            case 'perfil':
                return <Perfil user={user} onLogout={handleLogout} onBack={handleNavigate} onNavigate={handleNavigate} />;
            default:
                return <Menu user={user} onNavigate={handleNavigate} />;
        }
    };

    return (
        <>
            {renderView()}
            {toast && (
                <div className={`toast toast-${toast.type} show`}>
                    {toast.message}
                </div>
            )}
        </>
    );
}

export default App;
