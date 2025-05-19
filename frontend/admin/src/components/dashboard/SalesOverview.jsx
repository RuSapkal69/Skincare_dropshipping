// src/components/dashboard/SalesOverview.jsx
import React from 'react';
import Card from '../common/Card';
import { 
  CurrencyDollarIcon, 
  ShoppingBagIcon, 
  ShoppingCartIcon, 
  UsersIcon 
} from '@heroicons/react/24/outline';
import { formatCurrency } from '../../utils/formatters';

const StatCard = ({ title, value, icon, change, changeType }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex items-center">
        <div className="p-3 rounded-full bg-primary-light text-primary">
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-xl font-semibold">{value}</p>
        </div>
      </div>
      {change && (
        <div className="mt-2">
          <span className={`text-sm ${changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
            {changeType === 'increase' ? '↑' : '↓'} {change}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">vs last period</span>
        </div>
      )}
    </div>
  );
};

const SalesOverview = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 animate-pulse">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700"></div>
              <div className="ml-4">
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mt-2"></div>
              </div>
            </div>
            <div className="mt-2">
              <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Revenue"
        value={formatCurrency(data?.totalEarnings || 0)}
        icon={<CurrencyDollarIcon className="h-6 w-6" />}
        change={data?.growth?.revenue?.percentChange ? `${data.growth.revenue.percentChange.toFixed(2)}%` : null}
        changeType={data?.growth?.revenue?.percentChange > 0 ? 'increase' : 'decrease'}
      />
      
      <StatCard
        title="Total Orders"
        value={data?.totalOrders || 0}
        icon={<ShoppingCartIcon className="h-6 w-6" />}
      />
      
      <StatCard
        title="Total Products"
        value={data?.totalProducts || 0}
        icon={<ShoppingBagIcon className="h-6 w-6" />}
      />
      
      <StatCard
        title="Active Customers"
        value={data?.activeCustomers || 0}
        icon={<UsersIcon className="h-6 w-6" />}
      />
    </div>
  );
};

export default SalesOverview;