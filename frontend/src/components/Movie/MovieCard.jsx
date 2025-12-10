import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import OptimizedImage from '../Common/OptimizedImage';

const MovieCard = ({ movie, priority = false }) => {
  if (!movie) return null;
  
  // Handle both direct subject objects and nested structures
  const subject = movie.subject || movie;
  const cover = subject.cover || movie.cover || {};
  const posterUrl = cover.url || subject.poster || movie.poster || subject.image?.url || movie.image?.url || '';
  const blurHash = cover.blurHash || subject.cover?.blurHash || movie.cover?.blurHash;
  const thumbnail = cover.thumbnail || subject.cover?.thumbnail || movie.cover?.thumbnail;
  const title = subject.title || movie.title || subject.name || movie.name || 'Unknown Title';
  const detailPath = subject.detailPath || movie.detailPath || subject.path || movie.path || '';
  const subjectId = subject.subjectId || movie.subjectId || subject.id || movie.id || '';

  // Construct the link - use subjectId if detailPath is not available
  const movieLink = detailPath 
    ? `/movie/${detailPath}${subjectId ? `?id=${subjectId}` : ''}`
    : subjectId 
      ? `/movie/movie-${subjectId}?id=${subjectId}`
      : '#';

  return (
    <Link
      to={movieLink}
      className="group relative block"
    >
      <div className="relative overflow-hidden rounded-lg bg-gray-800 aspect-[2/3]">
        {posterUrl ? (
          <OptimizedImage
            src={posterUrl}
            alt={title}
            blurHash={blurHash}
            thumbnail={thumbnail}
            className="w-full h-full group-hover:scale-105 transition-transform duration-300"
            aspectRatio="2/3"
            priority={priority}
            maxWidth={192}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800">
            <Play className="w-12 h-12 text-gray-600" />
          </div>
        )}
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity duration-300 flex items-center justify-center">
          <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </div>
      
      {/* Title */}
      <div className="mt-3">
        <h3 className="text-white font-medium line-clamp-2 group-hover:text-primary-400 transition-colors">
          {title}
        </h3>
        {(subject.releaseDate || movie.releaseDate) && (
          <p className="text-gray-400 text-sm mt-1">
            {new Date(subject.releaseDate || movie.releaseDate).getFullYear()}
          </p>
        )}
      </div>
    </Link>
  );
};

export default MovieCard;

