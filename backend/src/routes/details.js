import express from 'express';
import { getHTML, BASE_URL } from '../services/movieboxApi.js';
import { parseMovieDetailHTML } from '../utils/htmlParser.js';

const router = express.Router();

/**
 * GET /api/movies/:detailPath
 * Fetches detailed information about a specific movie or TV series
 * Query params: id (subjectId)
 */
router.get('/:detailPath', async (req, res, next) => {
  try {
    const { detailPath } = req.params;
    const { id } = req.query;

    if (!detailPath) {
      return res.status(400).json({
        success: false,
        error: { message: 'Detail path is required' },
      });
    }

    // Construct the full URL
    const url = id 
      ? `/movies/${detailPath}?id=${id}`
      : `/movies/${detailPath}`;

    // Fetch HTML content
    const html = await getHTML(url);

    // Parse JSON data from HTML
    const movieData = parseMovieDetailHTML(html);

    res.json({
      success: true,
      data: movieData,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

