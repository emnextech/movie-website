const QualitySelector = ({ qualities, selectedQuality, onSelect }) => {
  if (!qualities || qualities.length === 0) {
    return null;
  }

  // Sort qualities by resolution (highest first)
  const sortedQualities = [...qualities].sort((a, b) => {
    const getResolution = (q) => {
      const match = q.resolution?.match(/(\d+)P/i) || q.quality?.match(/(\d+)P/i);
      return match ? parseInt(match[1]) : 0;
    };
    return getResolution(b) - getResolution(a);
  });

  return (
    <div className="flex flex-wrap gap-2">
      {sortedQualities.map((quality, index) => {
        const resolution = quality.resolution || quality.quality || 'Unknown';
        const isSelected = selectedQuality?.url === quality.url;
        
        return (
          <button
            key={index}
            onClick={() => onSelect(quality)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isSelected
                ? 'bg-primary-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {resolution}
          </button>
        );
      })}
    </div>
  );
};

export default QualitySelector;

