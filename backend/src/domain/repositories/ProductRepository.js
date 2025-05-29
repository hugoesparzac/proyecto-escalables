/**
 * Product Repository Interface
 * Defines the contract for product data operations
 */
class ProductRepository {
  /**
   * Create a new product
   * @param {Object} productData - Product data
   * @returns {Promise<Object>} Created product
   */
  async create(productData) {
    throw new Error('Method not implemented');
  }

  /**
   * Find a product by ID
   * @param {string} id - Product ID
   * @returns {Promise<Object|null>} Product or null if not found
   */
  async findById(id) {
    throw new Error('Method not implemented');
  }

  /**
   * Find a product by slug
   * @param {string} slug - Product slug
   * @returns {Promise<Object|null>} Product or null if not found
   */
  async findBySlug(slug) {
    throw new Error('Method not implemented');
  }

  /**
   * Find products by category
   * @param {string} categoryId - Category ID
   * @param {Object} options - Query options (limit, skip, sort)
   * @returns {Promise<Array>} Array of products
   */
  async findByCategory(categoryId, options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Find products with filters
   * @param {Object} filters - Search filters
   * @param {Object} options - Query options (limit, skip, sort)
   * @returns {Promise<{products: Array, total: number}>} Products and total count
   */
  async findWithFilters(filters = {}, options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Search products by text
   * @param {string} query - Search query
   * @param {Object} options - Query options (limit, skip, sort)
   * @returns {Promise<{products: Array, total: number}>} Products and total count
   */
  async searchProducts(query, options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Get featured products
   * @param {number} limit - Number of products to return
   * @returns {Promise<Array>} Array of featured products
   */
  async getFeatured(limit = 10) {
    throw new Error('Method not implemented');
  }

  /**
   * Get products on sale
   * @param {Object} options - Query options (limit, skip, sort)
   * @returns {Promise<Array>} Array of products on sale
   */
  async getOnSale(options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Get low stock products
   * @param {number} threshold - Stock threshold
   * @returns {Promise<Array>} Array of low stock products
   */
  async getLowStock(threshold = 10) {
    throw new Error('Method not implemented');
  }

  /**
   * Update a product
   * @param {string} id - Product ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated product
   */
  async update(id, updateData) {
    throw new Error('Method not implemented');
  }

  /**
   * Delete a product
   * @param {string} id - Product ID
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async delete(id) {
    throw new Error('Method not implemented');
  }

  /**
   * Update product stock
   * @param {string} id - Product ID
   * @param {number} quantity - Quantity to add/subtract
   * @returns {Promise<Object>} Updated product
   */
  async updateStock(id, quantity) {
    throw new Error('Method not implemented');
  }

  /**
   * Bulk update stock for multiple products
   * @param {Array} updates - Array of {id, quantity} objects
   * @returns {Promise<Array>} Array of updated products
   */
  async bulkUpdateStock(updates) {
    throw new Error('Method not implemented');
  }

  /**
   * Check if products exist and are available
   * @param {Array} productIds - Array of product IDs
   * @returns {Promise<Array>} Array of available products
   */
  async checkAvailability(productIds) {
    throw new Error('Method not implemented');
  }

  /**
   * Get products by IDs
   * @param {Array} ids - Array of product IDs
   * @returns {Promise<Array>} Array of products
   */
  async findByIds(ids) {
    throw new Error('Method not implemented');
  }

  /**
   * Count products by category
   * @param {string} categoryId - Category ID
   * @returns {Promise<number>} Number of products
   */
  async countByCategory(categoryId) {
    throw new Error('Method not implemented');
  }
}

module.exports = ProductRepository;