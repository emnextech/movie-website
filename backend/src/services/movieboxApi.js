import axios from 'axios';

const BASE_URL = process.env.MOVIEBOX_API_HOST || 'https://h5.aoneroom.com';

// Default headers for Moviebox API requests
const getDefaultHeaders = (referer = null) => {
  const headers = {
    'Accept': 'application/json',
    'Accept-Language': 'en-US,en;q=0.5',
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:137.0) Gecko/20100101 Firefox/137.0',
    'X-Client-Info': JSON.stringify({ timezone: 'Africa/Nairobi' }),
  };

  if (referer) {
    headers['Referer'] = referer;
  } else {
    headers['Referer'] = `${BASE_URL}/`;
  }

  return headers;
};

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: getDefaultHeaders(),
});

// Request interceptor to add headers dynamically
apiClient.interceptors.request.use(
  (config) => {
    // Merge custom headers with defaults
    config.headers = {
      ...getDefaultHeaders(config.referer || null),
      ...config.headers,
    };
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      const errorMessage = error.response.data?.message || error.response.statusText;
      const statusCode = error.response.status;
      const customError = new Error(errorMessage);
      customError.statusCode = statusCode;
      return Promise.reject(customError);
    } else if (error.request) {
      // Request made but no response received
      const customError = new Error('No response from Moviebox API');
      customError.statusCode = 503;
      return Promise.reject(customError);
    } else {
      // Error in request setup
      return Promise.reject(error);
    }
  }
);

/**
 * Make a GET request to Moviebox API
 * @param {string} endpoint - API endpoint (e.g., '/wefeed-h5-bff/web/home')
 * @param {object} params - Query parameters
 * @param {string} referer - Optional referer URL
 * @returns {Promise} Axios response
 */
export const get = async (endpoint, params = {}, referer = null) => {
  try {
    const response = await apiClient.get(endpoint, {
      params,
      headers: referer ? { Referer: referer } : {},
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Make a POST request to Moviebox API
 * @param {string} endpoint - API endpoint
 * @param {object} data - Request body
 * @param {string} referer - Optional referer URL
 * @returns {Promise} Axios response
 */
export const post = async (endpoint, data = {}, referer = null) => {
  try {
    const response = await apiClient.post(endpoint, data, {
      headers: referer ? { Referer: referer } : {},
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch HTML content (for movie detail pages)
 * @param {string} endpoint - HTML endpoint
 * @returns {Promise} Axios response with HTML
 */
export const getHTML = async (endpoint) => {
  try {
    const response = await axios.get(`${BASE_URL}${endpoint}`, {
      headers: getDefaultHeaders(),
      responseType: 'text',
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Stream file for download
 * @param {string} url - Direct file URL
 * @returns {Promise} Axios response with stream
 */
export const streamFile = async (url) => {
  try {
    const response = await axios.get(url, {
      responseType: 'stream',
      headers: getDefaultHeaders(),
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export { BASE_URL };

export default {
  get,
  post,
  getHTML,
  streamFile,
  BASE_URL,
};

