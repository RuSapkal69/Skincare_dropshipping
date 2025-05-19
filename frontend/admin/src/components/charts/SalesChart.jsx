// src/components/charts/SalesChart.jsx
import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import Card from '../common/Card';
import { formatCurrency } from '../../utils/formatters';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const SalesChart = ({ data, loading }) => {
  const [timeRange, setTimeRange] = useState('monthly');
  
  if (loading) {
    return (
      <Card title="Sales Overview">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </Card>
    );
  }
  
  // Prepare chart data based on selected time range
  const prepareChartData = () => {
    if (!data) return { labels: [], datasets: [] };
    
    let chartData = {
      labels: [],
      datasets: [
        {
          label: 'Sales',
          data: [],
          borderColor: '#4F46E5',
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
          tension: 0.3,
          fill: true
        }
      ]
    };
    
    if (timeRange === 'daily' && data.dailyEarnings) {
      chartData.labels = data.dailyEarnings.map(item => 
        `${item._id.month}/${item._id.day}`
      );
      chartData.datasets[0].data = data.dailyEarnings.map(item => item.total);
    } else if (timeRange === 'monthly' && data.monthlyEarnings) {
      const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      
      chartData.labels = data.monthlyEarnings.map(item => 
        months[item._id.month - 1]
      );
      chartData.datasets[0].data = data.monthlyEarnings.map(item => item.total);
    }
    
    return chartData;
  };
  
  const chartData = prepareChartData();
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return formatCurrency(context.parsed.y);
          }
        }
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
          callback: function(value) {
            return formatCurrency(value, { notation: 'compact' });
          }
        }
      }
    }
  };
  
  return (
    <Card 
      title={
        <div className="flex justify-between items-center">
          <span>Sales Overview</span>
          <div className="flex space-x-2">
            <button
              className={`px-3 py-1 text-xs rounded-md ${
                timeRange === 'daily'
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
              onClick={() => setTimeRange('daily')}
            >
              Daily
            </button>
            <button
              className={`px-3 py-1 text-xs rounded-md ${
                timeRange === 'monthly'
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
              onClick={() => setTimeRange('monthly')}
            >
              Monthly
            </button>
          </div>
        </div>
      }
    >
      <div className="h-64">
        {chartData.labels.length > 0 ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            No sales data available
          </div>
        )}
      </div>
    </Card>
  );
};

export default SalesChart;