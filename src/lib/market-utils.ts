import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { MarketData, VolatilityLevel, Performance, AggregatedData } from '@/types/market';

dayjs.extend(weekOfYear);

export function generateMockMarketData(startDate: Date, endDate: Date): MarketData[] {
  const data: MarketData[] = [];
  const current = dayjs(startDate);
  const end = dayjs(endDate);

  while (current.isBefore(end) || current.isSame(end, 'day')) {
    // Generate realistic market data patterns
    const dayOfWeek = current.day();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    if (!isWeekend) {
      const volatilityLevels: VolatilityLevel[] = ['low', 'medium', 'high'];
      const performances: Performance[] = ['positive', 'negative', 'neutral'];
      
      // Add some patterns - higher volatility around month-end, earnings seasons
      const dayOfMonth = current.date();
      const isMonthEnd = dayOfMonth > 25;
      const isEarningsSeason = [1, 4, 7, 10].includes(current.month() + 1);
      
      let volatilityWeights = [0.5, 0.3, 0.2]; // low, medium, high
      if (isMonthEnd || isEarningsSeason) {
        volatilityWeights = [0.2, 0.4, 0.4]; // higher volatility
      }
      
      const volatilityLevel = weightedRandom(volatilityLevels, volatilityWeights);
      const performance = performances[Math.floor(Math.random() * performances.length)];
      
      data.push({
        date: current.format('YYYY-MM-DD'),
        volatilityLevel,
        volume: Math.floor(Math.random() * 1000000) + 100000,
        performance,
        priceChange: (Math.random() - 0.5) * 10, // -5% to +5%
        liquidity: Math.floor(Math.random() * 100) + 1,
      });
    }
    
    current.add(1, 'day');
  }
  
  return data;
}

function weightedRandom<T>(items: T[], weights: number[]): T {
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < items.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return items[i];
    }
  }
  
  return items[items.length - 1];
}

export function aggregateDataByWeek(data: MarketData[], year: number): AggregatedData[] {
  const weekGroups = data.reduce((groups, item) => {
    const date = dayjs(item.date);
    if (date.year() !== year) return groups;
    
    const weekKey = `${year}-W${date.week()}`;
    if (!groups[weekKey]) {
      groups[weekKey] = [];
    }
    groups[weekKey].push(item);
    return groups;
  }, {} as Record<string, MarketData[]>);

  return Object.entries(weekGroups).map(([period, weekData]) => {
    const dates = weekData.map(d => dayjs(d.date));
    // Fix: dayjs.min and dayjs.max do not exist by default, so use Math.min/Math.max on timestamps
    const timestamps = dates.map(d => d.valueOf());
    const startDate = new Date(Math.min(...timestamps));
    const endDate = new Date(Math.max(...timestamps));
    
    return {
      period,
      startDate,
      endDate,
      avgVolatility: getMostFrequentVolatility(weekData),
      totalVolume: weekData.reduce((sum, d) => sum + d.volume, 0),
      avgPerformance: getMostFrequentPerformance(weekData),
      avgPriceChange: weekData.reduce((sum, d) => sum + d.priceChange, 0) / weekData.length,
      avgLiquidity: weekData.reduce((sum, d) => sum + d.liquidity, 0) / weekData.length,
    };
  });
}

export function aggregateDataByMonth(data: MarketData[], year: number): AggregatedData[] {
  const monthGroups = data.reduce((groups, item) => {
    const date = dayjs(item.date);
    if (date.year() !== year) return groups;
    
    const monthKey = `${year}-${String(date.month() + 1).padStart(2, '0')}`;
    if (!groups[monthKey]) {
      groups[monthKey] = [];
    }
    groups[monthKey].push(item);
    return groups;
  }, {} as Record<string, MarketData[]>);

  return Object.entries(monthGroups).map(([period, monthData]) => {
    const dates = monthData.map(d => dayjs(d.date));
    // Fix: dayjs.min and dayjs.max do not exist by default, so use Math.min/Math.max on timestamps
    const timestamps = dates.map(d => d.valueOf());
    const startDate = new Date(Math.min(...timestamps));
    const endDate = new Date(Math.max(...timestamps));
    
    return {
      period,
      startDate,
      endDate,
      avgVolatility: getMostFrequentVolatility(monthData),
      totalVolume: monthData.reduce((sum, d) => sum + d.volume, 0),
      avgPerformance: getMostFrequentPerformance(monthData),
      avgPriceChange: monthData.reduce((sum, d) => sum + d.priceChange, 0) / monthData.length,
      avgLiquidity: monthData.reduce((sum, d) => sum + d.liquidity, 0) / monthData.length,
    };
  });
}

function getMostFrequentVolatility(data: MarketData[]): VolatilityLevel {
  const counts = data.reduce((acc, item) => {
    acc[item.volatilityLevel] = (acc[item.volatilityLevel] || 0) + 1;
    return acc;
  }, {} as Record<VolatilityLevel, number>);

  return Object.entries(counts).reduce((a, b) => counts[a[0] as VolatilityLevel] > counts[b[0] as VolatilityLevel] ? a : b)[0] as VolatilityLevel;
}

function getMostFrequentPerformance(data: MarketData[]): Performance {
  const counts = data.reduce((acc, item) => {
    acc[item.performance] = (acc[item.performance] || 0) + 1;
    return acc;
  }, {} as Record<Performance, number>);

  return Object.entries(counts).reduce((a, b) => counts[a[0] as Performance] > counts[b[0] as Performance] ? a : b)[0] as Performance;
}

export function getMarketDataForDate(data: MarketData[], date: Date): MarketData | undefined {
  const dateString = dayjs(date).format('YYYY-MM-DD');
  return data.find(d => d.date === dateString);
}

export function formatVolume(volume: number): string {
  if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(1)}M`;
  }
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(0)}K`;
  }
  return volume.toString();
} 