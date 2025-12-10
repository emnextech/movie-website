import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import OptimizedImage from '../Common/OptimizedImage';

const HeroCarousel = ({ banners }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState(new Set([0])); // First image loads immediately

  if (!banners || banners.length === 0) return null;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  // Lazy load next and previous images when current index changes
  useEffect(() => {
    // Preload next image
    const nextIndex = (currentIndex + 1) % banners.length;
    if (!loadedImages.has(nextIndex)) {
      const banner = banners[nextIndex];
      const imageUrl = banner?.image?.url || banner?.subject?.cover?.url || '';
      if (imageUrl) {
        const img = new Image();
        img.src = imageUrl;
        img.onload = () => {
          setLoadedImages((prev) => new Set([...prev, nextIndex]));
        };
      }
    }
    
    // Preload previous image
    const prevIndex = (currentIndex - 1 + banners.length) % banners.length;
    if (!loadedImages.has(prevIndex)) {
      const banner = banners[prevIndex];
      const imageUrl = banner?.image?.url || banner?.subject?.cover?.url || '';
      if (imageUrl) {
        const img = new Image();
        img.src = imageUrl;
        img.onload = () => {
          setLoadedImages((prev) => new Set([...prev, prevIndex]));
        };
      }
    }
  }, [currentIndex, banners, loadedImages]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const currentBanner = banners[currentIndex];
  const imageUrl = currentBanner?.image?.url || currentBanner?.subject?.cover?.url || '';
  const blurHash = currentBanner?.image?.blurHash || currentBanner?.subject?.cover?.blurHash;
  const title = currentBanner?.title || currentBanner?.subject?.title || '';
  const description = currentBanner?.subject?.description || '';
  const detailPath = currentBanner?.detailPath || currentBanner?.subject?.detailPath || '';
  const subjectId = currentBanner?.subjectId || currentBanner?.subject?.subjectId || '';

  if (!imageUrl) return null;

  return (
    <div className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <OptimizedImage
          src={imageUrl}
          alt={title}
          blurHash={blurHash}
          className="absolute inset-0 w-full h-full"
          priority={currentIndex === 0}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent z-10"></div>
      </div>


      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 z-20 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
        aria-label="Previous"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 z-20 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
        aria-label="Next"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* Content */}
      <div className="container-custom relative z-10">
        <div className="max-w-2xl">
          <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">{title}</h1>
          {description && (
            <p className="text-gray-300 text-lg mb-6 line-clamp-3 drop-shadow-md">
              {description}
            </p>
          )}
          {detailPath && (
            <Link
              to={`/movie/${detailPath}${subjectId ? `?id=${subjectId}` : ''}`}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-lg"
            >
              <span>Watch Now</span>
            </Link>
          )}
        </div>
      </div>

      {/* Dots Indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? 'bg-white w-8' : 'bg-white/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroCarousel;

