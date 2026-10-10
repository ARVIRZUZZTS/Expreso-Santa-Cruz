import { Link, useNavigate } from 'react-router-dom';
import BottomNav from './BottomNav';

function Menu() {
    const navigate = useNavigate();

    return (
        <div className="bg-menu overlay">
            <header className="header">
                <button className="btn btn-outline btn-sm header-back" style={{border: '1px solid white', color: 'white'}} onClick={() => navigate('/menu')}>&lt;</button>
                <img src="/images/logoX.png" alt="Expreso Santa Cruz" className="header-logo" />
                <div style={{ width: '44px' }}></div>
            </header>

            <main className="app">
                <div className="container">
                    <div className="card">
                        <h3 className="card-title">¡Hola, Bienvenido!</h3>
                        <p className="text-center mb-2">
                            Bienvenido a la aplicación de Expresos Santa Cruz para registrar encomiendas
                        </p>
                    </div>

                    <div className="menu-grid">
                        <Link className="menu-item" to="/encomienda">
                            <div className="menu-item-icon">📦</div>
                            <div className="menu-item-title">Nueva Encomienda</div>
                        </Link>
                        <Link className="menu-item" to="/historial">
                            <div className="menu-item-icon">📋</div>
                            <div className="menu-item-title">Historial</div>
                        </Link>
                        <Link className="menu-item" to="/perfil">
                            <div className="menu-item-icon">👤</div>
                            <div className="menu-item-title">Mi Perfil</div>
                        </Link>
                    </div>
                </div>
            </main>

            <BottomNav currentView="menu" />
        </div>
    );
}

export default Menu;