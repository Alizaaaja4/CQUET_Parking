// PARK-IQ-CENTRAL-FE/app/api/axiosInstance.ts
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 🔥 This is critical if using cookies or `supports_credentials`
});

// This is the request interceptor that adds the Authorization header
axiosInstance.interceptors.request.use((config) => {
  const publicPaths = ['/users/login', '/users/register'];
  const isPublic = publicPaths.some(path => config.url?.includes(path));

  if (!isPublic) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn('No auth token for protected route:', config.url);
    }

    config.headers['Cache-Control'] = 'no-cache'; // 👈 prevent caching
  }

  return config;
}, (error) => Promise.reject(error));



// Response Interceptor: Handle global errors and authentication redirects
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if the error is 401 (Unauthorized) or 403 (Forbidden)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.error('Authentication/Authorization error:', error.response.status, error.response.data);

      // --- CRITICAL CHANGE HERE ---
      // Check if the current path is NOT the login page
      const currentPath = window.location.pathname;
      if (currentPath !== '/login') { // Only redirect if not already on login page
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('username');
        // window.location.href = '/login'; // Force full page reload and redirect
      }
      // Else: If we are already on the login page, just let the error propagate
      // so that the specific login component can display its own error message (Alert/message.error)
    }
    return Promise.reject(error); // Re-throw the error for component-specific handling
  }
);

export default axiosInstance;