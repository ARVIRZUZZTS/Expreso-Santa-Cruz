import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../toast/ToastProvider';
import { loginUsuario } from '../modules/encomiendas/services/encomiendasService';

function Login() {
    const { login } = useAuth();
    const showToast = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    const [nombre, setNombre] = useState('');
    const [contraseña, setContraseña] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!nombre || !contraseña) {
            setError('Por favor complete todos los campos');
            return;
        }

        setLoading(true);

        try {
            const user = await loginUsuario(nombre, contraseña);
            login(user);
            const from = location.state?.from?.pathname || '/menu';
            navigate(from, { replace: true });
            showToast('Bienvenido, ' + (user.nombre || 'Usuario'));
        } catch (err) {
            setError(err.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-logo-container">
                <img src="/images/logoX.png" alt="Expreso Santa Cruz" className="login-logo" />
            </div>
            <div className="login-card">
                <h1 className="login-title">Expreso Santa Cruz</h1>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="nombre">Nombre de Usuario</label>
                        <input
                            type="text"
                            className="form-input"
                            id="nombre"
                            placeholder="Tu nombre de usuario"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            required
                            autoComplete="username"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="contraseña">Contraseña</label>
                        <input
                            type="password"
                            className="form-input"
                            id="contraseña"
                            placeholder="••••••••"
                            value={contraseña}
                            onChange={(e) => setContraseña(e.target.value)}
                            required
                            autoComplete="current-password"
                        />
                    </div>
                    {error && <div className="form-error">{error}</div>}
                    <button
                        type="submit"
                        className="btn btn-primary btn-block btn-lg mt-2"
                        disabled={loading}
                    >
                        {loading ? 'Ingresando...' : 'Ingresar'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;
