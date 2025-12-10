import { useState } from 'react';

/**
 * Optimized image component with progressive loading
 * Shows placeholder while loading, then fades in the actual image
 */
const OptimizedImage = ({
  src,
  alt,
  blurHash,
  thumbnail,
  className = '',
  aspectRatio,
  priority = false,
  onError,
  maxWidth = 300, // Default max width for optimization
  ...props
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Use thumbnail if available for faster initial load, otherwise use optimized src
  // For movie cards (w-48 = 192px), we'll request smaller images
  const getOptimizedSrc = (url) => {
    if (!url) return '';
    
    // If thumbnail is available and not empty, use it (thumbnails are typically much smaller)
    if (thumbnail && thumbnail.trim() !== '') {
      return thumbnail;
    }
    
    // Try to optimize the URL for smaller image sizes
    // Many CDNs support query parameters like ?w=, ?width=, ?size=, etc.
    // For pbcdnw.aoneroom.com and similar CDNs, we'll try adding width parameter
    // Note: If the CDN doesn't support this, it will likely ignore the parameter
    try {
      const urlObj = new URL(url);
      // Only add width parameter if not already present and URL is from a CDN
      if (!urlObj.searchParams.has('w') && !urlObj.searchParams.has('width') && !urlObj.searchParams.has('size')) {
        // Request image at 2x resolution for retina displays, but still much smaller than original
        // For movie cards: 192px * 2 = 384px (much smaller than 2025px original)
        const requestedWidth = Math.min(maxWidth * 2, 400); // Cap at 400px for cards
        urlObj.searchParams.set('w', requestedWidth.toString());
        return urlObj.toString();
      }
    } catch (e) {
      // If URL parsing fails (e.g., relative URL), return original
      return url;
    }
    
    return url;
  };

  const imageSrc = getOptimizedSrc(src);

  const handleLoad = () => {
    setImageLoaded(true);
  };

  const handleError = (e) => {
    setImageError(true);
    if (onError) {
      onError(e);
    } else {
      // Default fallback
      e.target.style.display = 'none';
    }
  };

  if (imageError) {
    return (
      <div className={`bg-gray-800 flex items-center justify-center ${className}`} style={aspectRatio ? { aspectRatio } : {}}>
        <span className="text-gray-600 text-sm">No Image</span>
      </div>
    );
  }

  const containerStyle = aspectRatio ? { aspectRatio } : {};
  
  return (
    <div className={`relative overflow-hidden ${className}`} style={containerStyle}>
      {/* Loading skeleton/placeholder */}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-gray-800 animate-pulse" />
      )}
      
      {/* Main image */}
      <img
        src={imageSrc}
        alt={alt}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        width={maxWidth}
        height={Math.round(maxWidth * (aspectRatio === '2/3' ? 1.5 : 1))}
        sizes={`(max-width: 768px) ${Math.round(maxWidth * 0.8)}px, ${maxWidth}px`}
        style={{ 
          maxWidth: '100%', 
          height: '100%',
          objectFit: 'cover'
        }}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </div>
  );
};

export default OptimizedImage;

