import MovieGrid from '../Movie/MovieGrid';
import { Star, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const PopularSection = ({ movies, loading, title = 'Popular' }) => {
  if (!movies || movies.length === 0) {
    if (loading) {
      return (
        <section className="py-8 bg-gray-900/50">
          <div className="container-custom">
            <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
            <MovieGrid movies={[]} loading={true} />
          </div>
        </section>
      );
    }
    return null;
  }

  return (
    <section className="py-8 bg-gray-900/50">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Star className="w-6 h-6 text-primary-500" />
            <h2 className="text-2xl font-bold text-white">{title}</h2>
          </div>
          <Link
            to="/trending"
            className="flex items-center space-x-1 text-primary-400 hover:text-primary-300 transition-colors"
          >
            <span>View All</span>
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
        <MovieGrid movies={movies.slice(0, 12)} loading={loading} />
      </div>
    </section>
  );
};

export default PopularSection;

