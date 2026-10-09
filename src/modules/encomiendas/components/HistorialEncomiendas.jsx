import { useState, useEffect } from 'react';
import { getEncomiendas } from '../services/encomiendasService';
import { getCachedEncomiendas, setCachedEncomiendas, clearEncomiendasCache } from '../services/cacheService';
import BottomNav from '../../../components/BottomNav';

function HistorialEncomiendas({ onBack, user }) {
    const [encomiendas, setEncomiendas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadEncomiendas();
    }, []);

    const loadEncomiendas = async (forceRefresh = false) => {
        if (!forceRefresh) {
            const cached = getCachedEncomiendas();
            if (cached) {
                setEncomiendas(cached);
                setLoading(false);
                return;
            }
        }

        setRefreshing(true);
        try {
            const data = await getEncomiendas(1, user?.nombre);
            setEncomiendas(data);
            setCachedEncomiendas(data);
        } catch (error) {
            console.error('Error loading encomiendas:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        clearEncomiendasCache();
        loadEncomiendas(true);
    };

    const getEstadoClass = (estado) => {
        switch (estado) {
            case 1: return 'badge-cancelado';
            case 2: return 'badge-por-pagar';
            case 3: return 'badge-primer-tramo';
            case 4: return 'badge-segundo-tramo';
            default: return 'badge-info';
        }
    };

    const getEstadoTexto = (estado) => {
        switch (estado) {
            case 1: return 'Cancelado';
            case 2: return 'Por Pagar';
            case 3: return 'Primer Tramo';
            case 4: return 'Segundo Tramo';
            default: return 'Desconocido';
        }
    };

    if (loading) {
        return (
            <div className="bg-historial overlay">
                <header className="header">
                    <button className="btn btn-outline btn-sm header-back" onClick={() => onBack('menu')}>&lt;</button>
                    <img src="/images/logoX.png" alt="Expreso Santa Cruz" className="header-logo" />
                    <button className="btn btn-outline btn-sm header-back" onClick={handleRefresh} disabled={refreshing}>
                        ↻
                    </button>
                </header>
                <main className="app">
                    <div className="container">
                        <div className="loading">
                            <div className="spinner"></div>
                        </div>
                    </div>
                </main>
                <BottomNav currentView="historial" onNavigate={onBack} />
            </div>
        );
    }

    return (
        <div className="bg-historial overlay">
            <header className="header">
                <button className="btn btn-outline btn-sm header-back" onClick={() => onBack('menu')}>&lt;</button>
                <img src="/images/logoX.png" alt="Expreso Santa Cruz" className="header-logo" />
                <button className="btn btn-outline btn-sm header-back" onClick={handleRefresh} disabled={refreshing}>
                    ↻
                </button>
            </header>

            <main className="app">
                <div className="container">
                    {encomiendas.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">📭</div>
                            <div className="empty-state-title">Sin encomiendas</div>
                            <div className="empty-state-text">No hay encomiendas registradas</div>
                        </div>
                    ) : (
                        <div className="historial-list">
                            {encomiendas.map(enc => (
                                <div key={enc.id} className="historial-card">
                                    <div className="historial-card-header">
                                        <span className="historial-card-title">#{enc.id} - {enc.remitente}</span>
                                        <span className={`badge ${getEstadoClass(enc.estadopaga)}`}>
                                            {getEstadoTexto(enc.estadopaga)}
                                        </span>
                                    </div>
                                    <div className="historial-card-body">
                                        <div className="historial-card-row">
                                            <span className="historial-card-label">Remitente:</span>
                                            <span className="historial-card-value">{enc.remitente}</span>
                                        </div>
                                        <div className="historial-card-row">
                                            <span className="historial-card-label">Consignatario:</span>
                                            <span className="historial-card-value">{enc.consignatario}</span>
                                        </div>
                                        <div className="historial-card-row">
                                            <span className="historial-card-label">Destino:</span>
                                            <span className="historial-card-value">{enc.destino}</span>
                                        </div>
                                        <div className="historial-card-row">
                                            <span className="historial-card-label">Contenido:</span>
                                            <span className="historial-card-value">{enc.bulto || '-'}</span>
                                        </div>
                                        <div className="historial-card-row">
                                            <span className="historial-card-label">Total:</span>
                                            <span className="historial-card-value">Bs {parseFloat(enc.total).toFixed(2)}</span>
                                        </div>
                                        <div className="historial-card-row">
                                            <span className="historial-card-label">Tipo Pago:</span>
                                            <span className="historial-card-value">{enc.tipo_pago || 'efectivo'}</span>
                                        </div>
                                        <div className="historial-card-row">
                                            <span className="historial-card-label">Registrador:</span>
                                            <span className="historial-card-value">{enc.registrador || '-'}</span>
                                        </div>
                                        <div className="historial-card-row">
                                            <span className="historial-card-label">Fecha:</span>
                                            <span className="historial-card-value">
                                                {new Date(enc.fecha).toLocaleDateString('es-ES')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <BottomNav currentView="historial" onNavigate={onBack} />
        </div>
    );
}

export default HistorialEncomiendas;
