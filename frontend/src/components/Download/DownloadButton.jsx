import { Download } from 'lucide-react';
import { formatFileSize } from '../../utils/formatters';
import { API_BASE_URL } from '../../services/api';

const DownloadButton = ({ url, filename, fileSize, detailPath, subjectId }) => {
  const handleDownload = () => {
    if (!url) {
      console.error('Download URL is missing');
      return;
    }

    try {
      // Use the backend proxy to handle CORS and streaming
      // This allows browser download managers and IDM to intercept the download
      const params = new URLSearchParams({
        url: url,
      });
      
      // Add filename if provided
      if (filename) {
        params.append('filename', filename);
      }
      
      // CRITICAL: Add detailPath and subjectId for proper Referer header
      // This is required to avoid 403 Forbidden errors from the CDN
      if (detailPath) {
        params.append('detailPath', detailPath);
      }
      if (subjectId) {
        params.append('subjectId', subjectId);
      }
      
      const proxyUrl = `${API_BASE_URL}/download/file?${params.toString()}`;
      
      // Create a temporary anchor element to trigger browser download
      // This method allows browser download managers and IDM to intercept
      const link = document.createElement('a');
      link.href = proxyUrl;
      link.download = filename || 'download.mp4';
      link.style.display = 'none'; // Hide the link
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      
      // Clean up after a short delay
      setTimeout(() => {
        document.body.removeChild(link);
      }, 100);
    } catch (err) {
      console.error('Download error:', err);
      // Fallback: try direct download
      try {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || 'download.mp4';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => document.body.removeChild(link), 100);
      } catch (fallbackErr) {
        console.error('Fallback download also failed:', fallbackErr);
      }
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleDownload}
        disabled={!url}
        className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title={url ? `Download ${filename || 'file'}` : 'Download URL not available'}
      >
        <Download className="w-5 h-5" />
        <span>Download Video</span>
        {fileSize && (
          <span className="text-sm opacity-75">({formatFileSize(fileSize)})</span>
        )}
      </button>
      {!url && (
        <p className="text-red-400 text-xs">Download URL not available</p>
      )}
    </div>
  );
};

export default DownloadButton;

