import axios from 'axios';
import https from 'https';

const BASE_URL = process.env.MOVIEBOX_API_HOST || 'https://h5.aoneroom.com';
const MOVIEBOX_HOST = process.env.MOVIEBOX_HOST || 'h5.aoneroom.com';

// Create HTTPS agent that bypasses SSL certificate validation for CDN downloads
// This is needed because the CDN uses a shared certificate (*.edgenext.com) 
// that doesn't match the hostname (h5.aoneroom.com)
const httpsAgent = new https.Agent({
  rejectUnauthorized: false, // Bypass SSL certificate validation for CDN downloads
});

// Cookie storage
let sessionCookies = {};

// Default headers for Moviebox API requests
const getDefaultHeaders = (referer = null) => {
  const headers = {
    'X-Client-Info': JSON.stringify({ timezone: 'Africa/Nairobi' }),
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept': 'application/json',
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:137.0) Gecko/20100101 Firefox/137.0',
    'Referer': referer || `${BASE_URL}/`,
    'Host': MOVIEBOX_HOST,
  };

  // Add cookies if available
  if (sessionCookies.account) {
    headers['Cookie'] = `account=${sessionCookies.account}`;
  }

  return headers;
};

// Headers for download requests
const getDownloadHeaders = (referer = null) => {
  return {
    'Accept': '*/*',
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:137.0) Gecko/20100101 Firefox/137.0',
    'Origin': BASE_URL,
    'Referer': referer || 'https://fmoviesunblocked.net/',
    ...(sessionCookies.account && { 'Cookie': `account=${sessionCookies.account}` }),
  };
};

// Extract and store cookies from response
const extractCookies = (response) => {
  const setCookieHeaders = response.headers['set-cookie'] || [];
  setCookieHeaders.forEach(cookie => {
    const match = cookie.match(/([^=]+)=([^;]+)/);
    if (match) {
      sessionCookies[match[1]] = match[2];
    }
  });
};

// Initialize cookies by making a request to get-latest-app-pkgs
const initializeCookies = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/wefeed-h5-bff/app/get-latest-app-pkgs?app_name=moviebox`, {
      headers: getDefaultHeaders(),
    });
    extractCookies(response);
    console.log('Cookies initialized successfully');
  } catch (error) {
    console.error('Failed to initialize cookies:', error.message);
  }
};

// Initialize cookies on module load
initializeCookies();

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

// Request interceptor to add headers dynamically and handle cookies
apiClient.interceptors.request.use(
  (config) => {
    // Merge custom headers with defaults
    const defaultHeaders = getDefaultHeaders(config.referer || null);
    config.headers = {
      ...defaultHeaders,
      ...config.headers,
    };
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and cookie extraction
apiClient.interceptors.response.use(
  (response) => {
    // Extract and store cookies from response
    extractCookies(response);
    return response;
  },
  (error) => {
    // Extract cookies even from error responses
    if (error.response) {
      extractCookies(error.response);
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
 * @param {boolean} useDownloadHeaders - Whether to use download-specific headers
 * @returns {Promise} Axios response
 */
export const get = async (endpoint, params = {}, referer = null, useDownloadHeaders = false) => {
  try {
    const headers = useDownloadHeaders 
      ? getDownloadHeaders(referer)
      : getDefaultHeaders(referer);
    
    const response = await apiClient.get(endpoint, {
      params,
      headers,
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
    const headers = {
      ...getDefaultHeaders(referer),
      'Content-Type': 'application/json',
    };
    
    const response = await apiClient.post(endpoint, data, {
      headers,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch HTML content (for movie detail pages)
 * @param {string} endpoint - HTML endpoint
 * @param {string} referer - Optional referer URL
 * @returns {Promise} Axios response with HTML
 */
export const getHTML = async (endpoint, referer = null) => {
  try {
    const response = await axios.get(`${BASE_URL}${endpoint}`, {
      headers: getDefaultHeaders(referer),
      responseType: 'text',
    });
    extractCookies(response);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Stream file for download
 * @param {string} url - Direct file URL
 * @param {object} options - Optional options (e.g., range header for partial downloads)
 * @returns {Promise} Axios response with stream
 * 
 * ⚠️ CRITICAL: For CDN downloads, use https://fmoviesunblocked.net/ as Referer
 * The movie detail page Referer is ONLY for the metadata API call
 */
export const streamFile = async (url, options = {}) => {
  try {
    const urlObj = new URL(url);
    const cdnHostname = urlObj.hostname;
    
    // ⚠️ CRITICAL: For CDN downloads, use fmoviesunblocked.net as Referer
    // NOT the movie detail page URL! The movie page Referer is only for metadata API calls
    const cdnReferer = 'https://fmoviesunblocked.net/';
    
    // Build cookie string
    const cookieString = Object.entries(sessionCookies)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ');
    
    // Headers specifically for CDN download (different from API headers)
    const headers = {
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:137.0) Gecko/20100101 Firefox/137.0',
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.5',
      'Referer': cdnReferer, // ⚠️ Use fmoviesunblocked.net for CDN
      'Origin': 'https://fmoviesunblocked.net', // Match Origin with Referer
      'Host': cdnHostname, // CDN hostname from video URL
      // Support range requests for resumable downloads (important for IDM and browser managers)
      ...(options.range && { Range: options.range }),
    };
    
    // Add cookies if available
    if (cookieString) {
      headers['Cookie'] = cookieString;
    }
    
    console.log('Downloading from CDN:', url);
    console.log('Using CDN Referer:', cdnReferer);
    
    // Check if URL is HTTPS to determine if we need the custom agent
    const isHttps = url.startsWith('https://');
    
    const response = await axios.get(url, {
      responseType: 'stream',
      headers,
      // Use custom HTTPS agent to bypass SSL certificate validation for CDN
      // This is necessary because the CDN uses a shared certificate that doesn't match the hostname
      ...(isHttps && { httpsAgent }),
      // Validate status to handle 206 (Partial Content) and 403 (Forbidden) responses
      validateStatus: (status) => status < 500, // Don't throw on 403, handle it
      // Increase timeout for large file downloads
      timeout: 300000, // 5 minutes
    });
    
    // Check for 403 error - try without cookies as fallback
    if (response.status === 403) {
      console.log('403 received, retrying without cookies...');
      
      // Try without cookies (some CDNs don't need them)
      const retryHeaders = { ...headers };
      delete retryHeaders['Cookie'];
      
      const retryResponse = await axios.get(url, {
        responseType: 'stream',
        headers: retryHeaders,
        ...(isHttps && { httpsAgent }),
        validateStatus: (status) => status < 500,
        timeout: 300000,
      });
      
      if (retryResponse.status === 403) {
        console.error('403 Forbidden even without cookies - Headers:', retryHeaders);
        console.error('Response status:', retryResponse.status, retryResponse.statusText);
        throw new Error(`403 Forbidden: CDN rejected request. Referer used: ${cdnReferer}`);
      }
      
      // Return retry response if successful
      return retryResponse;
    }
    
    // Check for other non-200 status codes
    if (response.status !== 200 && response.status !== 206) {
      throw new Error(`CDN returned status ${response.status}: ${response.statusText}`);
    }
    
    return response;
  } catch (error) {
    console.error('Error streaming file:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
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

