import express from 'express';
import { get } from '../services/movieboxApi.js';

const router = express.Router();

/**
 * GET /api/trending
 * Retrieves trending movies and TV series
 * Query params: page, perPage
 */
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const perPage = parseInt(req.query.perPage) || 18;

    const data = await get('/wefeed-h5-bff/web/subject/trending', {
      page,
      perPage,
    });

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/rankings
 * Retrieves hot/popular movies and TV series rankings
 */
router.get('/rankings', async (req, res, next) => {
  try {
    const data = await get('/wefeed-h5-bff/web/subject/search-rank');
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

