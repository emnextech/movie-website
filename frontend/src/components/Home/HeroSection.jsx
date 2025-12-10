import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';

const HeroSection = ({ featuredMovie }) => {
  if (!featuredMovie) {
    return null;
  }

  const posterUrl = featuredMovie.poster || featuredMovie.cover || featuredMovie.image || '';
  const title = featuredMovie.title || featuredMovie.name || 'Featured Movie';
  const description = featuredMovie.description || featuredMovie.overview || '';
  const detailPath = featuredMovie.detailPath || featuredMovie.path || '';

  return (
    <div className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      {posterUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${posterUrl})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
        </div>
      )}

      {/* Content */}
      <div className="container-custom relative z-10">
        <div className="max-w-2xl">
          <h1 className="text-5xl font-bold text-white mb-4">{title}</h1>
          {description && (
            <p className="text-gray-300 text-lg mb-6 line-clamp-3">
              {description}
            </p>
          )}
          <Link
            to={`/movie/${detailPath}${featuredMovie.subjectId ? `?id=${featuredMovie.subjectId}` : ''}`}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Play className="w-5 h-5" />
            <span>Watch Now</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;

