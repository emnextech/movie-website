import SearchBar from '../components/Search/SearchBar';
import SearchResults from '../components/Search/SearchResults';
import { useNavigate } from 'react-router-dom';

const SearchPage = () => {
  const navigate = useNavigate();

  const handleSearch = (keyword) => {
    navigate(`/search?q=${encodeURIComponent(keyword)}`);
  };

  return (
    <div className="container-custom py-8">
      <div className="max-w-2xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          Search Movies & TV Series
        </h1>
        <SearchBar onSearch={handleSearch} />
      </div>
      <SearchResults />
    </div>
  );
};

export default SearchPage;

