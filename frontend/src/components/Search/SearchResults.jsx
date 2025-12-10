import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchMovies } from '../../services/api';
import MovieGrid from '../Movie/MovieGrid';
import { Filter } from 'lucide-react';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [subjectType, setSubjectType] = useState(0); // 0 = All, 1 = Movies, 2 = TV Series
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    if (query) {
      performSearch(query, 1, subjectType);
      setPage(1);
    }
  }, [query, subjectType]);

  const performSearch = async (keyword, pageNum = 1, type = 0) => {
    try {
      setLoading(true);
      setError(null);
      const response = await searchMovies(keyword, pageNum, 24, type);
      const data = response.data || response;
      
      if (pageNum === 1) {
        setResults(data.items || []);
      } else {
        setResults((prev) => [...prev, ...(data.items || [])]);
      }
      
      setHasMore(data.pager?.hasMore || false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      performSearch(query, nextPage, subjectType);
    }
  };

  if (!query) {
    return (
      <div className="container-custom py-8">
        <div className="text-center">
          <p className="text-gray-400">Enter a search query to find movies</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-4">
          Search Results for "{query}"
        </h1>

        {/* Filters */}
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <div className="flex space-x-2">
            <button
              onClick={() => setSubjectType(0)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                subjectType === 0
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSubjectType(1)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                subjectType === 1
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Movies
            </button>
            <button
              onClick={() => setSubjectType(2)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                subjectType === 2
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              TV Series
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {error ? (
        <div className="text-center py-8">
          <p className="text-red-400">Error: {error}</p>
        </div>
      ) : (
        <>
          <MovieGrid movies={results} loading={loading && page === 1} />
          
          {hasMore && (
            <div className="text-center mt-8">
              <button
                onClick={loadMore}
                disabled={loading}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchResults;

