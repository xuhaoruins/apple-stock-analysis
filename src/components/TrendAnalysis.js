import React, { useState, useEffect } from 'react';
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
  ReferenceLine
} from 'recharts';
import { fetchHistoricalData, analyzeStockTrends } from '../utils/dataService';

const TrendAnalysis = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState({ yearlyPerformance: [], trends: [], keyEvents: [] });
  const [selectedChart, setSelectedChart] = useState('price');
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const stockData = await fetchHistoricalData('AAPL', '2015-2020');
        setData(stockData);
        
        // Analyze the trends
        const trendAnalysis = analyzeStockTrends(stockData);
        setAnalysis(trendAnalysis);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load 2015-2020 data. Using 1980-1985 data instead.');
        
        try {
          // Fallback to original data
          const originalData = await fetchHistoricalData('AAPL', '1980-1985');
          setData(originalData);
          const trendAnalysis = analyzeStockTrends(originalData);
          setAnalysis(trendAnalysis);
          setLoading(false);
        } catch (fallbackError) {
          setError('Failed to load any stock data');
          setLoading(false);
        }
      }
    };
    
    loadData();
  }, []);
  
  // Prepare data for visualization
  const prepareChartData = () => {
    if (!data || data.length === 0) return [];
    
    let step = 1;
    
    // Take every n-th data point for better visualization
    if (data.length > 500) step = 20;
    else if (data.length > 250) step = 10;
    else if (data.length > 100) step = 3;
    
    return data
      .filter((_, index) => index % step === 0)
      .map(item => ({
        ...item,
        date: new Date(item.date).toLocaleDateString('en-US', { 
          year: '2-digit', 
          month: 'short'
        })
      }));
  };
  
  const chartData = prepareChartData();
  
  // Format large numbers
  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num;
  };
  
  const renderPriceChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="date"
          angle={-45}
          textAnchor="end"
          height={70}
          interval={Math.floor(chartData.length / 12)} // About 12 tick marks
        />
        <YAxis 
          yAxisId="left"
          domain={['auto', 'auto']}
          label={{ value: 'Price ($)', angle: -90, position: 'insideLeft' }}
        />
        <YAxis 
          yAxisId="right" 
          orientation="right" 
          domain={[0, 'dataMax']}
          label={{ value: 'Volume', angle: 90, position: 'insideRight' }}
        />
        <Tooltip 
          formatter={(value, name) => {
            if (name === 'Volume') return [formatNumber(value), name];
            return [`$${value.toFixed(2)}`, name];
          }}
        />
        <Legend verticalAlign="top" />
        <Line 
          type="monotone" 
          dataKey="close" 
          name="Closing Price" 
          stroke="#007aff" 
          strokeWidth={2}
          yAxisId="left"
          dot={false}
        />
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
  
  const renderPerformanceChart = () => {
    const performanceData = analysis.yearlyPerformance.map(year => ({
      year: year.year,
      performance: parseFloat(year.performance),
      startPrice: year.startPrice,
      endPrice: year.endPrice
    }));
    
    return (
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={performanceData} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="year" />
          <YAxis 
            label={{ value: 'Performance (%)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            formatter={(value, name) => {
              if (name === 'performance') return [`${value.toFixed(2)}%`, 'Yearly Return'];
              return [value, name];
            }}
            labelFormatter={label => `Year: ${label}`}
          />
          <Legend />
          <ReferenceLine y={0} stroke="#000" />
          <Bar 
            dataKey="performance" 
            name="Yearly Return" 
            fill={(entry) => entry.performance >= 0 ? '#4cd964' : '#ff3b30'}
            radius={[5, 5, 0, 0]}
          />
        </ComposedChart>
      </ResponsiveContainer>
    );
  };
  
  if (loading) {
    return <div className="chart-container">Loading 2015-2020 trend analysis...</div>;
  }
  
  if (error && !data.length) {
    return <div className="chart-container">Error: {error}</div>;
  }
  
  return (
    <div className="analysis-section">
      <h2>Apple Stock Trend Analysis (2015-2020)</h2>
      
      {error && <div className="alert alert-warning">{error}</div>}
      
      <div className="time-period-selector">
        <button 
          onClick={() => setSelectedChart('price')} 
          className={selectedChart === 'price' ? 'active' : ''}
        >
          Price History
        </button>
        <button 
          onClick={() => setSelectedChart('performance')} 
          className={selectedChart === 'performance' ? 'active' : ''}
        >
          Yearly Performance
        </button>
      </div>
      
      <div className="chart-container">
        {selectedChart === 'price' ? renderPriceChart() : renderPerformanceChart()}
      </div>
      
      <h3>Key Findings</h3>
      
      <div className="insights-list">
        {analysis.trends.map((trend, index) => (
          <div key={index} className="insight-card">
            <h3>{trend.trend === 'bullish' ? '📈 Bullish Trend' : '📉 Bearish Trend'}</h3>
            <p><strong>Period:</strong> {trend.period}</p>
            <p>{trend.description}</p>
          </div>
        ))}
      </div>
      
      <h3>Significant Market Events</h3>
      
      <div className="insights-list">
        {analysis.keyEvents.map((event, index) => (
          <div key={index} className="insight-card">
            <h3>{parseFloat(event.change) >= 0 ? '📈 Price Surge' : '📉 Price Drop'}</h3>
            <p><strong>Date:</strong> {event.date}</p>
            <p>{event.description}</p>
          </div>
        ))}
      </div>
      
      <h3>Yearly Performance Summary</h3>
      
      <table className="performance-table" style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ddd' }}>
            <th style={{ textAlign: 'left', padding: '10px' }}>Year</th>
            <th style={{ textAlign: 'right', padding: '10px' }}>Starting Price</th>
            <th style={{ textAlign: 'right', padding: '10px' }}>Ending Price</th>
            <th style={{ textAlign: 'right', padding: '10px' }}>Performance</th>
            <th style={{ textAlign: 'right', padding: '10px' }}>Volatility</th>
          </tr>
        </thead>
        <tbody>
          {analysis.yearlyPerformance.map((year, index) => (
            <tr 
              key={index} 
              style={{ 
                borderBottom: '1px solid #ddd',
                backgroundColor: parseFloat(year.performance) >= 0 ? 'rgba(76, 217, 100, 0.1)' : 'rgba(255, 59, 48, 0.1)'
              }}
            >
              <td style={{ padding: '10px' }}>{year.year}</td>
              <td style={{ textAlign: 'right', padding: '10px' }}>${year.startPrice.toFixed(2)}</td>
              <td style={{ textAlign: 'right', padding: '10px' }}>${year.endPrice.toFixed(2)}</td>
              <td 
                style={{ 
                  textAlign: 'right', 
                  padding: '10px',
                  color: parseFloat(year.performance) >= 0 ? '#4cd964' : '#ff3b30',
                  fontWeight: 'bold'
                }}
              >
                {year.performance}%
              </td>
              <td style={{ textAlign: 'right', padding: '10px' }}>{year.volatility}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TrendAnalysis;