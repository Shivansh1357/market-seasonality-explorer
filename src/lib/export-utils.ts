import { MarketData } from '@/types/market';
import dayjs from 'dayjs';

export function exportToCSV(data: MarketData[], filename: string = 'market-data') {
  const headers = ['Date', 'Volatility Level', 'Volume', 'Performance', 'Price Change (%)', 'Liquidity (%)'];
  
  const csvContent = [
    headers.join(','),
    ...data.map(item => [
      item.date,
      item.volatilityLevel,
      item.volume,
      item.performance,
      item.priceChange.toFixed(2),
      item.liquidity
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}-${dayjs().format('YYYY-MM-DD')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function exportCalendarAsPNG(elementId: string, filename: string = 'calendar-view') {
  // This is a simplified version - in a real app, you'd use html2canvas
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found for export');
    return;
  }

  // For now, we'll just show a message since html2canvas isn't installed
  alert('PNG export would be implemented with html2canvas library. For now, you can use browser screenshot functionality.');
}

export function generateSummaryReport(data: MarketData[]): string {
  if (data.length === 0) return 'No data available';

  const totalDays = data.length;
  const avgVolume = data.reduce((sum, d) => sum + d.volume, 0) / totalDays;
  const avgPriceChange = data.reduce((sum, d) => sum + d.priceChange, 0) / totalDays;
  const avgLiquidity = data.reduce((sum, d) => sum + d.liquidity, 0) / totalDays;

  const volatilityCounts = data.reduce((acc, d) => {
    acc[d.volatilityLevel] = (acc[d.volatilityLevel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const performanceCounts = data.reduce((acc, d) => {
    acc[d.performance] = (acc[d.performance] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return `
Market Seasonality Report
Generated: ${dayjs().format('MMMM D, YYYY HH:mm')}

Summary Statistics:
- Total Trading Days: ${totalDays}
- Average Daily Volume: ${avgVolume.toLocaleString()}
- Average Price Change: ${avgPriceChange.toFixed(2)}%
- Average Liquidity: ${avgLiquidity.toFixed(1)}%

Volatility Distribution:
- High: ${volatilityCounts.high || 0} days (${((volatilityCounts.high || 0) / totalDays * 100).toFixed(1)}%)
- Medium: ${volatilityCounts.medium || 0} days (${((volatilityCounts.medium || 0) / totalDays * 100).toFixed(1)}%)
- Low: ${volatilityCounts.low || 0} days (${((volatilityCounts.low || 0) / totalDays * 100).toFixed(1)}%)

Performance Distribution:
- Positive: ${performanceCounts.positive || 0} days (${((performanceCounts.positive || 0) / totalDays * 100).toFixed(1)}%)
- Negative: ${performanceCounts.negative || 0} days (${((performanceCounts.negative || 0) / totalDays * 100).toFixed(1)}%)
- Neutral: ${performanceCounts.neutral || 0} days (${((performanceCounts.neutral || 0) / totalDays * 100).toFixed(1)}%)
  `.trim();
} 