import express from 'express';
import { get } from '../services/movieboxApi.js';

const router = express.Router();

/**
 * GET /api/recommendations
 * Gets recommended movies/TV series based on a specific item
 * Query params: subjectId, page, perPage
 */
router.get('/', async (req, res, next) => {
  try {
    const { subjectId, page = 1, perPage = 24 } = req.query;

    if (!subjectId) {
      return res.status(400).json({
        success: false,
        error: { message: 'subjectId is required' },
      });
    }

    const data = await get('/wefeed-h5-bff/web/subject/detail-rec', {
      subjectId: subjectId.toString(),
      page: parseInt(page),
      perPage: parseInt(perPage),
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

