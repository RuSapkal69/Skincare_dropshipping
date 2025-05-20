// src/components/dashboard/RecentOrders.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import Badge from '../common/Badge';
// import { formatCurrency, formatDate } from '../../utils/formatters';

const getStatusBadge = (status) => {
  const statusMap = {
    pending: { variant: 'warning', label: 'Pending' },
    processing: { variant: 'info', label: 'Processing' },
    shipped: { variant: 'primary', label: 'Shipped' },
    delivered: { variant: 'success', label: 'Delivered' },
    completed: { variant: 'success', label: 'Completed' },
    cancelled: { variant: 'danger', label: 'Cancelled' }
  };
  
  const { variant, label } = statusMap[status] || { variant: 'secondary', label: status };
  
  return <Badge variant={variant}>{label}</Badge>;
};

const RecentOrders = ({ orders, loading }) => {
  if (loading) {
    return (
      <Card title="Recent Orders">
        <div className="animate-pulse">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="py-3 border-b dark:border-gray-700 last:border-0">
              <div className="flex justify-between">
                <div className="w-1/3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded mt-2"></div>
                </div>
                <div className="w-1/4">
                  <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="w-1/5">
                  <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }
  
  return (
    <Card 
      title="Recent Orders"
      footer={
        <div className="text-center">
          <Link to="/orders" className="text-primary hover:underline">
            View All Orders
          </Link>
        </div>
      }
    >
      {orders && orders.length > 0 ? (
        <div className="divide-y dark:divide-gray-700">
          {orders.map((order) => (
            <div key={order._id} className="py-3 first:pt-0 last:pb-0">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                <div>
                  <Link to={`/orders/${order._id}`} className="font-medium text-primary hover:underline">
                    Order #{order._id.substring(order._id.length - 8)}
                  </Link>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {order.customerName} • {formatDate(order.createdAt)}
                  </p>
                </div>
                
                <div className="mt-2 sm:mt-0 flex items-center justify-between sm:justify-end sm:space-x-4">
                  <span className="text-sm font-medium">
                    {formatCurrency(order.totalAmount)}
                  </span>
                  <div className="ml-4">
                    {getStatusBadge(order.status)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          No recent orders
        </div>
      )}
    </Card>
  );
};

export default RecentOrders;