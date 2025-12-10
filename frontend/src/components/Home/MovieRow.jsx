import { useRef } from 'react';
import MovieCard from '../Movie/MovieCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MovieRow = ({ title, subjects, loading = false }) => {
  const scrollRef = useRef(null);

  if (loading) {
    return (
      <section className="py-8">
        <div className="container-custom">
          <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
          <div className="flex space-x-4 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-48 animate-pulse">
                <div className="aspect-[2/3] bg-gray-800 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!subjects || subjects.length === 0) return null;

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="py-8">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          {subjects.length > 6 && (
            <div className="flex space-x-2">
              <button
                onClick={() => scroll('left')}
                className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>
          )}
        </div>
        <div
          ref={scrollRef}
          className="flex space-x-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {subjects.map((subject, index) => (
            <div key={subject.subjectId || index} className="flex-shrink-0 w-48">
              <MovieCard movie={subject} priority={index < 6} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MovieRow;

