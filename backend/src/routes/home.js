import express from 'express';
import { get } from '../services/movieboxApi.js';

const router = express.Router();

/**
 * GET /api/home
 * Fetches homepage content including trending movies, popular content, and featured items
 */
router.get('/', async (req, res, next) => {
  try {
    const data = await get('/wefeed-h5-bff/web/home');
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

