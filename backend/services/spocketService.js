import axios from 'axios';

/**
 * Service to interact with Spocket API for Global products
 */
export async function getProducts() {
  try {
    const response = await axios.get(process.env.SPOCKET_API_URL, {
      headers: {
        'Authorization': `Bearer ${process.env.SPOCKET_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data.products || [];
  } catch (error) {
    console.error('Error fetching products from Spocket:', error.message);
    return [];
  }
}

/**
 * Get product details from Spocket
 */
export async function getProductDetails(productId) {
  try {
    const response = await axios.get(`${process.env.SPOCKET_API_URL}/${productId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.SPOCKET_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data.product || null;
  } catch (error) {
    console.error('Error fetching product details from Spocket:', error.message);
    return null;
  }
}

/**
 * Place order on Spocket
 */
export async function placeOrder(orderData) {
  try {
    const response = await axios.post(`${process.env.SPOCKET_API_URL}/orders`, orderData, {
      headers: {
        'Authorization': `Bearer ${process.env.SPOCKET_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error placing order on Spocket:', error.message);
    throw new Error('Failed to place order on Spocket');
  }
}