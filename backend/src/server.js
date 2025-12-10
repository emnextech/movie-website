import express from 'express';
import dotenv from 'dotenv';
import corsMiddleware from './middleware/cors.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(corsMiddleware);
app.use(apiLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// API routes
import homeRoutes from './routes/home.js';
import searchRoutes from './routes/search.js';
import trendingRoutes from './routes/trending.js';
import detailsRoutes from './routes/details.js';
import downloadRoutes from './routes/download.js';
import recommendationsRoutes from './routes/recommendations.js';

import { get } from './services/movieboxApi.js';

app.use('/api/home', homeRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/trending', trendingRoutes);
app.use('/api/rankings', trendingRoutes);
app.use('/api/movies', detailsRoutes);
app.use('/api/download', downloadRoutes);
app.use('/api/stream', downloadRoutes);
app.use('/api/recommendations', recommendationsRoutes);

// Popular searches route
app.get('/api/popular-searches', async (req, res, next) => {
  try {
    const data = await get('/wefeed-h5-bff/web/subject/everyone-search');
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
});

// Error handling
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Moviebox API Host: ${process.env.MOVIEBOX_API_HOST || 'https://h5.aoneroom.com'}`);
});

