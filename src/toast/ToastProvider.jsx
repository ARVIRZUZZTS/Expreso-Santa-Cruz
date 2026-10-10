import { createContext, useCallback, useContext, useRef, useState } from 'react';

const ToastContext = createContext(null);

function ToastProvider({ children }) {
    const [toast, setToast] = useState(null);
    const timer = useRef(null);

    const showToast = useCallback((message, type = 'success') => {
        if (timer.current) {
            clearTimeout(timer.current);
        }
        setToast({ message, type });
        timer.current = setTimeout(() => setToast(null), 3000);
    }, []);

    return (
        <ToastContext.Provider value={showToast}>
            {children}
            {toast && (
                <div className={`toast toast-${toast.type} show`}>
                    {toast.message}
                </div>
            )}
        </ToastContext.Provider>
    );
}

function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast debe usarse dentro de ToastProvider');
    }
    return context;
}

export {
    ToastProvider,
    useToast
};