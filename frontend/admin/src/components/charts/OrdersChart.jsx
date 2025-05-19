// src/components/charts/OrdersChart.jsx
import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import Card from '../common/Card';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const OrdersChart = ({ data, loading }) => {
  if (loading) {
    return (
      <Card title="Orders by Status">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </Card>
    );
  }
  
  // Prepare chart data
  const prepareChartData = () => {
    if (!data || !data.ordersByStatus || data.ordersByStatus.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [
          {
            label: 'Orders',
            data: [0],
            backgroundColor: '#e0e0e0'
          }
        ]
      };
    }
    
    // Define status order and colors
    const statusOrder = ['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'];
    const statusColors = {
      pending: '#FCD34D',    // Yellow
      processing: '#60A5FA', // Blue
      shipped: '#818CF8',    // Indigo
      delivered: '#34D399',  // Green
      completed: '#10B981',  // Emerald
      cancelled: '#EF4444'   // Red
    };
    
    // Sort data by status order
    const sortedData = [...data.ordersByStatus].sort((a, b) => {
      return statusOrder.indexOf(a._id) - statusOrder.indexOf(b._id);
    });
    
    const labels = sortedData.map(item => item._id.charAt(0).toUpperCase() + item._id.slice(1));
    const values = sortedData.map(item => item.count);
    const colors = sortedData.map(item => statusColors[item._id] || '#CBD5E1');
    
    return {
      labels,
      datasets: [
        {
          label: 'Orders',
          data: values,
          backgroundColor: colors
        }
      ]
    };
  };
  
  const chartData = prepareChartData();
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };
  
  return (
    <Card title="Orders by Status">
      <div className="h-64">
        {data && data.ordersByStatus && data.ordersByStatus.length > 0 ? (
          <Bar data={chartData} options={chartOptions} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            No order status data available
          </div>
        )}
      </div>
    </Card>
  );
};

export default OrdersChart;