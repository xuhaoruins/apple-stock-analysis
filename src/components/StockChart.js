import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area
} from 'recharts';

const StockChart = ({ data }) => {
  const [chartType, setChartType] = useState('line');
  
  // Prepare data for chart - take only every n-th data point for better visibility
  // depending on the amount of data
  const prepareChartData = () => {
    let step = 1;
    
    if (data.length > 500) step = 10;
    else if (data.length > 250) step = 5;
    else if (data.length > 100) step = 2;
    
    return data.filter((_, index) => index % step === 0);
  };
  
  const chartData = prepareChartData();
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getFullYear().toString().substr(-2)}`;
  };
  
  const renderChart = () => {
    return (
      <ResponsiveContainer width="100%" height={500}>
        <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate}
            angle={-45}
            textAnchor="end"
            height={70}
          />
          <YAxis 
            yAxisId="left"
            domain={['auto', 'auto']}
            label={{ value: 'Price ($)', angle: -90, position: 'insideLeft' }}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            domain={['auto', 'auto']}
            label={{ value: 'Volume', angle: 90, position: 'insideRight' }}
          />
          <Tooltip 
            labelFormatter={(label) => `Date: ${label}`} 
            formatter={(value) => [`$${value.toFixed(2)}`, 'Price']}
          />
          <Legend verticalAlign="top" wrapperStyle={{ lineHeight: '40px' }} />
          
          {chartType === 'line' && (
            <>
              <Line 
                type="monotone" 
                dataKey="close" 
                name="Closing Price" 
                stroke="#007aff" 
                strokeWidth={2}
                yAxisId="left"
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="open" 
                name="Opening Price" 
                stroke="#4cd964" 
                strokeWidth={1}
                yAxisId="left" 
                dot={false}
              />
            </>
          )}
          
          {chartType === 'candlestick' && (
            <>
              <Line 
                type="monotone" 
                dataKey="high" 
                name="High" 
                stroke="#ff9500" 
                strokeWidth={1}
                yAxisId="left"
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="low" 
                name="Low" 
                stroke="#ff3b30" 
                strokeWidth={1}
                yAxisId="left"
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="close" 
                name="Close" 
                stroke="#007aff" 
                strokeWidth={2}
                yAxisId="left"
                dot={false}
              />
            </>
          )}
          
          <Bar 
            dataKey="volume" 
            name="Volume" 
            fill="#8e8e93" 
            opacity={0.5}
            yAxisId="right"
          />
        </ComposedChart>
      </ResponsiveContainer>
    );
  };
  
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        <button 
          onClick={() => setChartType('line')}
          className={chartType === 'line' ? 'active' : ''}
          style={{ marginRight: '10px', padding: '5px 10px' }}
        >
          Line Chart
        </button>
        <button 
          onClick={() => setChartType('candlestick')}
          className={chartType === 'candlestick' ? 'active' : ''}
          style={{ padding: '5px 10px' }}
        >
          Advanced View
        </button>
      </div>
      {renderChart()}
    </div>
  );
};

export default StockChart;