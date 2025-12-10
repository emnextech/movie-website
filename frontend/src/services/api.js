import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

// Homepage
export const getHomeContent = () => api.get('/home');

// Search
export const searchMovies = (keyword, page = 1, perPage = 24, subjectType = 0) =>
  api.post('/search', { keyword, page, perPage, subjectType });

export const getSearchSuggestions = async (keyword, perPage = 10) => {
  try {
    const response = await api.post('/search/suggest', { keyword, per_page: perPage });
    return response;
  } catch (error) {
    return { data: [] };
  }
};

export const getPopularSearches = () => api.get('/popular-searches');

// Trending
export const getTrending = (page = 0, perPage = 18) =>
  api.get('/trending', { params: { page, perPage } });

export const getRankings = () => api.get('/rankings');

// Movie Details
export const getMovieDetails = (detailPath, id = null) => {
  const params = id ? { id } : {};
  return api.get(`/movies/${detailPath}`, { params });
};

// Download
export const getDownloadMetadata = (subjectId, se = 0, ep = 0) =>
  api.get('/download/metadata', { params: { subjectId, se, ep } });

export const getStreamMetadata = (subjectId, se = 0, ep = 0) =>
  api.get('/stream', { params: { subjectId, se, ep } });

export const downloadFile = (url, onProgress) => {
  return axios.get(`${API_BASE_URL}/download/file`, {
    params: { url },
    responseType: 'blob',
    onDownloadProgress: (progressEvent) => {
      if (progressEvent.total && onProgress) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      }
    },
  });
};

// Recommendations
export const getRecommendations = (subjectId, page = 1, perPage = 24) =>
  api.get('/recommendations', { params: { subjectId, page, perPage } });

export default api;

