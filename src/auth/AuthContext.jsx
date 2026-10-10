import { createContext, useContext, useState } from 'react';
import { getCurrentUser, saveUser, clearUser } from './authService';
import { clearEncomiendasCache } from '../modules/encomiendas/services/cacheService';

const AuthContext = createContext(null);

function AuthProvider({ children }) {
    const [user, setUser] = useState(getCurrentUser());

    const login = (userData) => {
        if (user && user.nombre !== userData.nombre) {
            clearEncomiendasCache();
        }
        saveUser(userData);
        setUser(userData);
    };

    const logout = () => {
        clearEncomiendasCache();
        clearUser();
        setUser(null);
    };

    const updateUser = (userData) => {
        saveUser(userData);
        setUser(userData);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de AuthProvider');
    }
    return context;
}

export {
    AuthProvider,
    useAuth
};