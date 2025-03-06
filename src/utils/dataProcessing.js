/**
 * Process CSV stock data into a structured format
 */
export const processStockData = (csvText) => {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const entry = {};
    
    headers.forEach((header, index) => {
      if (header === 'Date') {
        entry.date = values[index];
      } else if (['Open', 'High', 'Low', 'Close', 'Adj Close'].includes(header)) {
        entry[header.toLowerCase().replace(' ', '')] = parseFloat(values[index]);
      } else if (header === 'Volume') {
        entry.volume = parseInt(values[index], 10);
      }
    });
    
    // Calculate some additional metrics
    entry.change = entry.close - entry.open;
    entry.percentChange = (entry.change / entry.open) * 100;
    
    data.push(entry);
  }
  
  return data;
};

/**
 * Calculate key metrics from stock data
 */
export const calculateMetrics = (data) => {
  if (!data || data.length === 0) return {};
  
  // Initial values
  let maxPrice = data[0].high;
  let minPrice = data[0].low;
  let totalVolume = 0;
  let totalChange = 0;
  let priceChanges = [];
  
  // First and last closing prices for overall price increase
  const firstClose = data[0].close;
  const lastClose = data[data.length - 1].close;
  const totalPriceIncrease = ((lastClose - firstClose) / firstClose) * 100;

  // Calculate metrics
  data.forEach(day => {
    // Max price
    if (day.high > maxPrice) maxPrice = day.high;
    
    // Min price
    if (day.low < minPrice) minPrice = day.low;
    
    // Accumulate volume
    totalVolume += day.volume;
    
    // Track price changes for volatility
    if (day.percentChange) {
      priceChanges.push(Math.abs(day.percentChange));
    }
  });

  // Calculate average volume
  const averageVolume = Math.round(totalVolume / data.length);
  
  // Calculate volatility (standard deviation of price changes)
  const avgPriceChange = priceChanges.reduce((sum, change) => sum + change, 0) / priceChanges.length;
  const squaredDifferences = priceChanges.map(change => Math.pow(change - avgPriceChange, 2));
  const avgSquaredDiff = squaredDifferences.reduce((sum, diff) => sum + diff, 0) / squaredDifferences.length;
  const volatility = Math.sqrt(avgSquaredDiff).toFixed(2);
  
  return {
    maxPrice: maxPrice.toFixed(2),
    minPrice: minPrice.toFixed(2),
    averageVolume: formatLargeNumber(averageVolume),
    priceIncrease: totalPriceIncrease.toFixed(2),
    volatility
  };
};

/**
 * Format large numbers (like volume) to be more readable
 */
export const formatLargeNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num;
};

/**
 * Generate insights from the stock data
 */
export const generateInsights = (data) => {
  if (!data || data.length < 30) return [];
  
  const insights = [];
  
  // Calculate average daily volume
  const avgVolume = data.reduce((sum, day) => sum + day.volume, 0) / data.length;
  
  // Find highest volume day
  const highestVolume = data.reduce((max, day) => day.volume > max.volume ? day : max, data[0]);
  
  // Find days with significant price changes (more than 5%)
  const significantChanges = data.filter(day => Math.abs(day.percentChange) > 5);
  
  // Find longest consecutive up/down trend
  let longestUpTrend = 0;
  let longestDownTrend = 0;
  let currentUpTrend = 0;
  let currentDownTrend = 0;
  
  for (let i = 1; i < data.length; i++) {
    if (data[i].close > data[i-1].close) {
      currentUpTrend++;
      currentDownTrend = 0;
      if (currentUpTrend > longestUpTrend) longestUpTrend = currentUpTrend;
    } else if (data[i].close < data[i-1].close) {
      currentDownTrend++;
      currentUpTrend = 0;
      if (currentDownTrend > longestDownTrend) longestDownTrend = currentDownTrend;
    } else {
      currentUpTrend = 0;
      currentDownTrend = 0;
    }
  }
  
  // Generate insights text
  if (highestVolume.volume > avgVolume * 3) {
    insights.push({
      title: 'Unusual Trading Volume',
      text: `Unusually high trading volume detected on ${highestVolume.date} with ${formatLargeNumber(highestVolume.volume)} shares traded, which is ${Math.round(highestVolume.volume / avgVolume)} times the average daily volume.`
    });
  }
  
  if (significantChanges.length > 0) {
    const mostSignificant = significantChanges.reduce(
      (max, day) => Math.abs(day.percentChange) > Math.abs(max.percentChange) ? day : max, 
      significantChanges[0]
    );
    
    insights.push({
      title: 'Significant Price Movement',
      text: `${significantChanges.length} day(s) had price movements exceeding 5%. Most significant was on ${mostSignificant.date} with a ${mostSignificant.percentChange.toFixed(2)}% change.`
    });
  }
  
  if (longestUpTrend > 5) {
    insights.push({
      title: 'Bullish Trend Detected',
      text: `Detected a bullish trend of ${longestUpTrend} consecutive days of price increases.`
    });
  }
  
  if (longestDownTrend > 5) {
    insights.push({
      title: 'Bearish Trend Detected',
      text: `Detected a bearish trend of ${longestDownTrend} consecutive days of price decreases.`
    });
  }
  
  // Overall performance
  const firstPrice = data[0].close;
  const lastPrice = data[data.length-1].close;
  const performancePercent = ((lastPrice - firstPrice) / firstPrice * 100).toFixed(2);
  const performanceDirection = performancePercent > 0 ? 'increased' : 'decreased';
  
  insights.push({
    title: 'Overall Performance',
    text: `Over the selected period, Apple's stock price ${performanceDirection} by ${Math.abs(performancePercent)}%, from $${firstPrice.toFixed(2)} to $${lastPrice.toFixed(2)}.`
  });
  
  return insights;
};