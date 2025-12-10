import * as cheerio from 'cheerio';

/**
 * Extract JSON data from movie detail HTML page
 * Moviebox embeds JSON data in script tags
 * @param {string} html - HTML content from movie detail page
 * @returns {object} Parsed movie data
 */
export const parseMovieDetailHTML = (html) => {
  try {
    const $ = cheerio.load(html);
    
    // Find script tags that contain JSON data
    // Moviebox typically embeds data in a script tag with id="__NEXT_DATA__" or similar
    let movieData = null;
    let rawJsonData = null;
    
    // Try to find JSON in script tags
    $('script').each((i, elem) => {
      const scriptContent = $(elem).html();
      if (scriptContent) {
        // Look for JSON-like patterns
        try {
          // Try to find window.__INITIAL_STATE__ or similar patterns
          const stateMatch = scriptContent.match(/window\.__INITIAL_STATE__\s*=\s*({.+?});/s);
          if (stateMatch) {
            rawJsonData = JSON.parse(stateMatch[1]);
            return false; // Break the loop
          }
          
          // Try to find JSON.parse patterns
          const parseMatch = scriptContent.match(/JSON\.parse\(['"](.+?)['"]\)/);
          if (parseMatch) {
            try {
              const decoded = parseMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n');
              rawJsonData = JSON.parse(decoded);
              return false;
            } catch (e) {
              // Continue searching
            }
          }
          
          // Try to find __NEXT_DATA__ pattern (Next.js)
          const nextDataMatch = scriptContent.match(/<script[^>]*id="__NEXT_DATA__"[^>]*>(.+?)<\/script>/s);
          if (nextDataMatch) {
            try {
              rawJsonData = JSON.parse(nextDataMatch[1]);
              return false;
            } catch (e) {
              // Continue searching
            }
          }
          
          // Try direct JSON in script tag with subjectId
          const jsonMatch = scriptContent.match(/\{[\s\S]*"subjectId"[\s\S]*\}/);
          if (jsonMatch) {
            try {
              rawJsonData = JSON.parse(jsonMatch[0]);
              return false;
            } catch (e) {
              // Continue searching
            }
          }
          
          // Try to find any large JSON object that might contain subject data
          const largeJsonMatch = scriptContent.match(/\{[\s\S]{100,}[\s\S]*"subject"[\s\S]*\}/);
          if (largeJsonMatch) {
            try {
              rawJsonData = JSON.parse(largeJsonMatch[0]);
              return false;
            } catch (e) {
              // Continue searching
            }
          }
        } catch (e) {
          // Continue to next script tag
        }
      }
    });
    
    // Extract subject data from parsed JSON
    if (rawJsonData) {
      // Try various paths to find the subject data
      const possiblePaths = [
        rawJsonData.subject,
        rawJsonData.data?.subject,
        rawJsonData.props?.pageProps?.subject,
        rawJsonData.pageProps?.subject,
        rawJsonData.initialState?.subject,
        rawJsonData.state?.subject,
        rawJsonData.movie,
        rawJsonData.data?.movie,
      ];
      
      for (const path of possiblePaths) {
        if (path && typeof path === 'object') {
          movieData = path;
          break;
        }
      }
      
      // If no subject found but we have the raw data, use it
      if (!movieData && rawJsonData) {
        movieData = rawJsonData;
      }
    }
    
    // If no JSON found in scripts, try to extract from meta tags or other elements
    if (!movieData) {
      // Extract basic info from meta tags
      const title = $('meta[property="og:title"]').attr('content') || $('title').text();
      const description = $('meta[property="og:description"]').attr('content') || '';
      const image = $('meta[property="og:image"]').attr('content') || '';
      
      // Try to extract more data from the page structure
      const pageTitle = $('h1').first().text().trim() || title;
      const pageDescription = $('meta[name="description"]').attr('content') || description;
      
      // Try to extract additional info from page elements
      const genreElements = $('[class*="genre"], [data-genre]').map((i, el) => $(el).text().trim()).get();
      const genre = genreElements.length > 0 ? genreElements.join(',') : '';
      
      // Try to find rating
      const ratingElement = $('[class*="rating"], [class*="imdb"], [data-rating]').first();
      const rating = ratingElement.text().trim() || '';
      
      // Try to find duration
      const durationElement = $('[class*="duration"], [class*="runtime"], [data-duration]').first();
      const durationText = durationElement.text().trim() || '';
      
      movieData = {
        title: pageTitle,
        description: pageDescription,
        image,
        genre: genre || undefined,
        imdbRatingValue: rating || undefined,
        duration: durationText || undefined,
        // Try to extract subjectId from URL or data attributes
        subjectId: extractSubjectId(html),
      };
    }
    
    return movieData;
  } catch (error) {
    console.error('Error parsing HTML:', error);
    throw new Error('Failed to parse movie detail HTML');
  }
};

/**
 * Extract subjectId from HTML
 * @param {string} html - HTML content
 * @returns {string|null} Subject ID if found
 */
const extractSubjectId = (html) => {
  // Try to find subjectId in various patterns
  const patterns = [
    /subjectId["']?\s*[:=]\s*["']?(\d+)/i,
    /id["']?\s*[:=]\s*["']?(\d+)/i,
    /data-subject-id=["'](\d+)/i,
  ];
  
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
};

/**
 * Extract JSON from a specific script tag by ID or content
 * @param {string} html - HTML content
 * @param {string} scriptId - Optional script tag ID to search for
 * @returns {object|null} Parsed JSON data
 */
export const extractJSONFromScript = (html, scriptId = null) => {
  try {
    const $ = cheerio.load(html);
    
    let targetScript = null;
    
    if (scriptId) {
      targetScript = $(`script#${scriptId}`).html();
    } else {
      // Find the first script tag with JSON-like content
      $('script').each((i, elem) => {
        const content = $(elem).html();
        if (content && (content.includes('{') || content.includes('['))) {
          targetScript = content;
          return false; // Break
        }
      });
    }
    
    if (!targetScript) {
      return null;
    }
    
    // Try to extract and parse JSON
    const jsonMatch = targetScript.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting JSON from script:', error);
    return null;
  }
};

export default {
  parseMovieDetailHTML,
  extractJSONFromScript,
};

