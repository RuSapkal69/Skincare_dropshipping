import { get, post } from 'axios';

/**
 * Service to interact with GlowRoad API for Indian products
 */
export async function getProducts() {
  try {
    const response = await get(process.env.GLOWROAD_API_URL, {
      headers: {
        'Authorization': `Bearer ${process.env.GLOWROAD_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data.products || [];
  } catch (error) {
    console.error('Error fetching products from GlowRoad:', error.message);
    return [];
  }
}

/**
 * Get product details from GlowRoad
 */
export async function getProductDetails(productId) {
  try {
    const response = await get(`${process.env.GLOWROAD_API_URL}/${productId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.GLOWROAD_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data.product || null;
  } catch (error) {
    console.error('Error fetching product details from GlowRoad:', error.message);
    return null;
  }
}

/**
 * Place order on GlowRoad
 */
export async function placeOrder(orderData) {
  try {
    const response = await post(`${process.env.GLOWROAD_API_URL}/orders`, orderData, {
      headers: {
        'Authorization': `Bearer ${process.env.GLOWROAD_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error placing order on GlowRoad:', error.message);
    throw new Error('Failed to place order on GlowRoad');
  }
}