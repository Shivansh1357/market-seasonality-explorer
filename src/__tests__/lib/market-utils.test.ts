import { 
  generateMockMarketData, 
  aggregateDataByWeek, 
  aggregateDataByMonth, 
  getMarketDataForDate, 
  formatVolume 
} from '@/lib/market-utils';
import { MarketData } from '@/types/market';
import dayjs from 'dayjs';

describe('Market Utils', () => {
  describe('generateMockMarketData', () => {
    it('generates market data for date range', () => {
      const startDate = dayjs().subtract(7, 'days').toDate();
      const endDate = dayjs().toDate();
      
      const data = generateMockMarketData(startDate, endDate);
      
      expect(data.length).toBeGreaterThan(0);
      expect(data.length).toBeLessThanOrEqual(8); // 7 days + potential partial day
    });

    it('generates data with correct structure', () => {
      const startDate = dayjs().subtract(1, 'day').toDate();
      const endDate = dayjs().toDate();
      
      const data = generateMockMarketData(startDate, endDate);
      
      expect(data.length).toBeGreaterThan(0);
      
      const firstItem = data[0];
      expect(firstItem).toHaveProperty('date');
      expect(firstItem).toHaveProperty('volatilityLevel');
      expect(firstItem).toHaveProperty('volume');
      expect(firstItem).toHaveProperty('performance');
      expect(firstItem).toHaveProperty('priceChange');
      expect(firstItem).toHaveProperty('liquidity');
      
      expect(['low', 'medium', 'high']).toContain(firstItem.volatilityLevel);
      expect(['positive', 'negative', 'neutral']).toContain(firstItem.performance);
      expect(typeof firstItem.volume).toBe('number');
      expect(typeof firstItem.priceChange).toBe('number');
      expect(typeof firstItem.liquidity).toBe('number');
    });

    it('handles same start and end date', () => {
      const date = dayjs().toDate();
      const data = generateMockMarketData(date, date);
      
      expect(data.length).toBe(1);
      expect(data[0].date).toBe(dayjs(date).format('YYYY-MM-DD'));
    });
  });

  describe('aggregateDataByWeek', () => {
    const mockData: MarketData[] = [
      {
        date: '2024-01-01',
        volatilityLevel: 'low',
        volume: 1000,
        performance: 'positive',
        priceChange: 2.5,
        liquidity: 80
      },
      {
        date: '2024-01-02',
        volatilityLevel: 'high',
        volume: 1500,
        performance: 'negative',
        priceChange: -1.5,
        liquidity: 70
      },
      {
        date: '2024-01-08',
        volatilityLevel: 'medium',
        volume: 1200,
        performance: 'positive',
        priceChange: 1.0,
        liquidity: 75
      }
    ];

    it('aggregates data by weeks', () => {
      const aggregated = aggregateDataByWeek(mockData, 2024);
      
      expect(aggregated.length).toBeGreaterThan(0);
      expect(aggregated[0]).toHaveProperty('period');
      expect(aggregated[0]).toHaveProperty('startDate');
      expect(aggregated[0]).toHaveProperty('endDate');
      expect(aggregated[0]).toHaveProperty('avgVolatility');
      expect(aggregated[0]).toHaveProperty('totalVolume');
      expect(aggregated[0]).toHaveProperty('avgPerformance');
      expect(aggregated[0]).toHaveProperty('avgPriceChange');
      expect(aggregated[0]).toHaveProperty('avgLiquidity');
    });

    it('calculates correct totals and averages', () => {
      const aggregated = aggregateDataByWeek(mockData, 2024);
      const firstWeek = aggregated[0];
      
      expect(firstWeek.totalVolume).toBe(2500); // 1000 + 1500
      expect(firstWeek.avgPriceChange).toBe(0.5); // (2.5 + (-1.5)) / 2
      expect(firstWeek.avgLiquidity).toBe(75); // (80 + 70) / 2
    });

    it('handles empty data', () => {
      const aggregated = aggregateDataByWeek([], 2024);
      expect(aggregated).toEqual([]);
    });
  });

  describe('aggregateDataByMonth', () => {
    const mockData: MarketData[] = [
      {
        date: '2024-01-15',
        volatilityLevel: 'low',
        volume: 1000,
        performance: 'positive',
        priceChange: 2.5,
        liquidity: 80
      },
      {
        date: '2024-01-20',
        volatilityLevel: 'high',
        volume: 1500,
        performance: 'negative',
        priceChange: -1.5,
        liquidity: 70
      },
      {
        date: '2024-02-05',
        volatilityLevel: 'medium',
        volume: 1200,
        performance: 'positive',
        priceChange: 1.0,
        liquidity: 75
      }
    ];

    it('aggregates data by months', () => {
      const aggregated = aggregateDataByMonth(mockData, 2024);
      
      expect(aggregated.length).toBe(2); // January and February
      expect(aggregated[0].period).toBe('2024-01');
      expect(aggregated[1].period).toBe('2024-02');
    });

    it('calculates monthly aggregations correctly', () => {
      const aggregated = aggregateDataByMonth(mockData, 2024);
      const january = aggregated[0];
      
      expect(january.totalVolume).toBe(2500); // 1000 + 1500
      expect(january.avgPriceChange).toBe(0.5); // (2.5 + (-1.5)) / 2
    });

    it('handles empty data', () => {
      const aggregated = aggregateDataByMonth([], 2024);
      expect(aggregated).toEqual([]);
    });
  });

  describe('getMarketDataForDate', () => {
    const mockData: MarketData[] = [
      {
        date: '2024-01-15',
        volatilityLevel: 'low',
        volume: 1000,
        performance: 'positive',
        priceChange: 2.5,
        liquidity: 80
      },
      {
        date: '2024-01-16',
        volatilityLevel: 'high',
        volume: 1500,
        performance: 'negative',
        priceChange: -1.5,
        liquidity: 70
      }
    ];

    it('returns data for existing date', () => {
      const date = new Date('2024-01-15');
      const result = getMarketDataForDate(mockData, date);
      
      expect(result).toBeDefined();
      expect(result?.date).toBe('2024-01-15');
      expect(result?.volume).toBe(1000);
    });

    it('returns null for non-existing date', () => {
      const date = new Date('2024-01-17');
      const result = getMarketDataForDate(mockData, date);
      
      expect(result).toBeNull();
    });

    it('handles empty data array', () => {
      const date = new Date('2024-01-15');
      const result = getMarketDataForDate([], date);
      
      expect(result).toBeNull();
    });
  });

  describe('formatVolume', () => {
    it('formats small volumes correctly', () => {
      expect(formatVolume(500)).toBe('500');
      expect(formatVolume(999)).toBe('999');
    });

    it('formats thousands correctly', () => {
      expect(formatVolume(1000)).toBe('1.0K');
      expect(formatVolume(1500)).toBe('1.5K');
      expect(formatVolume(999999)).toBe('1000.0K');
    });

    it('formats millions correctly', () => {
      expect(formatVolume(1000000)).toBe('1.0M');
      expect(formatVolume(1500000)).toBe('1.5M');
      expect(formatVolume(999999999)).toBe('1000.0M');
    });

    it('formats billions correctly', () => {
      expect(formatVolume(1000000000)).toBe('1.0B');
      expect(formatVolume(1500000000)).toBe('1.5B');
    });

    it('handles zero and negative values', () => {
      expect(formatVolume(0)).toBe('0');
      expect(formatVolume(-1000)).toBe('-1.0K');
    });

    it('handles decimal precision', () => {
      expect(formatVolume(1234)).toBe('1.2K');
      expect(formatVolume(1234567)).toBe('1.2M');
    });
  });
}); 