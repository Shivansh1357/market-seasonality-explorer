export type VolatilityLevel = 'low' | 'medium' | 'high';
export type Performance = 'positive' | 'negative' | 'neutral';
export type CalendarView = 'daily' | 'weekly' | 'monthly';

export interface MarketData {
  date: string; // ISO date string
  volatilityLevel: VolatilityLevel;
  volume: number;
  performance: Performance;
  priceChange: number; // percentage change
  liquidity: number; // 0-100 scale
}

export interface CalendarCellProps {
  date: Date;
  marketData?: MarketData;
  selected: boolean;
  onClick: (date: Date) => void;
  view: CalendarView;
}

export interface CalendarProps {
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  selectedDate?: Date;
  onDateSelect: (date: Date) => void;
  marketData: MarketData[];
}

export interface AggregatedData {
  period: string; // week/month identifier
  startDate: Date;
  endDate: Date;
  avgVolatility: VolatilityLevel;
  totalVolume: number;
  avgPerformance: Performance;
  avgPriceChange: number;
  avgLiquidity: number;
} 