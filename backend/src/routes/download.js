import express from 'express';
import { get, streamFile, BASE_URL } from '../services/movieboxApi.js';
import { downloadLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * GET /api/download/metadata
 * Retrieves metadata about downloadable files for a movie or TV series episode
 * Query params: subjectId, se (season), ep (episode), detailPath (optional)
 */
router.get('/metadata', async (req, res, next) => {
  try {
    const { subjectId, se = 0, ep = 0, detailPath } = req.query;

    if (!subjectId) {
      return res.status(400).json({
        success: false,
        error: { message: 'subjectId is required' },
      });
    }

    // Construct referer with detailPath if provided, otherwise use default
    let referer;
    if (detailPath) {
      referer = `${BASE_URL}/movies/${detailPath}`;
    } else {
      // Try to get from request referer header, or construct default
      referer = req.headers.referer || `${BASE_URL}/movies/movie-${subjectId}`;
    }

    const response = await get(
      '/wefeed-h5-bff/web/subject/download',
      {
        subjectId: subjectId.toString(),
        se: parseInt(se),
        ep: parseInt(ep),
      },
      referer,
      true // Use download headers
    );

    // Handle API response structure: { code, message, data }
    if (response.code === 0) {
      res.json({
        success: true,
        downloads: response.data.downloads || [],
        captions: response.data.captions || [],
        metadata: {
          limited: response.data.limited,
          limitedCode: response.data.limitedCode,
          freeNum: response.data.freeNum,
          hasResource: response.data.hasResource,
        },
      });
    } else {
      res.status(400).json({
        success: false,
        error: { message: response.message || 'Unknown error' },
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/stream
 * Retrieves streaming metadata (similar to download but for streaming)
 * Query params: subjectId, se (season), ep (episode)
 */
router.get('/stream', async (req, res, next) => {
  try {
    const { subjectId, se = 0, ep = 0 } = req.query;

    if (!subjectId) {
      return res.status(400).json({
        success: false,
        error: { message: 'subjectId is required' },
      });
    }

    const referer = req.headers.referer || `${BASE_URL}/movies/movie-${subjectId}`;

    const data = await get(
      '/wefeed-h5-bff/web/subject/play',
      {
        subjectId: subjectId.toString(),
        se: parseInt(se),
        ep: parseInt(ep),
      },
      referer
    );

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/download/file
 * Streams video files from Moviebox API to browser
 * Query params: url (direct file URL), filename (optional), detailPath (optional), subjectId (optional)
 * This endpoint supports browser download managers and IDM
 * CRITICAL: detailPath and subjectId are required to build the correct Referer header
 */
router.get('/file', downloadLimiter, async (req, res, next) => {
  try {
    const { url, filename, detailPath, subjectId } = req.query;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: { message: 'File URL is required' },
      });
    }

    // Validate URL to prevent SSRF attacks
    try {
      const urlObj = new URL(url);
      const allowedHosts = [
        'h5.aoneroom.com',
        'movieboxapp.in',
        'moviebox.pk',
        'moviebox.ph',
        'moviebox.id',
        'v.moviebox.ph',
        'netnaija.video',
        'bcdnxw.hakunaymatata.com',
        'cacdn.hakunaymatata.com',
      ];

      if (!allowedHosts.includes(urlObj.hostname)) {
        return res.status(400).json({
          success: false,
          error: { message: 'Invalid file URL' },
        });
      }
    } catch (urlError) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid URL format' },
      });
    }

    // ⚠️ NOTE: For CDN downloads, the Referer is handled in streamFile()
    // The streamFile function uses https://fmoviesunblocked.net/ as Referer for CDN
    // The movie detail page Referer (detailPath/subjectId) is ONLY for metadata API calls
    // We don't need to pass it here for CDN downloads
    
    console.log('Downloading from CDN:', url);
    console.log('Note: CDN Referer is set to https://fmoviesunblocked.net/ in streamFile()');
    
    // Handle range requests for resumable downloads
    const range = req.headers.range;
    
    // Stream the file - streamFile() will use the correct CDN Referer
    const response = await streamFile(url, {
      range: range || undefined,
    });

    // Set appropriate headers for browser download managers
    const contentType = response.headers['content-type'] || 'video/mp4';
    const contentLength = response.headers['content-length'];
    const contentRange = response.headers['content-range'];
    
    // Use provided filename or extract from URL
    const fileName = filename 
      ? decodeURIComponent(filename)
      : url.split('/').pop().split('?')[0] || 'download.mp4';
    
    // Ensure filename has .mp4 extension if not present
    const finalFileName = fileName.endsWith('.mp4') ? fileName : `${fileName}.mp4`;

    // Enable range requests for resumable downloads (important for IDM and browser managers)
    res.setHeader('Accept-Ranges', 'bytes');
    
    // Set cache control to prevent caching of download links
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Handle range response from upstream server
    if (range && response.status === 206) {
      // Partial content response - forward headers from upstream
      res.status(206);
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${finalFileName}"; filename*=UTF-8''${encodeURIComponent(finalFileName)}`);
      
      if (contentRange) {
        res.setHeader('Content-Range', contentRange);
      }
      if (contentLength) {
        res.setHeader('Content-Length', contentLength);
      }
    } else {
      // Full file download
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${finalFileName}"; filename*=UTF-8''${encodeURIComponent(finalFileName)}`);
      
      if (contentLength) {
        res.setHeader('Content-Length', contentLength);
      }
    }

    // Stream the file to the client (upstream handles range if present)
    response.data.pipe(res);
    
    // Handle stream errors
    response.data.on('error', (streamError) => {
      console.error('Stream error:', streamError);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: { message: 'Error streaming file', details: streamError.message },
        });
      }
    });
  } catch (error) {
    console.error('Download error:', error);
    
    // Handle 403 Forbidden errors specifically
    if (error.response && error.response.status === 403) {
      console.error('403 Forbidden - Possible causes:');
      console.error('1. Missing or incorrect Referer header');
      console.error('2. Expired video URL');
      console.error('3. Missing or invalid cookies');
      console.error('4. Referer URL:', detailPath ? `${BASE_URL}/movies/${detailPath}${subjectId ? `?id=${subjectId}` : ''}` : BASE_URL);
      
      return res.status(403).json({
        success: false,
        error: { 
          message: 'Access forbidden. The video URL may have expired or requires proper authentication.',
          details: 'Make sure you are using the correct Referer header and valid cookies. The Referer must match the movie detail page URL.',
          refererUsed: detailPath ? `${BASE_URL}/movies/${detailPath}${subjectId ? `?id=${subjectId}` : ''}` : BASE_URL,
        },
      });
    }
    
    // Provide more specific error messages
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        error: { message: 'Unable to connect to download server. Please try again later.' },
      });
    }
    
    if (error.message && error.message.includes('certificate')) {
      // This shouldn't happen now with our fix, but just in case
      console.error('SSL Certificate error (should be handled by httpsAgent):', error.message);
      return res.status(502).json({
        success: false,
        error: { message: 'SSL certificate validation error. Please contact support.' },
      });
    }
    
    // Generic error
    if (!res.headersSent) {
      const statusCode = error.response?.status || 500;
      res.status(statusCode).json({
        success: false,
        error: { 
          message: error.message || 'Failed to download file',
          ...(process.env.NODE_ENV === 'development' && { 
            details: error.stack,
            responseStatus: error.response?.status,
            responseData: error.response?.data,
          }),
        },
      });
    }
  }
});

