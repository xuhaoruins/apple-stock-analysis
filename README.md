# Apple Stock Analysis

This is a React-based web application for visualizing and analyzing Apple stock data from 1980-1985.

## Features

- Interactive stock price visualization with Recharts
- Key performance metrics calculation
- Automatic insights generation based on the data
- Time period filtering options
- Multiple chart view options

## How to Run

1. Make sure you have [Node.js](https://nodejs.org/) installed
2. Navigate to the project directory in your terminal
3. Install dependencies:
   ```
   npm install
   ```
4. Start the development server:
   ```
   npm start
   ```
5. Open your browser and navigate to `http://localhost:3000`

## Data Source

The application uses historical Apple stock data (AAPL.csv) from December 1980 to June 1985, which includes:
- Daily opening, closing, high, and low prices
- Trading volumes
- Adjusted close prices

## Implementation Details

This application is built with:
- React for the user interface
- Recharts for data visualization
- Custom utility functions for data processing and analysis

## Project Structure

- `/public` - Static assets including the CSV data file
- `/src` - Source code
  - `/components` - React components
  - `/utils` - Utility functions for data processing

## Future Improvements

- Add more advanced technical indicators
- Implement more sophisticated analysis algorithms
- Add export functionality for insights and charts
- Extend the date range to include more recent data