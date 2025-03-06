import React from 'react';

const MetricsDisplay = ({ metrics }) => {
  const { maxPrice, minPrice, averageVolume, priceIncrease, volatility } = metrics;
  
  const metricData = [
    {
      title: 'Maximum Price',
      value: `$${maxPrice}`,
      icon: '📈',
      description: 'Highest recorded stock price'
    },
    {
      title: 'Minimum Price',
      value: `$${minPrice}`,
      icon: '📉',
      description: 'Lowest recorded stock price'
    },
    {
      title: 'Average Volume',
      value: `${averageVolume}`,
      icon: '📊',
      description: 'Average daily trading volume'
    },
    {
      title: 'Price Change',
      value: `${priceIncrease}%`,
      icon: priceIncrease >= 0 ? '✅' : '❌',
      description: 'Overall price change percentage',
      positive: priceIncrease >= 0
    },
    {
      title: 'Volatility',
      value: volatility,
      icon: '📊',
      description: 'Standard deviation of price changes'
    }
  ];
  
  return (
    <div className="metrics-container">
      {metricData.map((metric, index) => (
        <div className="metric-card" key={index}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>{metric.icon}</div>
          <h3>{metric.title}</h3>
          <div 
            className="metric-value"
            style={{
              color: metric.hasOwnProperty('positive') 
                ? (metric.positive ? '#4cd964' : '#ff3b30') 
                : '#007aff'
            }}
          >
            {metric.value}
          </div>
          <div>{metric.description}</div>
        </div>
      ))}
    </div>
  );
};

export default MetricsDisplay;