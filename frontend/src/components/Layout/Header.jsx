import { Link, useNavigate } from 'react-router-dom';
import { Search, Film } from 'lucide-react';
import { useState } from 'react';
import SearchBar from '../Search/SearchBar';

const Header = () => {
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);

  const handleSearch = (keyword) => {
    if (keyword.trim()) {
      navigate(`/search?q=${encodeURIComponent(keyword)}`);
      setShowSearch(false);
    }
  };

  return (
    <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <Film className="w-8 h-8 text-primary-500 group-hover:text-primary-400 transition-colors" />
            <span className="text-xl font-bold text-white">Luxury Movies</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Home
            </Link>
            <Link
              to="/trending"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Trending
            </Link>
          </nav>

          {/* Search */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 text-gray-300 hover:text-white transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar Dropdown */}
        {showSearch && (
          <div className="pb-4">
            <SearchBar onSearch={handleSearch} />
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

