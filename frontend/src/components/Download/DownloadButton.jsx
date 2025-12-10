import { useState } from 'react';
import { Download, Loader2, Check } from 'lucide-react';
import { useDownload } from '../../hooks/useDownload';
import { formatFileSize } from '../../utils/formatters';
import DownloadProgress from './DownloadProgress';

const DownloadButton = ({ url, filename, fileSize }) => {
  const { download, downloading, error, progress } = useDownload();
  const [completed, setCompleted] = useState(false);

  const handleDownload = async () => {
    try {
      setCompleted(false);
      await download(url, filename);
      setCompleted(true);
      setTimeout(() => setCompleted(false), 3000);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  if (completed) {
    return (
      <div className="flex items-center space-x-2 text-green-400">
        <Check className="w-5 h-5" />
        <span>Download completed!</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleDownload}
        disabled={downloading || !url}
        className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {downloading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Downloading...</span>
          </>
        ) : (
          <>
            <Download className="w-5 h-5" />
            <span>Download</span>
          </>
        )}
        {fileSize && (
          <span className="text-sm opacity-75">({formatFileSize(fileSize)})</span>
        )}
      </button>

      {downloading && <DownloadProgress progress={progress} />}

      {error && (
        <p className="text-red-400 text-sm">Error: {error}</p>
      )}
    </div>
  );
};

export default DownloadButton;

