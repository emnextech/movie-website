import express from 'express';
import { post } from '../services/movieboxApi.js';

const router = express.Router();

/**
 * POST /api/search
 * Searches for movies, TV series, or all content types
 * Body: { keyword, page, perPage, subjectType }
 */
router.post('/', async (req, res, next) => {
  try {
    const { keyword, page = 1, perPage = 24, subjectType = 0 } = req.body;

    if (!keyword || keyword.trim() === '') {
      return res.status(400).json({
        success: false,
        error: { message: 'Keyword is required' },
      });
    }

    const data = await post('/wefeed-h5-bff/web/subject/search', {
      keyword: keyword.trim(),
      page: parseInt(page),
      perPage: parseInt(perPage),
      subjectType: parseInt(subjectType),
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
 * POST /api/search-suggest
 * Provides autocomplete/search suggestions
 * Body: { keyword, per_page }
 */
router.post('/suggest', async (req, res, next) => {
  try {
    const { keyword, per_page = 10 } = req.body;

    if (!keyword || keyword.trim() === '') {
      return res.status(400).json({
        success: false,
        error: { message: 'Keyword is required' },
      });
    }

    const data = await post('/wefeed-h5-bff/web/subject/search-suggest', {
      keyword: keyword.trim(),
      per_page: parseInt(per_page),
    });

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

