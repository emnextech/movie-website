import { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import { useSearch } from '../../hooks/useSearch';
import SearchSuggestions from './SearchSuggestions';

const SearchBar = ({ onSearch, initialValue = '' }) => {
  const [keyword, setKeyword] = useState(initialValue);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);
  const { suggestions, loading, fetchSuggestions } = useSearch();

  useEffect(() => {
    if (keyword.trim().length >= 2) {
      fetchSuggestions(keyword);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [keyword, fetchSuggestions]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (keyword.trim() && onSearch) {
      onSearch(keyword.trim());
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setKeyword(suggestion.title || suggestion.name || suggestion);
    setShowSuggestions(false);
    if (onSearch) {
      onSearch(suggestion.title || suggestion.name || suggestion);
    }
  };

  return (
    <div className="relative" ref={searchRef}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onFocus={() => keyword.trim().length >= 2 && setShowSuggestions(true)}
            placeholder="Search movies, TV series..."
            className="w-full pl-10 pr-10 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {keyword && (
            <button
              type="button"
              onClick={() => {
                setKeyword('');
                setShowSuggestions(false);
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </form>

      {showSuggestions && (
        <SearchSuggestions
          suggestions={suggestions}
          loading={loading}
          onSelect={handleSuggestionClick}
          onClose={() => setShowSuggestions(false)}
        />
      )}
    </div>
  );
};

export default SearchBar;

