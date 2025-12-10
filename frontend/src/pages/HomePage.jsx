import { useState, useEffect } from 'react';
import { getHomeContent } from '../services/api';
import HeroCarousel from '../components/Home/HeroCarousel';
import MovieRow from '../components/Home/MovieRow';

const HomePage = () => {
  const [homeData, setHomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const homeResponse = await getHomeContent();
        // API structure: { code: 0, message: "ok", data: { operatingList: [...] } }
        // Backend wraps: { success: true, data: { code: 0, data: { operatingList: [...] } } }
        // After interceptor: homeResponse = { success: true, data: { code: 0, data: {...} } }
        const home = homeResponse?.data || homeResponse;
        setHomeData(home);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (error) {
    return (
      <div className="container-custom py-8">
        <div className="text-center">
          <p className="text-red-400">Error: {error}</p>
        </div>
      </div>
    );
  }

  // Extract operatingList from home data
  // homeData = { code: 0, data: { operatingList: [...] } }
  // So we need: homeData.data.operatingList
  const apiData = homeData?.data || homeData;
  const operatingList = apiData?.operatingList || [];

  // Find banner section (type === "BANNER")
  const bannerSection = operatingList.find(item => item.type === 'BANNER');
  const banners = bannerSection?.banner?.items || [];

  // Filter movie sections (SUBJECTS_MOVIE type)
  const movieSections = operatingList.filter(item => item.type === 'SUBJECTS_MOVIE');

  return (
    <div>
      {/* Hero Carousel */}
      {banners.length > 0 && <HeroCarousel banners={banners} />}

      {/* Movie Rows */}
      {loading ? (
        <div className="container-custom py-8">
          <div className="animate-pulse space-y-8">
            {[...Array(3)].map((_, i) => (
              <div key={i}>
                <div className="h-8 bg-gray-800 rounded w-48 mb-4"></div>
                <div className="flex space-x-4">
                  {[...Array(6)].map((_, j) => (
                    <div key={j} className="w-48 aspect-[2/3] bg-gray-800 rounded-lg"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        movieSections.map((section, index) => (
          <MovieRow
            key={section.position || index}
            title={section.title || 'Movies'}
            subjects={section.subjects || []}
            loading={false}
          />
        ))
      )}

      {!loading && movieSections.length === 0 && (
        <div className="container-custom py-8">
          <div className="text-center">
            <p className="text-gray-400">No content available</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;

