// src/components/dashboard/TopProducts.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
// import { formatCurrency } from '../../utils/formatters';

const TopProducts = ({ products, loading }) => {
  if (loading) {
    return (
      <Card title="Top Selling Products">
        <div className="animate-pulse">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-center py-3 border-b dark:border-gray-700 last:border-0">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="ml-4 flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-2"></div>
              </div>
              <div className="w-20">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }
  
  return (
    <Card 
      title="Top Selling Products"
      footer={
        <div className="text-center">
          <Link to="/products" className="text-primary hover:underline">
            View All Products
          </Link>
        </div>
      }
    >
      {products && products.length > 0 ? (
        <div className="divide-y dark:divide-gray-700">
          {products.map((product) => (
            <div key={product._id} className="flex items-center py-3 first:pt-0 last:pb-0">
              <div className="w-12 h-12 rounded overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/48?text=No+Image';
                  }}
                />
              </div>
              
              <div className="ml-4 flex-1 min-w-0">
                <Link to={`/products/${product._id}`} className="font-medium text-primary hover:underline truncate block">
                  {product.title}
                </Link>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {product.totalSold} sold
                </p>
              </div>
              
              <div className="ml-4 text-right">
                <span className="font-medium">
                  {formatCurrency(product.totalRevenue)}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          No product data available
        </div>
      )}
    </Card>
  );
};

export default TopProducts;