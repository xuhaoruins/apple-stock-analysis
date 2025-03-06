import React from 'react';
import { generateInsights } from '../utils/dataProcessing';

const InsightsSection = ({ data }) => {
  const insights = generateInsights(data);
  
  if (insights.length === 0) {
    return null;
  }
  
  return (
    <div className="analysis-section">
      <h2>Key Insights</h2>
      <div className="insights-list">
        {insights.map((insight, index) => (
          <div key={index} className="insight-card">
            <h3>{insight.title}</h3>
            <p>{insight.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InsightsSection;