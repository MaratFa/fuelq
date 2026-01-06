// Authentication utilities for the FuelQ frontend

// Store JWT token in localStorage
const setToken = (token) => {
    localStorage.setItem('fuelq_token', token);
};

// Get JWT token from localStorage
const getToken = () => {
    return localStorage.getItem('fuelq_token');
};

// Remove JWT token from localStorage
const removeToken = () => {
    localStorage.removeItem('fuelq_token');
};

// Check if user is authenticated
const isAuthenticated = () => {
    const token = getToken();
    if (!token) return false;

    try {
        // Decode token to check expiration
        const payload = JSON.parse(atob(token.split('.')[1]));
        const now = Date.now() / 1000;
        return payload.exp > now;
    } catch (e) {
        return false;
    }
};

// Get current user info from token
const getCurrentUser = () => {
    const token = getToken();
    if (!token) return null;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload;
    } catch (e) {
        return null;
    }
};

// Register a new user
const register = async (userData) => {
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (response.ok) {
            setToken(data.token);
            return { success: true, user: data.user };
        } else {
            return { success: false, error: data.error };
        }
    } catch (error) {
        return { success: false, error: 'Network error' };
    }
};

// Login user
const login = async (username, password) => {
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            setToken(data.token);
            return { success: true, user: data.user };
        } else {
            return { success: false, error: data.error };
        }
    } catch (error) {
        return { success: false, error: 'Network error' };
    }
};

// Logout user
const logout = () => {
    removeToken();
    window.location.href = '/login.html';
};

// Make authenticated API request
const authFetch = async (url, options = {}) => {
    const token = getToken();

    if (!token) {
        throw new Error('Not authenticated');
    }

    const headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
    };

    return fetch(url, {
        ...options,
        headers
    });
};

export {
    setToken,
    getToken,
    removeToken,
    isAuthenticated,
    getCurrentUser,
    register,
    login,
    logout,
    authFetch
};
