/**
 * Normalize product data from different dropshipping APIs
 * @param {Object} product - Raw product data from API
 * @param {String} source - Source API (GlowRoad, Spocket, etc.)
 * @param {String} origin - Product origin (India, Global)
 * @returns {Object} - Normalized product data
 */
export function normalizeProduct(product, source, origin) {
  // Common normalized structure
  const normalized = {
    source,
    origin,
    createdAt: new Date(),
    updatedAt: new Date(),
    isAvailable: true
  };

  // Normalize based on source
  if (source === 'GlowRoad') {
    return {
      ...normalized,
      id: `gr-${product.id}`,
      sourceId: product.id,
      title: product.title,
      brand: product.brand || 'Unknown',
      price: product.price,
      currency: 'INR',
      image: product.image_url,
      description: product.description,
      rating: product.rating || 0,
      category: product.category,
      subcategory: product.subcategory || '',
      tags: product.tags || [],
      inventory: product.stock || 0
    };
  } else if (source === 'Spocket') {
    return {
      ...normalized,
      id: `sp-${product.id}`,
      sourceId: product.id,
      title: product.name,
      brand: product.vendor || 'Unknown',
      price: product.retail_price,
      currency: 'USD',
      image: product.image_url,
      description: product.description,
      rating: product.rating || 0,
      category: product.category,
      subcategory: product.subcategory || '',
      tags: product.tags || [],
      inventory: product.inventory || 0
    };
  } else if (source === 'CJDropshipping') {
    return {
      ...normalized,
      id: `cj-${product.pid}`,
      sourceId: product.pid,
      title: product.productNameEn,
      brand: product.brand || 'Unknown',
      price: product.sellPrice,
      currency: 'USD',
      image: product.productImage,
      description: product.productDescription || '',
      rating: 0,
      category: product.categoryName || 'Other',
      subcategory: '',
      tags: [],
      inventory: product.stock || 0
    };
  }

  // Default case
  return normalized;
}