// src/components/dashboard/InventoryStatus.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import Badge from '../common/Badge';

const getStockBadge = (inventory) => {
  if (inventory === 0) {
    return <Badge variant="danger">Out of Stock</Badge>;
  } else if (inventory < 5) {
    return <Badge variant="warning">Low Stock</Badge>;
  } else {
    return <Badge variant="success">In Stock</Badge>;
  }
};

const InventoryStatus = ({ products, loading }) => {
  if (loading) {
    return (
      <Card title="Inventory Status">
        <div className="animate-pulse">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-center py-3 border-b dark:border-gray-700 last:border-0">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-2"></div>
              </div>
              <div className="w-20">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }
  
  // Sort products by inventory (low to high)
  const sortedProducts = [...(products || [])].sort((a, b) => a.inventory - b.inventory);
  
  return (
    <Card 
      title="Inventory Status"
      footer={
        <div className="text-center">
          <Link to="/products" className="text-primary hover:underline">
            Manage Inventory
          </Link>
        </div>
      }
    >
      {sortedProducts && sortedProducts.length > 0 ? (
        <div className="divide-y dark:divide-gray-700">
          {sortedProducts.slice(0, 5).map((product) => (
            <div key={product._id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <div className="flex-1 min-w-0">
                <Link to={`/products/${product._id}`} className="font-medium text-primary hover:underline truncate block">
                  {product.title}
                </Link>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {product.inventory} units available
                </p>
              </div>
              
              <div className="ml-4">
                {getStockBadge(product.inventory)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          No inventory data available
        </div>
      )}
    </Card>
  );
};

export default InventoryStatus;