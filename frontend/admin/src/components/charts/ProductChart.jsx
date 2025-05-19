// src/components/charts/ProductChart.jsx
import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import Card from '../common/Card';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

const ProductChart = ({ data, title = 'Product Distribution', loading }) => {
  if (loading) {
    return (
      <Card title={title}>
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </Card>
    );
  }
  
  // Generate random colors for chart
  const generateColors = (count) => {
    const colors = [];
    const backgroundColors = [];
    
    for (let i = 0; i < count; i++) {
      const r = Math.floor(Math.random() * 200);
      const g = Math.floor(Math.random() * 200);
      const b = Math.floor(Math.random() * 200);
      
      colors.push(`rgba(${r}, ${g}, ${b}, 1)`);
      backgroundColors.push(`rgba(${r}, ${g}, ${b}, 0.2)`);
    }
    
    return { colors, backgroundColors };
  };
  
  // Prepare chart data
  const prepareChartData = () => {
    if (!data || data.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [
          {
            data: [1],
            backgroundColor: ['#e0e0e0'],
            borderColor: ['#e0e0e0'],
            borderWidth: 1
          }
        ]
      };
    }
    
    const labels = data.map(item => item._id);
    const values = data.map(item => item.count);
    
    const { colors, backgroundColors } = generateColors(labels.length);
    
    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: backgroundColors,
          borderColor: colors,
          borderWidth: 1
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
        position: 'bottom',
        labels: {
          boxWidth: 12,
          padding: 15
        }
      }
    }
  };
  
  return (
    <Card title={title}>
      <div className="h-64">
        {data && data.length > 0 ? (
          <Pie data={chartData} options={chartOptions} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            No data available
          </div>
        )}
      </div>
    </Card>
  );
};

export default ProductChart;