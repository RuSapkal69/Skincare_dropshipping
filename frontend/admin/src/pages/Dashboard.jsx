// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import SalesOverview from '../components/dashboard/SalesOverview';
import SalesChart from '../components/charts/SalesChart';
import RecentOrders from '../components/dashboard/RecentOrders';
import TopProducts from '../components/dashboard/TopProducts';
import InventoryStatus from '../components/dashboard/InventoryStatus';
import OrdersChart from '../components/charts/OrdersChart';
import ProductChart from '../components/charts/ProductChart';
import WorldMapChart from '../components/charts/WorldMapChart';
import api from '../utils/api';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Get dashboard stats
        const response = await api.get('/api/admin/stats', {
          params: {
            compareWithPrevious: 'true'
          }
        });
        
        if (response.data.success) {
          setDashboardData(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  if (error) {
    return (
      <div className="p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-md">
        <p>{error}</p>
        <button 
          className="mt-2 text-sm underline"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">Welcome to your admin dashboard</p>
      </div>
      
      <SalesOverview data={dashboardData} loading={loading} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart data={dashboardData} loading={loading} />
        <OrdersChart data={dashboardData} loading={loading} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOrders orders={dashboardData?.recentOrders} loading={loading} />
        <TopProducts products={dashboardData?.topSellingProducts} loading={loading} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProductChart 
          data={dashboardData?.productsByCategory} 
          title="Products by Category"
          loading={loading} 
        />
        <InventoryStatus products={dashboardData?.topSellingProducts} loading={loading} />
      </div>
      
      <div className="h-[500px]">
        <WorldMapChart data={dashboardData} loading={loading} />
      </div>
    </div>
  );
};

export default Dashboard;