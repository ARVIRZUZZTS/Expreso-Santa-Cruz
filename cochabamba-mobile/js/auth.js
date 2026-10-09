import { login, logout, isAuthenticated, getUsuario } from './api.js';

function initAuth() {
    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutBtn');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    updateUI();
}

async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('loginError');
    const submitBtn = document.getElementById('loginBtn');

    if (!email || !password) {
        showError('Por favor complete todos los campos');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Ingresando...';
    hideError();

    try {
        await login(email, password);
        window.location.href = 'menu.html';
    } catch (error) {
        showError(error.message || 'Error al iniciar sesión');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Ingresar';
    }
}

async function handleLogout() {
    try {
        await logout();
    } catch (e) {
        console.error(e);
    }
    window.location.href = 'index.html';
}

function showError(message) {
    const errorEl = document.getElementById('loginError');
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.style.display = 'block';
    }
}

function hideError() {
    const errorEl = document.getElementById('loginError');
    if (errorEl) {
        errorEl.style.display = 'none';
    }
}

function updateUI() {
    const user = getUsuario();
    const userNameEl = document.getElementById('userName');
    const userAvatarEl = document.getElementById('userAvatar');

    if (user) {
        if (userNameEl) {
            userNameEl.textContent = user.email || user.user_metadata?.nombre || 'Usuario';
        }
        if (userAvatarEl) {
            const initial = (user.email || 'U').charAt(0).toUpperCase();
            userAvatarEl.textContent = initial;
        }
    }
}

function checkAuth() {
    if (!isAuthenticated()) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

function getUser() {
    return getUsuario();
}

export {
    initAuth,
    handleLogin,
    handleLogout,
    checkAuth,
    getUser
};
