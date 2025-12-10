const QualitySelector = ({ qualities, selectedQuality, onSelect }) => {
  if (!qualities || qualities.length === 0) {
    return null;
  }

  // Sort qualities by resolution (highest first)
  const sortedQualities = [...qualities].sort((a, b) => {
    const getResolution = (q) => {
      // Handle numeric resolution (e.g., 360, 480, 1080)
      if (typeof q.resolution === 'number') {
        return q.resolution;
      }
      // Handle string resolution (e.g., "360P", "1080P")
      const match = q.resolution?.toString().match(/(\d+)/) || q.quality?.toString().match(/(\d+)/);
      return match ? parseInt(match[1]) : 0;
    };
    return getResolution(b) - getResolution(a);
  });

  const formatResolution = (resolution) => {
    if (typeof resolution === 'number') {
      return `${resolution}P`;
    }
    return resolution || 'Unknown';
  };

  return (
    <div className="flex flex-wrap gap-2">
      {sortedQualities.map((quality, index) => {
        const resolution = formatResolution(quality.resolution || quality.quality);
        const isSelected = selectedQuality?.id === quality.id || selectedQuality?.url === quality.url;
        
        return (
          <button
            key={quality.id || index}
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

