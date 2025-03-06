import React from 'react';

const TimeFilter = ({ timePeriod, setTimePeriod }) => {
  const periods = [
    { id: 'all', label: 'All Time' },
    { id: '5y', label: '5 Years' },
    { id: '3y', label: '3 Years' },
    { id: '1y', label: '1 Year' }
  ];
  
  return (
    <div className="time-period-selector">
      {periods.map(period => (
        <button 
          key={period.id}
          className={timePeriod === period.id ? 'active' : ''}
          onClick={() => setTimePeriod(period.id)}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
};

export default TimeFilter;