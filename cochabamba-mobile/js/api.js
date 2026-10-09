const API_BASE_URL = 'https://mxonuyelhoxenasrtvpf.supabase.co/rest/v1';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14b251eWVsaG94ZW5hc3J0dnBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0OTE5MjAsImV4cCI6MjA5ODA2NzkyMH0.8p8xUBC57FK-SPATZht4RdJ-1_cwEJWCUdMa2WB7xco';

let authToken = null;

function initApi() {
    authToken = localStorage.getItem('auth_token');
}

function getHeaders() {
    const headers = {
        'apikey': SUPABASE_KEY,
        'Content-Type': 'application/json'
    };
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }
    return headers;
}

async function apiRequest(endpoint, method = 'GET', data = null) {
    const url = `${API_BASE_URL}${endpoint}`;
    const options = {
        method,
        headers: getHeaders()
    };
    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `HTTP ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

async function login(email, password) {
    const url = 'https://mxonuyelhoxenasrtvpf.supabase.co/auth/v1/token?grant_type=password';
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'apikey': SUPABASE_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error_description || 'Login failed');
    }

    const data = await response.json();
    authToken = data.access_token;
    localStorage.setItem('auth_token', authToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
}

async function logout() {
    authToken = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
}

async function getEncomiendas(fecha, registrador) {
    const params = new URLSearchParams({
        fecha: `eq.${fecha}`,
        registrador: `eq.${registrador}`,
        order: 'creado.desc'
    });
    return apiRequest(`/encomiendamovil?${params}`);
}

async function createEncomienda(data) {
    return apiRequest('/encomiendamovil', 'POST', data);
}

async function getZonas() {
    return apiRequest('/zonas?select=*');
}

async function getViajes(fecha) {
    const params = new URLSearchParams({
        fecha: `eq.${fecha}`,
        select: 'viajeCod,placa,destino,hora'
    });
    return apiRequest(`/viajebodega?${params}`);
}

async function getUsuario() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

function isAuthenticated() {
    return !!authToken;
}

function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

function handleApiError(error, customMessage = 'Error en la operación') {
    console.error(error);
    showToast(error.message || customMessage, 'error');
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = `toast toast-${type} show`;
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

function formatCurrency(amount) {
    return `Bs ${parseFloat(amount).toFixed(2)}`;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

export {
    initApi,
    apiRequest,
    login,
    logout,
    getEncomiendas,
    createEncomienda,
    getZonas,
    getViajes,
    getUsuario,
    isAuthenticated,
    requireAuth,
    handleApiError,
    showToast,
    formatDate,
    formatCurrency,
    debounce,
    generateId,
    escapeHtml
};
