# Movie Download Website - API Endpoints Guide

## Overview

This guide explains how to build a website for movies that allows users to download movies directly in their browsers using the Moviebox API. The architecture involves a **Node.js/Express backend** that acts as a proxy/wrapper around the Moviebox API, and a **React frontend** that provides the user interface.

## Base URL Configuration

The API uses multiple mirror hosts. The default base URL is:
- **Base URL**: `https://h5.aoneroom.com/` (default)
- **Alternative mirrors**: 
  - `https://movieboxapp.in/`
  - `https://moviebox.pk/`
  - `https://moviebox.ph/`
  - `https://moviebox.id/`
  - `https://v.moviebox.ph/`
  - `https://netnaija.video/`

You can set a custom host using the environment variable: `MOVIEBOX_API_HOST`

## Architecture Overview

### Frontend (React)
- User interface for browsing and searching movies
- Movie detail pages
- Download initiation interface
- Progress tracking for downloads

### Backend (Node.js/Express)
- Proxy server that communicates with Moviebox API
- Handles authentication headers and cookies
- Manages download requests
- Streams movie files to the browser
- Provides RESTful endpoints for the frontend

## API Endpoints

### 1. Homepage Content
**Endpoint**: `GET /wefeed-h5-bff/web/home`  
**Base URL**: `https://h5.aoneroom.com/wefeed-h5-bff/web/home`

**Purpose**: Fetches the landing page content including trending movies, popular content, and featured items.

**Headers Required**:
```
Accept: application/json
Accept-Language: en-US,en;q=0.5
User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:137.0) Gecko/20100101 Firefox/137.0
Referer: https://h5.aoneroom.com/
Host: h5.aoneroom.com
X-Client-Info: {"timezone":"Africa/Nairobi"}
```

**Response**: JSON object containing homepage sections with movies, TV series, and other content categories.

**How to Test**:
- Use Postman or curl to send a GET request
- Ensure all required headers are included
- The response should contain arrays of content items with metadata like title, poster, release date, etc.

---

### 2. Search Movies/TV Series
**Endpoint**: `POST /wefeed-h5-bff/web/subject/search`  
**Base URL**: `https://h5.aoneroom.com/wefeed-h5-bff/web/subject/search`

**Purpose**: Searches for movies, TV series, or all content types based on a keyword.

**Headers Required**: Same as Homepage endpoint

**Request Body** (JSON):
```json
{
  "keyword": "Avatar",
  "page": 1,
  "perPage": 24,
  "subjectType": 0
}
```

**Subject Type Values**:
- `0` = All (Movies, TV Series, Music)
- `1` = Movies only
- `2` = TV Series only
- `6` = Music only

**Response**: JSON object containing:
- `items`: Array of search results
- `pager`: Pagination information (hasMore, nextPage, page, perPage, totalCount)

**How to Test**:
- Send a POST request with the JSON body
- Try different keywords and subject types
- Test pagination by changing the `page` parameter
- Verify that results match the search query

---

### 3. Trending Content
**Endpoint**: `GET /wefeed-h5-bff/web/subject/trending`  
**Base URL**: `https://h5.aoneroom.com/wefeed-h5-bff/web/subject/trending`

**Purpose**: Retrieves trending movies and TV series.

**Query Parameters**:
- `page`: Page number (default: 0)
- `perPage`: Items per page (default: 18)

**Example**: `https://h5.aoneroom.com/wefeed-h5-bff/web/subject/trending?page=0&perPage=18`

**Response**: Similar structure to search results with trending items.

**How to Test**:
- Send GET request with query parameters
- Test pagination by incrementing the page number
- Verify that results show trending/popular content

---

### 4. Popular Searches
**Endpoint**: `GET /wefeed-h5-bff/web/subject/everyone-search`  
**Base URL**: `https://h5.aoneroom.com/wefeed-h5-bff/web/subject/everyone-search`

**Purpose**: Gets a list of popular search terms that users are currently searching for.

**Response**: JSON object with `everyoneSearch` array containing popular search items.

**How to Test**:
- Simple GET request without parameters
- Response should contain trending search keywords

---

### 5. Search Suggestions
**Endpoint**: `POST /wefeed-h5-bff/web/subject/search-suggest`  
**Base URL**: `https://h5.aoneroom.com/wefeed-h5-bff/web/subject/search-suggest`

