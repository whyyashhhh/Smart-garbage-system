import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL;
const isProduction = import.meta.env.PROD;
const isLocalApiUrl = typeof rawApiUrl === 'string' && /localhost|127\.0\.0\.1/i.test(rawApiUrl);

export const API_BASE_URL = isProduction && isLocalApiUrl
    ? '/api'
    : (rawApiUrl || '/api');

export const UPLOADS_BASE_URL = (() => {
    if (import.meta.env.VITE_UPLOADS_URL) {
        return import.meta.env.VITE_UPLOADS_URL;
    }

    if (API_BASE_URL.startsWith('http')) {
        try {
            return `${new URL(API_BASE_URL).origin}/uploads`;
        } catch (error) {
            return '/uploads';
        }
    }

    return '/uploads';
})();

// Create axios instance with base URL
const API = axios.create({
    baseURL: API_BASE_URL
});

// Add token to all requests if it exists
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle response errors
API.interceptors.response.use(
    (response) => response,
    (error) => {
        // If token is invalid, clear it and redirect to login
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default API;
