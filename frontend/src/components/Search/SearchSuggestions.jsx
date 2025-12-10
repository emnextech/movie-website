import { Loader2 } from 'lucide-react';

const SearchSuggestions = ({ suggestions, loading, onSelect, onClose }) => {
  if (!suggestions || suggestions.length === 0) {
    if (loading) {
      return (
        <div className="absolute z-50 w-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          <div className="p-4 text-center">
            <Loader2 className="w-5 h-5 animate-spin text-primary-500 mx-auto" />
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="absolute z-50 w-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-64 overflow-y-auto">
      {suggestions.map((suggestion, index) => {
        const title = suggestion.title || suggestion.name || suggestion;
        const image = suggestion.poster || suggestion.cover || suggestion.image;

        return (
          <button
            key={index}
            onClick={() => onSelect(suggestion)}
            className="w-full flex items-center space-x-3 p-3 hover:bg-gray-700 transition-colors text-left"
          >
            {image && (
              <img
                src={image}
                alt={title}
                className="w-12 h-16 object-cover rounded"
                loading="lazy"
              />
            )}
            <span className="text-white flex-grow">{title}</span>
          </button>
        );
      })}
    </div>
  );
};

export default SearchSuggestions;