**Purpose**: Provides autocomplete/search suggestions as users type.

**Request Body** (JSON):
```json
{
  "keyword": "Ava",
  "per_page": 10
}
```

**Response**: JSON object with suggested movie/TV series titles matching the partial keyword.

**How to Test**:
- Send POST request with partial keywords
- Test with different `per_page` values
- Verify suggestions are relevant to the input

---

### 6. Item Details (Movie/TV Series)
**Endpoint**: `GET /movies/{detailPath}`  
**Base URL**: `https://h5.aoneroom.com/movies/{detailPath}`

**Purpose**: Fetches detailed information about a specific movie or TV series, including cast, description, seasons (for TV series), and other metadata.

**Note**: This endpoint returns HTML content. The actual data is embedded in JSON within the HTML page, which needs to be extracted.

**How it Works**:
- The page URL format is: `/movies/{detailPath}?id={subjectId}`
- The HTML contains JSON data in script tags that needs to be parsed
- This provides comprehensive details including downloadable file information

**How to Test**:
- First, get a `detailPath` from a search result
- Fetch the HTML page
- Parse the JSON data from the HTML
- Extract movie details, cast, seasons, etc.

---

### 7. Downloadable Files Metadata
**Endpoint**: `GET /wefeed-h5-bff/web/subject/download`  
**Base URL**: `https://h5.aoneroom.com/wefeed-h5-bff/web/subject/download`

**Purpose**: Retrieves metadata about downloadable files for a movie or TV series episode, including video URLs in different qualities and subtitle files.

**Query Parameters**:
- `subjectId`: Unique identifier for the movie/TV series (required)
- `se`: Season number (use `0` for movies, actual season number for TV series)
- `ep`: Episode number (use `0` for movies, actual episode number for TV series)

**Headers Required**:
```
Referer: https://h5.aoneroom.com/movies/{detailPath}
Accept: application/json
User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:137.0) Gecko/20100101 Firefox/137.0
```

**Example**: `https://h5.aoneroom.com/wefeed-h5-bff/web/subject/download?subjectId=4006958073083480920&se=0&ep=0`

**Response**: JSON object containing:
- `mediaFiles`: Array of video files with different qualities (360P, 480P, 720P, 1080P)
- `captionFiles`: Array of subtitle files in different languages
- Each file includes: URL, size, format, resolution, language (for subtitles)

**How to Test**:
- First, search for a movie to get its `subjectId`
- Send GET request with the subjectId and appropriate season/episode
- **Important**: Include the Referer header pointing to the movie's detail page
- Verify response contains video URLs and subtitle URLs
- Test with different qualities to see available options

---

### 8. Stream Files Metadata
**Endpoint**: `GET /wefeed-h5-bff/web/subject/play`  
**Base URL**: `https://h5.aoneroom.com/wefeed-h5-bff/web/subject/play`

**Purpose**: Similar to download endpoint but optimized for streaming. Returns streamable file URLs.

**Query Parameters**: Same as download endpoint
- `subjectId`: Movie/TV series identifier
- `se`: Season number
- `ep`: Episode number

**Headers Required**: Same as download endpoint (including Referer)

**Response**: Similar structure to download endpoint but may contain streaming-optimized URLs.

**How to Test**:
- Use the same parameters as the download endpoint
- Compare response with download endpoint
- Verify URLs are suitable for streaming

---

### 9. Recommendations
**Endpoint**: `GET /wefeed-h5-bff/web/subject/detail-rec`  
**Base URL**: `https://h5.aoneroom.com/wefeed-h5-bff/web/subject/detail-rec`

**Purpose**: Gets recommended movies/TV series based on a specific item.

**Query Parameters**:
- `subjectId`: The reference movie/TV series ID
- `page`: Page number (default: 1)
- `perPage`: Items per page (default: 24)

**Response**: Similar to search results with recommended items.

**How to Test**:
- Use a subjectId from a search result
- Test pagination
- Verify recommendations are related to the reference item

---

### 10. Hot Movies and TV Series
**Endpoint**: `GET /wefeed-h5-bff/web/subject/search-rank`  
**Base URL**: `https://h5.aoneroom.com/wefeed-h5-bff/web/subject/search-rank`

**Purpose**: Retrieves hot/popular movies and TV series rankings.

**Response**: JSON object with ranked lists of popular content.

