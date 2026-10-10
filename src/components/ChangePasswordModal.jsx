import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../toast/ToastProvider';
import { cambiarContrasena } from '../modules/encomiendas/services/encomiendasService';

const MIN_LENGTH = 6;

function ChangePasswordModal({ open, blocking = false, onClose }) {
    const { user, updateUser, logout } = useAuth();
    const showToast = useToast();
    const navigate = useNavigate();
    const [nueva, setNueva] = useState('');
    const [confirmacion, setConfirmacion] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!open || !user) {
        return null;
    }

    const handleClose = () => {
        if (!blocking && onClose) {
            onClose();
        }
    };

    const handleOverlayClick = () => {
        if (!blocking) {
            handleClose();
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!nueva || !confirmacion) {
            setError('Por favor complete todos los campos');
            return;
        }
        if (nueva.length < MIN_LENGTH) {
            setError(`La contraseña debe tener al menos ${MIN_LENGTH} caracteres`);
            return;
        }
        if (nueva !== confirmacion) {
            setError('Las contraseñas no coinciden');
            return;
        }

        setLoading(true);
        try {
            const updated = await cambiarContrasena(user.id_usuario, nueva);
            updateUser(updated);
            showToast('Contraseña actualizada correctamente');
            setNueva('');
            setConfirmacion('');
            if (!blocking && onClose) {
                onClose();
            }
        } catch (err) {
            setError(err.message || 'Error al cambiar la contraseña');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">Cambiar Contraseña</h3>
                    {!blocking && (
                        <button type="button" className="modal-close" onClick={handleClose}>&times;</button>
                    )}
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <p className="modal-body-text">
                            {blocking
                                ? 'Por seguridad, debe cambiar la contraseña asignada por el administrador antes de continuar.'
                                : 'Ingrese su nueva contraseña.'}
                        </p>
                        <div className="form-group">
                            <label className="form-label" htmlFor="nuevaContrasena">Nueva Contraseña</label>
                            <input
                                type="password"
                                className="form-input"
                                id="nuevaContrasena"
                                placeholder="••••••••"
                                value={nueva}
                                onChange={(e) => setNueva(e.target.value)}
                                autoComplete="new-password"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="confirmarContrasena">Confirmar Contraseña</label>
                            <input
                                type="password"
                                className="form-input"
                                id="confirmarContrasena"
                                placeholder="••••••••"
                                value={confirmacion}
                                onChange={(e) => setConfirmacion(e.target.value)}
                                autoComplete="new-password"
                                required
                            />
                        </div>
                        {error && <div className="form-error">{error}</div>}
                    </div>
                    <div className="modal-footer">
                        {blocking && (
                            <button type="button" className="btn btn-outline" onClick={handleLogout}>
                                Cerrar Sesión
                            </button>
                        )}
                        {!blocking && (
                            <button type="button" className="btn btn-cancel" onClick={handleClose}>
                                Cancelar
                            </button>
                        )}
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Guardando...' : 'Cambiar Contraseña'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ChangePasswordModal;