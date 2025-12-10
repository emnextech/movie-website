import { useState, useCallback } from 'react';
import { downloadFile } from '../services/api';

export const useDownload = () => {
  const [progress, setProgress] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);

  const download = useCallback(async (url, filename) => {
    try {
      setDownloading(true);
      setProgress(0);
      setError(null);

      const response = await downloadFile(url, (percent) => {
        setProgress(percent);
      });
      
      // Create blob URL and trigger download
      const blob = new Blob([response.data]);
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || 'download.mp4';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      setProgress(100);
      setDownloading(false);
    } catch (err) {
      setError(err.message);
      setDownloading(false);
      throw err;
    }
  }, []);

  const reset = useCallback(() => {
    setProgress(0);
    setError(null);
    setDownloading(false);
  }, []);

  return {
    progress,
    downloading,
    error,
    download,
    reset,
  };
};