**How to Test**:
- Simple GET request
- Verify response contains ranked content

---

## Download Flow for Browser-Based Downloads

### Step-by-Step Process:

1. **User Searches for Movie**
   - Frontend sends search request to your Express backend
   - Backend calls: `POST /wefeed-h5-bff/web/subject/search`
   - Results displayed to user

2. **User Selects a Movie**
   - Frontend requests movie details from your backend
   - Backend fetches: `GET /movies/{detailPath}` and parses HTML
   - Backend extracts JSON data and returns to frontend

3. **User Initiates Download**
   - Frontend requests download metadata from your backend
   - Backend calls: `GET /wefeed-h5-bff/web/subject/download?subjectId={id}&se=0&ep=0`
   - Backend receives video URLs and subtitle URLs

4. **Backend Proxies Download**
   - Your Express backend creates a proxy endpoint (e.g., `/api/download/:subjectId`)
   - When user clicks download, frontend requests from your backend
   - Backend fetches the video file from Moviebox API
   - Backend streams the file to the browser with appropriate headers:
     ```
     Content-Type: video/mp4 (or appropriate type)
     Content-Disposition: attachment; filename="movie.mp4"
     Content-Length: [file size]
     ```

5. **Browser Downloads File**
   - Browser receives the streamed file
   - File is saved to user's download folder
   - Progress can be tracked using XMLHttpRequest or Fetch API with progress events

### Important Considerations:

- **CORS**: Your Express backend needs to handle CORS for your React frontend
- **Streaming**: For large files, implement chunked streaming to avoid memory issues
- **Progress Tracking**: Use streaming responses to track download progress
- **Error Handling**: Handle cases where downloads fail or URLs expire
- **Rate Limiting**: Implement rate limiting to avoid overwhelming the Moviebox API
- **Caching**: Cache search results and metadata to reduce API calls

## Testing Endpoints

### Using cURL:

**Test Homepage**:
```bash
curl -X GET "https://h5.aoneroom.com/wefeed-h5-bff/web/home" \
  -H "Accept: application/json" \
  -H "User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:137.0) Gecko/20100101 Firefox/137.0" \
  -H "Referer: https://h5.aoneroom.com/"
```

**Test Search**:
```bash
curl -X POST "https://h5.aoneroom.com/wefeed-h5-bff/web/subject/search" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:137.0) Gecko/20100101 Firefox/137.0" \
  -d '{"keyword":"Avatar","page":1,"perPage":24,"subjectType":1}'
```

**Test Download Metadata** (after getting subjectId from search):
```bash
curl -X GET "https://h5.aoneroom.com/wefeed-h5-bff/web/subject/download?subjectId=YOUR_SUBJECT_ID&se=0&ep=0" \
  -H "Accept: application/json" \
  -H "Referer: https://h5.aoneroom.com/movies/YOUR_DETAIL_PATH" \
  -H "User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:137.0) Gecko/20100101 Firefox/137.0"
```

### Using Postman:

1. Create a new request
2. Set the method (GET or POST)
3. Enter the full URL with base URL
4. Add all required headers in the Headers tab
5. For POST requests, add JSON body in the Body tab
6. Send request and verify response

### Using Browser DevTools:

1. Open browser DevTools (F12)
2. Go to Network tab
3. Visit the Moviebox website directly
4. Monitor network requests to see actual API calls
5. Copy request details (headers, body, URL) for your implementation

## Security and Best Practices

1. **Never expose API keys** (if any) in frontend code
2. **Always proxy requests** through your backend to hide the actual Moviebox API
3. **Implement authentication** if you want to restrict access
4. **Use HTTPS** for all API communications
5. **Validate and sanitize** all user inputs
6. **Handle errors gracefully** with user-friendly messages
7. **Implement request timeouts** to prevent hanging requests
8. **Monitor API usage** to detect abuse

## Summary

Your Express backend will act as a middleware layer that:
- Receives requests from your React frontend
- Adds necessary headers and cookies
- Makes requests to Moviebox API endpoints
- Processes and formats responses
- Streams download files to the browser
- Handles errors and edge cases

The React frontend will:
- Provide a user-friendly interface
- Display search results and movie details
- Initiate download requests
- Show download progress
- Handle user interactions

This architecture ensures security, maintainability, and a good user experience while leveraging the Moviebox API for movie downloads.

