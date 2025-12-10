import { useState, useEffect } from 'react';
import { getTrending } from '../services/api';
import MovieGrid from '../components/Movie/MovieGrid';
import { TrendingUp } from 'lucide-react';

const TrendingPage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchTrending(0);
  }, []);

  const fetchTrending = async (pageNum) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getTrending(pageNum, 18);
      const data = response?.data || response;
      
      // Handle different response structures
      const items = data?.items || data?.subjects || data?.data?.items || data?.data?.subjects || [];
      
      if (pageNum === 0) {
        setMovies(items);
      } else {
        setMovies((prev) => [...prev, ...items]);
      }
      
      setHasMore(data?.pager?.hasMore || data?.hasMore || items.length === 18);
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
      fetchTrending(nextPage);
    }
  };

  return (
    <div className="container-custom py-8">
      <div className="flex items-center space-x-2 mb-6">
        <TrendingUp className="w-8 h-8 text-primary-500" />
        <h1 className="text-3xl font-bold text-white">Trending Now</h1>
      </div>

      {error ? (
        <div className="text-center py-8">
          <p className="text-red-400">Error: {error}</p>
        </div>
      ) : (
        <>
          <MovieGrid movies={movies} loading={loading && page === 0} />
          
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

export default TrendingPage;

