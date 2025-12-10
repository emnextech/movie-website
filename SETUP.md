# Setup Guide

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## Installation

1. Install root dependencies:
```bash
npm install
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

## Environment Configuration

Create a `.env` file in the `backend` directory:

```env
PORT=3001
MOVIEBOX_API_HOST=https://h5.aoneroom.com
FRONTEND_URL=http://localhost:5173
```

## Running the Application

### Option 1: Run Both Servers Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Option 2: Run Both from Root (if concurrently is installed)

```bash
npm run dev
```

## Accessing the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

## Project Structure

```
movie-website/
├── backend/          # Node.js/Express backend
│   ├── src/
│   │   ├── routes/   # API route handlers
│   │   ├── services/ # Moviebox API client
│   │   ├── middleware/ # Express middleware
│   │   └── utils/    # Utility functions
│   └── package.json
├── frontend/         # React frontend
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── pages/     # Page components
│   │   ├── services/  # API service layer
│   │   ├── hooks/     # Custom React hooks
│   │   └── utils/     # Utility functions
│   └── package.json
└── README.md         # API documentation
```

## Features

- Homepage with trending and popular content
- Search functionality with autocomplete
- Movie/TV series detail pages
- Download functionality with progress tracking
- Quality selection (360P, 480P, 720P, 1080P)
- Recommendations
- Responsive design with Tailwind CSS

## Troubleshooting

### Backend not starting
- Check if port 3001 is available
- Verify `.env` file exists in backend directory
- Check Node.js version (should be v18+)

### Frontend not connecting to backend
- Ensure backend is running on port 3001
- Check CORS configuration in backend
- Verify `FRONTEND_URL` in backend `.env` matches frontend URL

### API errors
- Verify `MOVIEBOX_API_HOST` is correct
- Check network connectivity
- Some endpoints may require specific headers (already configured)

