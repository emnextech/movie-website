/**
 * Extract movies from various API response structures
 * Handles different Moviebox API response formats
 */
export const extractMovies = (data, path = 'items') => {
  if (!data) return [];

  // Direct array
  if (Array.isArray(data)) {
    return data;
  }

  // Try common paths
  const paths = [
    path,
    'items',
    'subjects',
    'data.items',
    'data.subjects',
    'sections[0].items',
    'sections[0].subjects',
  ];

  for (const p of paths) {
    const value = getNestedValue(data, p);
    if (Array.isArray(value) && value.length > 0) {
      return value;
    }
  }

  // Try to find any array in the data
  const findArray = (obj) => {
    if (Array.isArray(obj)) return obj;
    if (typeof obj !== 'object' || obj === null) return null;
    
    for (const key in obj) {
      if (Array.isArray(obj[key]) && obj[key].length > 0) {
        return obj[key];
      }
      const nested = findArray(obj[key]);
      if (nested) return nested;
    }
    return null;
  };

  return findArray(data) || [];
};

/**
 * Get nested value from object using dot notation or array notation
 */
const getNestedValue = (obj, path) => {
  const parts = path.split(/[\.\[\]]/).filter(p => p);
  let current = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return null;
    current = current[part];
  }
  return current;
};

/**
 * Extract sections from homepage data
 */
export const extractSections = (data) => {
  if (!data) return [];

  // Direct sections array
  if (data.sections && Array.isArray(data.sections)) {
    return data.sections;
  }

  // Nested in data
  if (data.data?.sections && Array.isArray(data.data.sections)) {
    return data.data.sections;
  }

  // Try to find sections anywhere
  const findSections = (obj) => {
    if (Array.isArray(obj) && obj.length > 0 && obj[0]?.items) {
      return obj;
    }
    if (typeof obj !== 'object' || obj === null) return null;
    
    if (obj.sections) return obj.sections;
    
    for (const key in obj) {
      const nested = findSections(obj[key]);
      if (nested) return nested;
    }
    return null;
  };

  return findSections(data) || [];
};

