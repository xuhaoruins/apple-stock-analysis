import React, { useState, useEffect } from 'react';
import { processStockData, calculateMetrics } from './utils/dataProcessing';
import Header from './components/Header';
import StockChart from './components/StockChart';
import MetricsDisplay from './components/MetricsDisplay';
import TimeFilter from './components/TimeFilter';
import InsightsSection from './components/InsightsSection';
import TrendAnalysis from './components/TrendAnalysis';

function App() {
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timePeriod, setTimePeriod] = useState('all');
  const [filteredData, setFilteredData] = useState([]);
  const [metrics, setMetrics] = useState({
    averageVolume: 0,
    maxPrice: 0,
    minPrice: 0,
    priceIncrease: 0,
    volatility: 0
  });
  const [activeTab, setActiveTab] = useState('1980-1985');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real app, we'd fetch this from an API
        // For this example, we're loading local CSV data
        const response = await fetch('/AAPL.csv');
        const text = await response.text();
        
        const processedData = processStockData(text);
        setStockData(processedData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load stock data');
        setLoading(false);
        console.error('Error loading data:', err);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (stockData.length) {
      // Filter data based on selected time period
      let filtered = [...stockData];
      
      if (timePeriod !== 'all') {
        const currentDate = new Date(stockData[stockData.length - 1].date);
        let cutoffDate = new Date(currentDate);
        
        switch (timePeriod) {
          case '1y':
            cutoffDate.setFullYear(currentDate.getFullYear() - 1);
            break;
          case '3y':
            cutoffDate.setFullYear(currentDate.getFullYear() - 3);
            break;
          case '5y':
            cutoffDate.setFullYear(currentDate.getFullYear() - 5);
            break;
          default:
            break;
        }
        
        filtered = stockData.filter(item => new Date(item.date) >= cutoffDate);
      }
      
      setFilteredData(filtered);
      
      // Calculate metrics for filtered data
      const calculatedMetrics = calculateMetrics(filtered);
      setMetrics(calculatedMetrics);
    }
  }, [stockData, timePeriod]);

  if (loading && activeTab === '1980-1985') {
    return <div className="container">Loading Apple stock data...</div>;
  }

  if (error && activeTab === '1980-1985') {
    return <div className="container">Error: {error}</div>;
  }

  return (
    <div>
      <Header />
      <div className="container">
        <div className="time-period-selector" style={{ marginTop: '20px' }}>
          <button 
            onClick={() => setActiveTab('1980-1985')} 
            className={activeTab === '1980-1985' ? 'active' : ''}
            style={{ fontSize: '16px', padding: '10px 20px' }}
          >
            1980-1985 Analysis
          </button>
          <button 
            onClick={() => setActiveTab('2015-2020')} 
            className={activeTab === '2015-2020' ? 'active' : ''}
            style={{ fontSize: '16px', padding: '10px 20px' }}
          >
            2015-2020 Analysis
          </button>
        </div>

        {activeTab === '1980-1985' ? (
          <>
            <h2>Historical Stock Performance (1980-1985)</h2>
            
            <TimeFilter timePeriod={timePeriod} setTimePeriod={setTimePeriod} />
            
            <MetricsDisplay metrics={metrics} />
            
            <div className="chart-container">
              <StockChart data={filteredData} />
            </div>
            
            <InsightsSection data={filteredData} />
          </>
        ) : (
          <TrendAnalysis />
        )}
      </div>
    </div>
  );
}

export default App;