/**
 * GET /api/movie/download
 * Get all download options for a movie (alternative endpoint)
 * Query params: subjectId, se (season), ep (episode), detailPath (optional)
 */
router.get('/movie/download', async (req, res, next) => {
  try {
    const { subjectId, se = 0, ep = 0, detailPath } = req.query;

    if (!subjectId) {
      return res.status(400).json({
        success: false,
        error: { message: 'subjectId is required' },
      });
    }

    const referer = detailPath
      ? `${BASE_URL}/movies/${detailPath}`
      : `${BASE_URL}/movies/movie-${subjectId}`;

    const response = await get(
      '/wefeed-h5-bff/web/subject/download',
      {
        subjectId: subjectId.toString(),
        se: parseInt(se),
        ep: parseInt(ep),
      },
      referer,
      true
    );

    if (response.code === 0) {
      res.json({
        success: true,
        downloads: response.data.downloads || [],
        captions: response.data.captions || [],
        metadata: {
          limited: response.data.limited,
          limitedCode: response.data.limitedCode,
          freeNum: response.data.freeNum,
          hasResource: response.data.hasResource,
        },
      });
    } else {
      res.status(400).json({
        success: false,
        error: { message: response.message || 'Unknown error' },
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/movie/download/best
 * Get best quality video (highest resolution)
 * Query params: subjectId, se (season), ep (episode), detailPath (optional)
 */
router.get('/movie/download/best', async (req, res, next) => {
  try {
    const { subjectId, se = 0, ep = 0, detailPath } = req.query;

    if (!subjectId) {
      return res.status(400).json({
        success: false,
        error: { message: 'subjectId is required' },
      });
    }

    const referer = detailPath
      ? `${BASE_URL}/movies/${detailPath}`
      : `${BASE_URL}/movies/movie-${subjectId}`;

    const response = await get(
      '/wefeed-h5-bff/web/subject/download',
      {
        subjectId: subjectId.toString(),
        se: parseInt(se),
        ep: parseInt(ep),
      },
      referer,
      true
    );

    if (response.code === 0) {
      const downloads = response.data.downloads || [];
      
      // Find best quality (highest resolution)
      const bestQuality = downloads.reduce((best, current) => {
        return (!best || current.resolution > best.resolution) ? current : best;
      }, null);

      if (bestQuality) {
        res.json({
          success: true,
          video: bestQuality,
          allQualities: downloads,
        });
      } else {
        res.status(404).json({
          success: false,
          error: { message: 'No downloads available' },
        });
      }
    } else {
      res.status(400).json({
        success: false,
        error: { message: response.message || 'Unknown error' },
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/movie/download/quality/:quality
 * Get specific quality video (360, 480, 720, 1080, etc.)
 * Query params: subjectId, se (season), ep (episode), detailPath (optional)
 * Route params: quality (resolution number)
 */
router.get('/movie/download/quality/:quality', async (req, res, next) => {
  try {
    const { subjectId, se = 0, ep = 0, detailPath } = req.query;
    const { quality } = req.params;

    if (!subjectId) {
      return res.status(400).json({
        success: false,
        error: { message: 'subjectId is required' },
      });
    }

    const referer = detailPath
      ? `${BASE_URL}/movies/${detailPath}`
      : `${BASE_URL}/movies/movie-${subjectId}`;

    const response = await get(
      '/wefeed-h5-bff/web/subject/download',
      {
        subjectId: subjectId.toString(),
        se: parseInt(se),
        ep: parseInt(ep),
      },
      referer,
      true
    );

    if (response.code === 0) {
      const downloads = response.data.downloads || [];
      const selectedQuality = downloads.find(
        d => d.resolution === parseInt(quality)
      );

      if (selectedQuality) {
        res.json({
          success: true,
          video: selectedQuality,
        });
      } else {
        res.status(404).json({
          success: false,
          error: { message: `Quality ${quality}p not available` },
          available: downloads.map(d => d.resolution),
        });
      }
    } else {
      res.status(400).json({
        success: false,
        error: { message: response.message || 'Unknown error' },
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/movie/subtitle
 * Get subtitle by language
 * Query params: subjectId, se (season), ep (episode), lang (language code), detailPath (optional)
 */
router.get('/movie/subtitle', async (req, res, next) => {
  try {
    const { subjectId, se = 0, ep = 0, lang = 'en', detailPath } = req.query;

    if (!subjectId) {
      return res.status(400).json({
        success: false,
        error: { message: 'subjectId is required' },
      });
    }

    const referer = detailPath
      ? `${BASE_URL}/movies/${detailPath}`
      : `${BASE_URL}/movies/movie-${subjectId}`;

    const response = await get(
      '/wefeed-h5-bff/web/subject/download',
      {
        subjectId: subjectId.toString(),
        se: parseInt(se),
        ep: parseInt(ep),
      },
      referer,
      true
    );

    if (response.code === 0) {
      const captions = response.data.captions || [];
      const subtitle = captions.find(c => c.lan === lang);

      if (subtitle) {
        res.json({
          success: true,
          subtitle,
        });
      } else {
        res.status(404).json({
          success: false,
          error: { message: `Subtitle language '${lang}' not available` },
          available: captions.map(c => ({ lan: c.lan, lanName: c.lanName })),
        });
      }
    } else {
      res.status(400).json({
        success: false,
        error: { message: response.message || 'Unknown error' },
      });
    }
  } catch (error) {
    next(error);
  }
});

export default router;

