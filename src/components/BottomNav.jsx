function BottomNav({ currentView, onNavigate }) {
    return (
        <nav className="bottom-nav">
            <button
                className={`bottom-nav-item ${currentView === 'historial' ? 'active' : ''}`}
                onClick={() => onNavigate('historial')}
            >
                <span className="bottom-nav-icon">📋</span>
                <span>Historial</span>
            </button>
            <button
                className={`bottom-nav-item bottom-nav-center ${currentView === 'encomienda' ? 'active' : ''}`}
                onClick={() => onNavigate('encomienda')}
            >
                <span className="bottom-nav-icon">📦</span>
                <span>Nueva</span>
            </button>
            <button
                className={`bottom-nav-item ${currentView === 'perfil' ? 'active' : ''}`}
                onClick={() => onNavigate('perfil')}
            >
                <span className="bottom-nav-icon">👤</span>
                <span>Perfil</span>
            </button>
        </nav>
    );
}

export default BottomNav;
