// PARK-IQ-CENTRAL-FE/app/api/axiosInstance.ts
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  const publicPaths = ['/users/login', '/users/register'];
  const requestUrl = config.url || '';

  const isPublic = publicPaths.some(path => requestUrl.startsWith(path));

  console.groupCollapsed(`Axios Request Interceptor: ${config.method?.toUpperCase()} ${requestUrl}`);
  console.log('Is public path:', isPublic);

  if (!isPublic) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

    // 🔥🔥 CRITICAL LOG HERE 🔥🔥
    console.log('Token retrieved from localStorage by interceptor:', token);
    if (!token) {
        console.warn(`CRITICAL: No auth token found for protected route: ${requestUrl}. This request will likely fail with 401.`);
    }

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('Authorization header set.'); // Confirm header is being added
    } else {
      // If token is missing, consider explicitly aborting the request to prevent unnecessary 401s
      // return Promise.reject(new axios.Cancel('Authentication token missing. Request aborted.'));
    }

    config.headers['Cache-Control'] = 'no-cache';
  }
  console.groupEnd();
  return config;
}, (error) => Promise.reject(error));


axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // --- NEW LOGS HERE ---
    console.groupCollapsed(`Axios Response Interceptor: Error ${error.response?.status} for ${error.config?.url}`);
    console.error('Authentication/Authorization error from API:', error.response?.status, error.response?.data);
    // --- END NEW LOGS ---

    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      const currentPath = window.location.pathname;
      if (currentPath !== '/login') {
        console.log('Redirecting to login due to 401/403...');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('username');
        window.location.href = '/login';
      } else {
        console.log('Already on login page, not redirecting.');
      }
    }
    console.groupEnd(); // End the group
    return Promise.reject(error);
  }
);

export default axiosInstance;