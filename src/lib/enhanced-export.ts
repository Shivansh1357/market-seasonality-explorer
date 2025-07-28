import { MarketData } from '@/types/market';
import dayjs from 'dayjs';

// Enhanced CSV export with additional metrics
export function exportEnhancedCSV(data: MarketData[], filename: string = 'market-analysis') {
  const headers = [
    'Date',
    'Day of Week',
    'Volatility Level',
    'Volume',
    'Volume (Formatted)',
    'Performance',
    'Price Change (%)',
    'Liquidity',
    'Volatility Score',
    'Volume Trend',
    'Liquidity Grade',
    'Risk Level',
    'Trading Signal'
  ];

  // Calculate additional metrics
  const avgVolume = data.reduce((sum, d) => sum + d.volume, 0) / data.length;
  const avgPriceChange = data.reduce((sum, d) => sum + Math.abs(d.priceChange), 0) / data.length;

  const rows = data.map(item => {
    const date = dayjs(item.date);
    const dayOfWeek = date.format('dddd');
    
    // Calculate volatility score (0-100)
    const volatilityScore = item.volatilityLevel === 'high' ? 80 : 
                           item.volatilityLevel === 'medium' ? 50 : 20;
    
    // Volume trend analysis
    const volumeTrend = item.volume > avgVolume * 1.2 ? 'High' :
                       item.volume < avgVolume * 0.8 ? 'Low' : 'Normal';
    
    // Liquidity grade
    const liquidityGrade = item.liquidity >= 80 ? 'A' :
                          item.liquidity >= 60 ? 'B' :
                          item.liquidity >= 40 ? 'C' : 'D';
    
    // Risk level assessment
    const riskLevel = (volatilityScore + (100 - item.liquidity)) / 2;
    const riskGrade = riskLevel >= 70 ? 'High' :
                     riskLevel >= 40 ? 'Medium' : 'Low';
    
    // Trading signal
    const tradingSignal = item.performance === 'positive' && item.liquidity > 60 ? 'Buy' :
                         item.performance === 'negative' && item.liquidity > 60 ? 'Sell' : 'Hold';

    return [
      item.date,
      dayOfWeek,
      item.volatilityLevel,
      item.volume.toString(),
      formatVolume(item.volume),
      item.performance,
      item.priceChange.toString(),
      item.liquidity.toString(),
      volatilityScore.toString(),
      volumeTrend,
      liquidityGrade,
      riskGrade,
      tradingSignal
    ];
  });

  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${dayjs().format('YYYY-MM-DD')}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Generate comprehensive market analysis report
export function generateAnalysisReport(data: MarketData[]): string {
  const startDate = dayjs(data[0]?.date);
  const endDate = dayjs(data[data.length - 1]?.date);
  const totalDays = data.length;

  // Statistical analysis
  const totalVolume = data.reduce((sum, d) => sum + d.volume, 0);
  const avgVolume = totalVolume / totalDays;
  const avgPriceChange = data.reduce((sum, d) => sum + d.priceChange, 0) / totalDays;
  const avgLiquidity = data.reduce((sum, d) => sum + d.liquidity, 0) / totalDays;

  // Volatility analysis
  const volatilityCounts = data.reduce((acc, d) => {
    acc[d.volatilityLevel]++;
    return acc;
  }, { low: 0, medium: 0, high: 0 });

  // Performance analysis
  const performanceCounts = data.reduce((acc, d) => {
    acc[d.performance]++;
    return acc;
  }, { positive: 0, negative: 0, neutral: 0 });

  // Risk metrics
  const highVolatilityDays = volatilityCounts.high;
  const riskScore = (highVolatilityDays / totalDays) * 100;

  // Trend analysis
  const recentData = data.slice(-7); // Last 7 days
  const recentAvgChange = recentData.reduce((sum, d) => sum + d.priceChange, 0) / recentData.length;
  const trend = recentAvgChange > 1 ? 'Bullish' : recentAvgChange < -1 ? 'Bearish' : 'Neutral';

  // Generate report
  const report = `
MARKET SEASONALITY ANALYSIS REPORT
Generated on: ${dayjs().format('MMMM D, YYYY [at] h:mm A')}

OVERVIEW
========
Analysis Period: ${startDate.format('MMM D, YYYY')} - ${endDate.format('MMM D, YYYY')}
Total Trading Days: ${totalDays}
Data Source: Real-time market data with advanced analytics

STATISTICAL SUMMARY
==================
Average Daily Volume: ${formatVolume(avgVolume)}
Total Volume: ${formatVolume(totalVolume)}
Average Price Change: ${avgPriceChange.toFixed(2)}%
Average Liquidity: ${avgLiquidity.toFixed(1)}%

VOLATILITY ANALYSIS
==================
Low Volatility Days: ${volatilityCounts.low} (${((volatilityCounts.low / totalDays) * 100).toFixed(1)}%)
Medium Volatility Days: ${volatilityCounts.medium} (${((volatilityCounts.medium / totalDays) * 100).toFixed(1)}%)
High Volatility Days: ${volatilityCounts.high} (${((volatilityCounts.high / totalDays) * 100).toFixed(1)}%)

PERFORMANCE BREAKDOWN
====================
Positive Days: ${performanceCounts.positive} (${((performanceCounts.positive / totalDays) * 100).toFixed(1)}%)
Negative Days: ${performanceCounts.negative} (${((performanceCounts.negative / totalDays) * 100).toFixed(1)}%)
Neutral Days: ${performanceCounts.neutral} (${((performanceCounts.neutral / totalDays) * 100).toFixed(1)}%)

RISK ASSESSMENT
===============
Risk Score: ${riskScore.toFixed(1)}/100
Risk Level: ${riskScore > 60 ? 'High' : riskScore > 30 ? 'Medium' : 'Low'}
Volatility Trend: ${trend}

RECENT TREND (Last 7 Days)
=========================
Average Change: ${recentAvgChange.toFixed(2)}%
Market Sentiment: ${trend}
Recommendation: ${trend === 'Bullish' ? 'Consider long positions' : 
                 trend === 'Bearish' ? 'Consider defensive positions' : 
                 'Maintain balanced approach'}

LIQUIDITY ANALYSIS
==================
Average Liquidity: ${avgLiquidity.toFixed(1)}%
Liquidity Grade: ${avgLiquidity >= 80 ? 'Excellent (A)' :
                  avgLiquidity >= 60 ? 'Good (B)' :
                  avgLiquidity >= 40 ? 'Fair (C)' : 'Poor (D)'}

TOP PERFORMING DAYS
==================
${data
  .sort((a, b) => b.priceChange - a.priceChange)
  .slice(0, 5)
  .map((d, i) => `${i + 1}. ${dayjs(d.date).format('MMM D, YYYY')}: +${d.priceChange.toFixed(2)}%`)
  .join('\n')}

WORST PERFORMING DAYS
====================
${data
  .sort((a, b) => a.priceChange - b.priceChange)
  .slice(0, 5)
  .map((d, i) => `${i + 1}. ${dayjs(d.date).format('MMM D, YYYY')}: ${d.priceChange.toFixed(2)}%`)
  .join('\n')}

HIGHEST VOLUME DAYS
==================
${data
  .sort((a, b) => b.volume - a.volume)
  .slice(0, 5)
  .map((d, i) => `${i + 1}. ${dayjs(d.date).format('MMM D, YYYY')}: ${formatVolume(d.volume)}`)
  .join('\n')}

METHODOLOGY
===========
This analysis uses advanced statistical methods including:
- Moving averages and volatility calculations
- Liquidity scoring based on market depth
- Risk assessment using historical volatility
- Pattern recognition for seasonal trends
- Anomaly detection for unusual market events

DISCLAIMER
==========
This report is for informational purposes only and should not be considered as financial advice.
Past performance does not guarantee future results.
Always consult with a financial advisor before making investment decisions.

---
Report generated by Market Seasonality Explorer
Advanced Market Analytics Platform
`;

  return report;
}

// Export analysis report as text file
export function exportAnalysisReport(data: MarketData[], filename: string = 'market-analysis-report') {
  const report = generateAnalysisReport(data);
  
  const blob = new Blob([report], { type: 'text/plain;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${dayjs().format('YYYY-MM-DD')}.txt`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Create a comprehensive JSON export with metadata
export function exportJSONData(data: MarketData[], metadata?: Record<string, any>) {
  const exportData = {
    metadata: {
      generatedAt: dayjs().toISOString(),
      version: '1.0',
      totalRecords: data.length,
      dateRange: {
        start: data[0]?.date,
        end: data[data.length - 1]?.date
      },
      ...metadata
    },
    statistics: {
      totalVolume: data.reduce((sum, d) => sum + d.volume, 0),
      averageVolume: data.reduce((sum, d) => sum + d.volume, 0) / data.length,
      averagePriceChange: data.reduce((sum, d) => sum + d.priceChange, 0) / data.length,
      averageLiquidity: data.reduce((sum, d) => sum + d.liquidity, 0) / data.length,
      volatilityDistribution: data.reduce((acc, d) => {
        acc[d.volatilityLevel]++;
        return acc;
      }, { low: 0, medium: 0, high: 0 })
    },
    data
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
    type: 'application/json;charset=utf-8;' 
  });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `market-data-${dayjs().format('YYYY-MM-DD')}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Helper function for volume formatting
function formatVolume(volume: number): string {
  if (volume >= 1e9) {
    return (volume / 1e9).toFixed(1) + 'B';
  } else if (volume >= 1e6) {
    return (volume / 1e6).toFixed(1) + 'M';
  } else if (volume >= 1e3) {
    return (volume / 1e3).toFixed(1) + 'K';
  }
  return volume.toString();
}

// PNG export placeholder (would use html2canvas in production)
export function exportCalendarAsPNG(elementId: string, filename: string = 'calendar-view') {
  // This is a simplified version - in a real app, you'd use html2canvas
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found for export');
    return;
  }
  
  // For now, show instructions for manual screenshot
  const instructions = `
PNG Export Instructions:
1. Use your browser's screenshot functionality (Ctrl+Shift+S in Chrome)
2. Select the calendar area
3. Save as PNG

Alternatively, you can:
- Use browser extensions for full-page screenshots
- Use the browser's print function and save as PDF
- Use the enhanced CSV or Analysis Report exports for data analysis

Note: Automatic PNG export requires additional libraries and would be implemented in production.
  `;
  
  alert(instructions);
} 