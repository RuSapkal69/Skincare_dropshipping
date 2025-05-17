import { connect, disconnect } from 'mongoose';
import { config } from 'dotenv';
import { getProducts } from '../services/glowroadService';
import { getProducts as _getProducts } from '../services/spocketService';
import { normalizeProduct } from '../utils/normalizer';
import { findOne, findOneAndUpdate, create } from '../models/Product';

// Load env vars
config({ path: '../.env' });

// Connect to database
connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const refreshProducts = async () => {
  try {
    console.log('Starting product refresh...');
    
    // Fetch products from GlowRoad (Indian products)
    console.log('Fetching products from GlowRoad...');
    const glowroadProducts = await getProducts();
    console.log(`Fetched ${glowroadProducts.length} products from GlowRoad`);
    
    // Fetch products from Spocket (Global products)
    console.log('Fetching products from Spocket...');
    const spocketProducts = await _getProducts();
    console.log(`Fetched ${spocketProducts.length} products from Spocket`);
    
    // Normalize products
    console.log('Normalizing products...');
    const normalizedGlowroadProducts = glowroadProducts.map(product => 
      normalizeProduct(product, 'GlowRoad', 'India')
    );
    
    const normalizedSpocketProducts = spocketProducts.map(product => 
      normalizeProduct(product, 'Spocket', 'Global')
    );
    
    // Combine products
    const allProducts = [...normalizedGlowroadProducts, ...normalizedSpocketProducts];
    console.log(`Total products to update: ${allProducts.length}`);
    
    // Update or insert products in database
    console.log('Updating database...');
    let updatedCount = 0;
    let newCount = 0;
    
    for (const product of allProducts) {
      const existingProduct = await findOne({ id: product.id });
      
      if (existingProduct) {
        await findOneAndUpdate(
          { id: product.id },
          { ...product, updatedAt: new Date() }
        );
        updatedCount++;
      } else {
        await create(product);
        newCount++;
      }
    }
    
    console.log(`Product refresh complete. Updated: ${updatedCount}, New: ${newCount}`);
    
    // Disconnect from database
    disconnect();
  } catch (error) {
    console.error('Error refreshing products:', error);
    disconnect();
    process.exit(1);
  }
};

// Run the refresh
refreshProducts();