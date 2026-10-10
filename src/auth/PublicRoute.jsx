import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

function PublicRoute() {
    const { user } = useAuth();

    if (user) {
        return <Navigate to="/menu" replace />;
    }

    return <Outlet />;
}

export default PublicRoute;