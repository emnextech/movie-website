import { useState, useCallback } from 'react';
import { getSearchSuggestions, searchMovies } from '../services/api';

export const useSearch = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSuggestions = useCallback(async (keyword) => {
    if (!keyword || keyword.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await getSearchSuggestions(keyword);
      setSuggestions(response?.data || response || []);
    } catch (err) {
      setError(err.message);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const performSearch = useCallback(async (keyword, page = 1, perPage = 24, subjectType = 0) => {
    try {
      setLoading(true);
      setError(null);
      const response = await searchMovies(keyword, page, perPage, subjectType);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    suggestions,
    loading,
    error,
    fetchSuggestions,
    performSearch,
  };
};

