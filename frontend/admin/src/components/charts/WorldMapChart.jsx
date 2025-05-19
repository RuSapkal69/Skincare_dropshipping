// src/components/charts/WorldMapChart.jsx
import React, { useState } from 'react';
import { ResponsiveChoropleth } from '@nivo/geo';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import Card from '../common/Card';
import { formatCurrency } from '../../utils/formatters';
import worldGeoData from '../../assets/data/world-countries.json';

const WorldMapChart = ({ data, loading }) => {
  const [selectedCountry, setSelectedCountry] = useState(null);
  
  if (loading) {
    return (
      <Card title="Sales by Region">
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </Card>
    );
  }
  
  // Prepare data for the map
  const mapData = data?.salesByCountry?.map(item => ({
    id: item._id,
    value: item.totalSales,
    orderCount: item.orderCount
  })) || [];
  
  // Find country details when selected
  const countryDetails = selectedCountry 
    ? data?.salesByCountry?.find(item => item._id === selectedCountry)
    : null;
  
  // Find states for selected country
  const stateData = selectedCountry
    ? data?.salesByState?.filter(item => item._id.country === selectedCountry)
    : [];
  
  return (
    <Card 
      title="Sales by Region"
      className="h-full"
    >
      <div className="h-96">
        {mapData.length > 0 ? (
          <ResponsiveChoropleth
            data={mapData}
            features={worldGeoData.features}
            margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
            colors="blues"
            domain={[0, Math.max(...mapData.map(d => d.value))]}
            unknownColor="#e0e0e0"
            label="properties.name"
            valueFormat={value => formatCurrency(value)}
            projectionScale={150}
            projectionTranslation={[0.5, 0.5]}
            projectionRotation={[0, 0, 0]}
            enableGraticule={false}
            borderWidth={0.5}
            borderColor="#152538"
            legends={[
              {
                anchor: 'bottom-left',
                direction: 'column',
                justify: true,
                translateX: 20,
                translateY: -20,
                itemsSpacing: 0,
                itemWidth: 94,
                itemHeight: 18,
                itemDirection: 'left-to-right',
                itemTextColor: '#777',
                itemOpacity: 0.85,
                symbolSize: 18,
                effects: [
                  {
                    on: 'hover',
                    style: {
                      itemTextColor: '#000',
                      itemOpacity: 1
                    }
                  }
                ]
              }
            ]}
            onClick={({ data }) => setSelectedCountry(data.id)}
            tooltip={({ feature }) => {
              const countryData = mapData.find(d => d.id === feature.id);
              
              if (!countryData) return null;
              
              return (
                <div className="bg-white dark:bg-gray-800 p-2 shadow-md rounded-md text-sm">
                  <strong>{feature.properties.name}</strong>
                  <div>Sales: {formatCurrency(countryData.value)}</div>
                  <div>Orders: {countryData.orderCount}</div>
                </div>
              );
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            No geographic sales data available
          </div>
        )}
      </div>
      
      {selectedCountry && countryDetails && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
          <h3 className="text-lg font-medium mb-2">{selectedCountry}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Sales</p>
              <p className="font-medium">{formatCurrency(countryDetails.totalSales)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Orders</p>
              <p className="font-medium">{countryDetails.orderCount}</p>
            </div>
          </div>
          
          {stateData.length > 0 && (
            <div className="mt-4">
              <h4 className="text-md font-medium mb-2">Top States</h4>
              <div className="space-y-2">
                {stateData.map((state, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span>{state._id.state || 'Unknown'}</span>
                    <span className="font-medium">{formatCurrency(state.totalSales)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <button
            className="mt-4 text-sm text-primary hover:underline"
            onClick={() => setSelectedCountry(null)}
          >
            Clear Selection
          </button>
        </div>
      )}
    </Card>
  );
};

export default WorldMapChart;