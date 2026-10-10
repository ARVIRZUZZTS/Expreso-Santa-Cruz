const USER_KEY = 'user';

function getCurrentUser() {
    try {
        const saved = localStorage.getItem(USER_KEY);
        return saved ? JSON.parse(saved) : null;
    } catch {
        return null;
    }
}

function saveUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearUser() {
    localStorage.removeItem(USER_KEY);
}

export {
    getCurrentUser,
    saveUser,
    clearUser
};