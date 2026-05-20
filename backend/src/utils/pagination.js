/**
 * Utility to handle pagination parameters and format paginated responses.
 */

/**
 * Extracts pagination parameters from the query.
 * @param {Object} query - The req.query object.
 * @returns {Object} { limit, offset, page }
 */
function getPaginationParams(query) {
  // Support both Spanish and English parameter names
  const pageParam = query.page || query.pagina || 1;
  const limitParam = query.limit || query.limite || 10;

  let page = parseInt(pageParam, 10);
  let limit = parseInt(limitParam, 10);

  // Fallbacks if they are invalid numbers or negative
  if (isNaN(page) || page < 1) {
    page = 1;
  }
  if (isNaN(limit) || limit < 1) {
    limit = 10;
  }

  const offset = (page - 1) * limit;

  return { limit, offset, page };
}

/**
 * Formats the response with pagination metadata.
 * @param {Array} items - The list of items retrieved for the page.
 * @param {number} totalCount - Total items in database matching filters.
 * @param {number} page - Current page number.
 * @param {number} limit - Max items per page.
 * @returns {Object} Paginated response structure.
 */
function buildPaginatedResponse(items, totalCount, page, limit) {
  const totalPages = Math.ceil(totalCount / limit);

  return {
    totalItems: totalCount,
    totalPages: totalPages,
    currentPage: page,
    limit: limit,
    retrievedCount: items.length, // "cantidad de objetos traidos"
    items: items
  };
}

module.exports = {
  getPaginationParams,
  buildPaginatedResponse
};
