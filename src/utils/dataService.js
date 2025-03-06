/**
 * Service to fetch historical stock data from APIs
 */
import { processStockData } from './dataProcessing';

// Yahoo Finance API proxy or Alpha Vantage could be used here
// For this example, we're using a free API proxy
export const fetchHistoricalData = async (symbol = 'AAPL', period = '2015-2020') => {
  try {
    // In a real production app, you would use an actual API with your API key
    // For this example, we'll simulate fetching data by loading from local files
    
    // Parse the period to determine which file to load
    let dataFile = '/AAPL.csv'; // Default to our 1980-1985 data
    
    if (period === '2015-2020') {
      dataFile = '/AAPL_2015_2020.csv';
    }
    
    // Fetch the CSV file
    const response = await fetch(dataFile);
    
    // If the file doesn't exist, throw an error
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status}`);
    }
    
    const csvData = await response.text();
    return processStockData(csvData);
  } catch (error) {
    console.error('Error fetching stock data:', error);
    throw error;
  }
};

/**
 * Analyze trends in the stock data and return analytical insights
 */
export const analyzeStockTrends = (data) => {
  if (!data || data.length === 0) return { trends: [], keyEvents: [] };
  
  // Sort data chronologically
  const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // Extract years for analysis
  const years = {};
  sortedData.forEach(item => {
    const year = new Date(item.date).getFullYear();
    if (!years[year]) {
      years[year] = [];
    }
    years[year].push(item);
  });
  
  // Calculate yearly performance
  const yearlyPerformance = Object.entries(years).map(([year, items]) => {
    const firstPrice = items[0].close;
    const lastPrice = items[items.length - 1].close;
    const performance = ((lastPrice - firstPrice) / firstPrice) * 100;
    const avgVolume = items.reduce((sum, item) => sum + item.volume, 0) / items.length;
    
    return {
      year: parseInt(year),
      startPrice: firstPrice,
      endPrice: lastPrice,
      performance: performance.toFixed(2),
      averageVolume: avgVolume,
      volatility: calculateVolatility(items).toFixed(2)
    };
  });
  
  // Identify key trends
  const trends = [];
  
  // Overall trend 2015-2020
  const overallStart = sortedData[0].close;
  const overallEnd = sortedData[sortedData.length - 1].close;
  const overallPerformance = ((overallEnd - overallStart) / overallStart) * 100;
  
  trends.push({
    period: '2015-2020',
    description: `Apple stock ${overallPerformance >= 0 ? 'increased' : 'decreased'} by ${Math.abs(overallPerformance).toFixed(2)}% over the entire period`,
    performance: overallPerformance.toFixed(2),
    trend: overallPerformance >= 0 ? 'bullish' : 'bearish'
  });
  
  // Identify significant price movements (>10% in a month)
  const significantMovements = identifySignificantMovements(sortedData);
  
  // Identify longest bullish and bearish trends
  const { longestBullish, longestBearish } = identifyLongestTrends(sortedData);
  
  if (longestBullish.length > 20) { // More than a month of trading days
    const startDate = longestBullish[0].date;
    const endDate = longestBullish[longestBullish.length - 1].date;
    const performance = ((longestBullish[longestBullish.length - 1].close - longestBullish[0].close) / longestBullish[0].close) * 100;
    
    trends.push({
      period: `${startDate} to ${endDate}`,
      description: `Longest bullish trend lasted ${longestBullish.length} trading days with ${performance.toFixed(2)}% gain`,
      performance: performance.toFixed(2),
      trend: 'bullish'
    });
  }
  
  if (longestBearish.length > 20) { // More than a month of trading days
    const startDate = longestBearish[0].date;
    const endDate = longestBearish[longestBearish.length - 1].date;
    const performance = ((longestBearish[longestBearish.length - 1].close - longestBearish[0].close) / longestBearish[0].close) * 100;
    
    trends.push({
      period: `${startDate} to ${endDate}`,
      description: `Longest bearish trend lasted ${longestBearish.length} trading days with ${Math.abs(performance).toFixed(2)}% loss`,
      performance: performance.toFixed(2),
      trend: 'bearish'
    });
  }
  
  // Determine key market events
  const keyEvents = significantMovements.map(event => ({
    date: event.date,
    description: `${Math.abs(event.change).toFixed(2)}% ${event.change >= 0 ? 'increase' : 'decrease'} in stock price`,
    change: event.change.toFixed(2)
  }));
  
  return {
    yearlyPerformance,
    trends,
    keyEvents
  };
};

// Helper function to calculate volatility (standard deviation of price changes)
const calculateVolatility = (data) => {
  const priceChanges = data.map(item => item.percentChange);
  const mean = priceChanges.reduce((sum, change) => sum + change, 0) / priceChanges.length;
  const squaredDifferences = priceChanges.map(change => Math.pow(change - mean, 2));
  const variance = squaredDifferences.reduce((sum, diff) => sum + diff, 0) / squaredDifferences.length;
  return Math.sqrt(variance);
};

// Helper function to identify significant price movements
const identifySignificantMovements = (data) => {
  const significantMovements = [];
  
  for (let i = 0; i < data.length; i++) {
    // Calculate the percentage change from previous 20 days
    if (i >= 20) {
      const previousPrice = data[i - 20].close;
      const currentPrice = data[i].close;
      const change = ((currentPrice - previousPrice) / previousPrice) * 100;
      
      // If change is more than 10%
      if (Math.abs(change) >= 10) {
        significantMovements.push({
          date: data[i].date,
          change,
          previousDate: data[i - 20].date
        });
        
        // Skip the next 20 days to avoid counting the same event multiple times
        i += 20;
      }
    }
  }
  
  return significantMovements;
};

// Helper function to identify longest bullish and bearish trends
const identifyLongestTrends = (data) => {
  let currentBullish = [];
  let currentBearish = [];
  let longestBullish = [];
  let longestBearish = [];
  
  for (let i = 1; i < data.length; i++) {
    // Bullish day (closing price higher than previous day)
    if (data[i].close > data[i-1].close) {
      currentBullish.push(data[i]);
      currentBearish = [];
      
      if (currentBullish.length > longestBullish.length) {
        longestBullish = [...currentBullish];
      }
    } 
    // Bearish day (closing price lower than previous day)
    else if (data[i].close < data[i-1].close) {
      currentBearish.push(data[i]);
      currentBullish = [];
      
      if (currentBearish.length > longestBearish.length) {
        longestBearish = [...currentBearish];
      }
    } 
    // Neutral day (closing price same as previous day)
    else {
      // Consider neutral days as continuation of the current trend
      if (currentBullish.length > 0) {
        currentBullish.push(data[i]);
      } else if (currentBearish.length > 0) {
        currentBearish.push(data[i]);
      }
    }
  }
  
  return { longestBullish, longestBearish };
};