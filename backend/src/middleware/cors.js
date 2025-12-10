import cors from 'cors';

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'Range', // For resumable downloads
    'If-Range', // For conditional range requests
    'Accept-Ranges', // To indicate range support
  ],
  exposedHeaders: [
    'Content-Range', // Expose range information
    'Accept-Ranges', // Expose range support
    'Content-Length', // Expose content length
    'Content-Disposition', // Expose filename
  ],
};

export default cors(corsOptions);

