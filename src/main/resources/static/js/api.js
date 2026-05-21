/* ========================================================================
   API Client — handles JWT auth headers and base URL
   ======================================================================== */

const API = {
    baseUrl: '/api',

    getToken() {
        return localStorage.getItem('niveshai_token');
    },

    setToken(token) {
        localStorage.setItem('niveshai_token', token);
    },

    setUser(user) {
        localStorage.setItem('niveshai_user', JSON.stringify(user));
    },

    getUser() {
        const data = localStorage.getItem('niveshai_user');
        return data ? JSON.parse(data) : null;
    },

    clearAuth() {
        localStorage.removeItem('niveshai_token');
        localStorage.removeItem('niveshai_user');
    },

    isAuthenticated() {
        return !!this.getToken();
    },

    async request(endpoint, options = {}) {
        const url = this.baseUrl + endpoint;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            if (response.status === 401) {
                this.clearAuth();
                window.location.hash = '';
                Router.init();
                throw new Error('Session expired. Please login again.');
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Request failed');
            }

            return data;
        } catch (error) {
            if (error.message === 'Session expired. Please login again.') throw error;
            console.error('API Error:', error);
            throw error;
        }
    },

    get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    },

    post(endpoint, body) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body)
        });
    },

    put(endpoint, body) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
    },

    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
};
