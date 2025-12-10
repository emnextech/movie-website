import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

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
export const getDownloadMetadata = (subjectId, se = 0, ep = 0, detailPath = null) =>
  api.get('/download/metadata', { params: { subjectId, se, ep, ...(detailPath && { detailPath }) } });

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

// Movie download endpoints
export const getMovieDownloads = async (subjectId, detailPath = null) => {
  try {
    const params = { subjectId, se: 0, ep: 0 };
    if (detailPath) {
      params.detailPath = detailPath;
    }
    const response = await api.get('/movie/download', { params });
    
    if (response.success) {
      return {
        videos: response.downloads || [],
        subtitles: response.captions || [],
        metadata: response.metadata || {},
      };
    } else {
      throw new Error(response.error?.message || 'Unknown error');
    }
  } catch (error) {
    console.error('Error fetching downloads:', error);
    throw error;
  }
};

// Get best quality video
export const getBestQualityVideo = async (subjectId, detailPath = null) => {
  try {
    const params = { subjectId, se: 0, ep: 0 };
    if (detailPath) params.detailPath = detailPath;
    const response = await api.get('/movie/download/best', { params });
    
    return response.success ? response.video : null;
  } catch (error) {
    console.error('Error fetching best quality:', error);
    return null;
  }
};

// Get specific quality video
export const getVideoByQuality = async (subjectId, quality, detailPath = null) => {
  try {
    const params = { subjectId, se: 0, ep: 0 };
    if (detailPath) params.detailPath = detailPath;
    const response = await api.get(`/movie/download/quality/${quality}`, { params });
    
    return response.success ? response.video : null;
  } catch (error) {
    console.error('Error fetching video:', error);
    return null;
  }
};

// Get subtitle by language
export const getSubtitle = async (subjectId, lang = 'en', detailPath = null) => {
  try {
    const params = { subjectId, se: 0, ep: 0, lang };
    if (detailPath) params.detailPath = detailPath;
    const response = await api.get('/movie/subtitle', { params });
    
    return response.success ? response.subtitle : null;
  } catch (error) {
    console.error('Error fetching subtitle:', error);
    return null;
  }
};

// Recommendations
export const getRecommendations = (subjectId, page = 1, perPage = 24) =>
  api.get('/recommendations', { params: { subjectId, page, perPage } });

export default api;

