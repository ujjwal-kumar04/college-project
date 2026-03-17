const isLocalHost = typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname);
const DEFAULT_BACKEND_URL = isLocalHost ? 'http://localhost:5001' : 'https://college-project-1-quch.onrender.com';

// API Configuration
export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || DEFAULT_BACKEND_URL;
export const API_BASE_URL = process.env.REACT_APP_API_URL || `${BACKEND_URL}/api`;

// For local development, you can create a .env.local file with:
// REACT_APP_API_URL=http://localhost:5001/api
// REACT_APP_BACKEND_URL=http://localhost:5001
