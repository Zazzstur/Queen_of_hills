export const sanitizeSlug = (str) => {
  return (str || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-');        // Replace spaces with hyphens
};

export const generateRouteUrl = (route, capacity = null) => {
  const cleanType = sanitizeSlug(route.type || 'route');
  const cleanOrigin = sanitizeSlug(route.origin);
  const cleanDest = sanitizeSlug(route.destination);

  let url = `/route/${cleanType}_${cleanOrigin}-${cleanDest}`;
  
  if (capacity) {
    url += `/${sanitizeSlug(capacity)}`;
  }

  return url;
};

// Instead of extracting by parsing the string, we will match against existing routes
// by generating their slug and seeing if it matches the requested slug.
export const matchRouteBySlug = (routes, slug) => {
  if (!slug || !routes || routes.length === 0) return null;

  return routes.find(route => {
    const cleanType = sanitizeSlug(route.type || 'route');
    const cleanOrigin = sanitizeSlug(route.origin);
    const cleanDest = sanitizeSlug(route.destination);
    
    const expectedSlug = `${cleanType}_${cleanOrigin}-${cleanDest}`;
    return expectedSlug === slug;
  });
};

export const parseCapacitySlug = (capacitySlug) => {
  if (!capacitySlug) return '';
  
  // Map back common slugs to original values used in the app
  const mapping = {
    '4-seater': '4 Seater',
    '6-seater-luxury-suv': '6 Seater Luxury SUV',
    '6-10-seater-suv': '6-10 Seater SUV',
  };
  
  return mapping[capacitySlug] || capacitySlug.replace(/-/g, ' ');
};
