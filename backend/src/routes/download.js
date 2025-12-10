import express from 'express';
import { get, streamFile, BASE_URL } from '../services/movieboxApi.js';
import { downloadLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * GET /api/download
 * Retrieves metadata about downloadable files for a movie or TV series episode
 * Query params: subjectId, se (season), ep (episode)
 */
router.get('/metadata', async (req, res, next) => {
  try {
    const { subjectId, se = 0, ep = 0 } = req.query;

    if (!subjectId) {
      return res.status(400).json({
        success: false,
        error: { message: 'subjectId is required' },
      });
    }

    // Get detailPath from referer if available, or construct a default one
    const referer = req.headers.referer || `${BASE_URL}/movies/movie-${subjectId}`;

    const data = await get(
      '/wefeed-h5-bff/web/subject/download',
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
 * GET /api/download-file
 * Streams video files from Moviebox API to browser
 * Query params: url (direct file URL)
 */
router.get('/file', downloadLimiter, async (req, res, next) => {
  try {
    const { url } = req.query;

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

    // Stream the file
    const response = await streamFile(url);

    // Set appropriate headers
    const contentType = response.headers['content-type'] || 'video/mp4';
    const contentLength = response.headers['content-length'];
    const fileName = url.split('/').pop() || 'download.mp4';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }

    // Enable range requests for resumable downloads
    res.setHeader('Accept-Ranges', 'bytes');

    // Stream the file to the client
    response.data.pipe(res);
  } catch (error) {
    next(error);
  }
});

export default router;

