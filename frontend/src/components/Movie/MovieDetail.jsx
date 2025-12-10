import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { getMovieDetails, getDownloadMetadata, getRecommendations } from '../../services/api';
import QualitySelector from './QualitySelector';
import DownloadButton from '../Download/DownloadButton';
import MovieGrid from './MovieGrid';
import OptimizedImage from '../Common/OptimizedImage';
import { formatDate, formatDuration } from '../../utils/formatters';
import { Star, Clock, Globe, Film } from 'lucide-react';

const MovieDetail = () => {
  const { detailPath } = useParams();
  const [searchParams] = useSearchParams();
  const subjectId = searchParams.get('id');

  const [movie, setMovie] = useState(null);
  const [downloadData, setDownloadData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedQuality, setSelectedQuality] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch movie details
        const movieResponse = await getMovieDetails(detailPath, subjectId);
        setMovie(movieResponse.data);

        // Fetch download metadata if subjectId is available
        if (subjectId) {
          try {
            const downloadResponse = await getDownloadMetadata(subjectId, 0, 0);
            const downloadInfo = downloadResponse.data;
            
            if (downloadInfo?.mediaFiles && downloadInfo.mediaFiles.length > 0) {
              setDownloadData(downloadInfo);
              // Select highest quality by default
              const sorted = [...downloadInfo.mediaFiles].sort((a, b) => {
                const getRes = (q) => parseInt(q.resolution?.match(/(\d+)/)?.[1] || 0);
                return getRes(b) - getRes(a);
              });
              setSelectedQuality(sorted[0]);
            }
          } catch (err) {
            console.error('Error fetching download metadata:', err);
          }

          // Fetch recommendations
          try {
            const recResponse = await getRecommendations(subjectId);
            setRecommendations(recResponse.data?.items || []);
          } catch (err) {
            console.error('Error fetching recommendations:', err);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (detailPath) {
      fetchData();
    }
  }, [detailPath, subjectId]);

  if (loading) {
    return (
      <div className="container-custom py-8">
        <div className="animate-pulse">
          <div className="h-96 bg-gray-800 rounded-lg mb-6"></div>
          <div className="h-8 bg-gray-800 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-800 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-custom py-8">
        <div className="text-center">
          <p className="text-red-400 mb-4">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="container-custom py-8">
        <div className="text-center">
          <p className="text-gray-400">Movie not found</p>
        </div>
      </div>
    );
  }

  // Extract movie data - handle both direct and nested structures
  const subject = movie.subject || movie;
  const cover = subject.cover || movie.cover || {};
  const posterUrl = cover.url || subject.image?.url || movie.image || subject.poster || movie.poster || '';
  const blurHash = cover.blurHash || subject.cover?.blurHash || movie.cover?.blurHash;
  const thumbnail = cover.thumbnail || subject.cover?.thumbnail || movie.cover?.thumbnail;
  const title = subject.title || movie.title || subject.name || movie.name || 'Unknown Title';
  const description = subject.description || movie.description || subject.overview || movie.overview || '';
  const genre = subject.genre || movie.genre || '';
  const duration = subject.duration || movie.duration || 0;
  const countryName = subject.countryName || movie.countryName || '';
  const imdbRating = subject.imdbRatingValue || movie.imdbRatingValue || '';
  const imdbRatingCount = subject.imdbRatingCount || movie.imdbRatingCount || 0;
  const subtitles = subject.subtitles || movie.subtitles || '';
  const subjectType = subject.subjectType || movie.subjectType || 1; // 1 = Movie, 2 = TV Series
  const releaseDate = subject.releaseDate || movie.releaseDate || '';

  // Format genres as array
  const genres = genre ? genre.split(',').map(g => g.trim()) : [];
  
  // Format subtitles as array (limit to first 5 for display)
  const subtitleList = subtitles ? subtitles.split(',').map(s => s.trim()).slice(0, 5) : [];

  return (
    <div className="container-custom py-8">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        {/* Poster */}
        <div className="flex-shrink-0">
          {posterUrl ? (
            <OptimizedImage
              src={posterUrl}
              alt={title}
              blurHash={blurHash}
              thumbnail={thumbnail}
              className="w-full md:w-80 rounded-lg shadow-lg"
              aspectRatio="2/3"
              priority={true}
              maxWidth={320}
            />
          ) : (
            <div className="w-full md:w-80 aspect-[2/3] bg-gray-800 rounded-lg flex items-center justify-center">
              <span className="text-gray-600">No Image</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-grow">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-2">{title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                {releaseDate && (
                  <span>{formatDate(releaseDate)}</span>
                )}
                {subjectType === 2 && (
                  <span className="px-2 py-1 bg-primary-600/20 text-primary-400 rounded">TV Series</span>
                )}
                {subjectType === 1 && (
                  <span className="px-2 py-1 bg-primary-600/20 text-primary-400 rounded">Movie</span>
                )}
              </div>
            </div>
          </div>

          {/* Rating and Meta Info */}
          <div className="flex flex-wrap items-center gap-6 mb-6">
            {imdbRating && (
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <div>
                  <span className="text-white font-semibold">{imdbRating}</span>
                  {imdbRatingCount > 0 && (
                    <span className="text-gray-400 text-sm ml-2">
                      ({imdbRatingCount.toLocaleString()} ratings)
                    </span>
                  )}
                </div>
              </div>
            )}
            {duration > 0 && (
              <div className="flex items-center gap-2 text-gray-300">
                <Clock className="w-5 h-5" />
                <span>{formatDuration(duration)}</span>
              </div>
            )}
            {countryName && (
              <div className="flex items-center gap-2 text-gray-300">
                <Globe className="w-5 h-5" />
                <span>{countryName}</span>
              </div>
            )}
          </div>

          {/* Genres */}
          {genres.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {genres.map((g, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-700 text-gray-200 rounded-full text-sm"
                >
                  {g}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          {description && (
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-2">Overview</h3>
              <p className="text-gray-300 leading-relaxed">
                {description}
              </p>
            </div>
          )}

          {/* Subtitles */}
          {subtitleList.length > 0 && (
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                <Film className="w-4 h-4" />
                Available Subtitles
              </h3>
              <div className="flex flex-wrap gap-2">
                {subtitleList.map((sub, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs"
                  >
                    {sub}
                  </span>
                ))}
                {subtitleList.length < subtitles.split(',').length && (
                  <span className="px-2 py-1 text-gray-400 text-xs">
                    +{subtitles.split(',').length - subtitleList.length} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Download Section */}
          {downloadData && (
            <div className="space-y-4">
              <div>
                <h3 className="text-white font-semibold mb-3">Select Quality</h3>
                <QualitySelector
                  qualities={downloadData.mediaFiles || []}
                  selectedQuality={selectedQuality}
                  onSelect={setSelectedQuality}
                />
              </div>

              {selectedQuality && (
                <DownloadButton
                  url={selectedQuality.url}
                  filename={`${title}.mp4`}
                  fileSize={selectedQuality.size}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6">Recommendations</h2>
          <MovieGrid movies={recommendations} />
        </div>
      )}
    </div>
  );
};

export default MovieDetail;

