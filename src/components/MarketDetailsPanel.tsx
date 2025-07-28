'use client';

import React, { useMemo } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { MarketData } from '@/types/market';
import { formatVolume } from '@/lib/market-utils';
import dayjs from 'dayjs';
import { TrendingUp, TrendingDown, BarChart3, Activity, DollarSign, Droplets } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MarketDetailsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  marketData: MarketData | null;
  historicalData: MarketData[];
}

interface OHLCData {
  open: number;
  high: number;
  low: number;
  close: number;
}

interface TechnicalIndicators {
  rsi: number;
  ma20: number;
  ma50: number;
  volatility: number;
}

export function MarketDetailsPanel({ 
  isOpen, 
  onClose, 
  date, 
  marketData, 
  historicalData 
}: MarketDetailsPanelProps) {
  
  // Generate mock OHLC data based on market data
  const ohlcData: OHLCData = useMemo(() => {
    if (!marketData) {
      return { open: 0, high: 0, low: 0, close: 0 };
    }
    
    const basePrice = 100; // Mock base price
    const change = marketData.priceChange / 100;
    const volatility = marketData.volatilityLevel === 'high' ? 0.05 : 
                     marketData.volatilityLevel === 'medium' ? 0.03 : 0.01;
    
    const open = basePrice;
    const close = basePrice * (1 + change);
    const high = Math.max(open, close) * (1 + volatility);
    const low = Math.min(open, close) * (1 - volatility);
    
    return {
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2))
    };
  }, [marketData]);

  // Generate mock technical indicators
  const technicalIndicators: TechnicalIndicators = useMemo(() => {
    if (!marketData) {
      return { rsi: 50, ma20: 100, ma50: 100, volatility: 0 };
    }

    // Mock RSI calculation (normally 0-100)
    const rsi = 50 + (marketData.priceChange * 2);
    const clampedRsi = Math.max(0, Math.min(100, rsi));

    // Mock moving averages
    const ma20 = ohlcData.close * (0.98 + Math.random() * 0.04);
    const ma50 = ohlcData.close * (0.96 + Math.random() * 0.08);

    // Calculate volatility as standard deviation approximation
    const volatilityMap = { low: 0.15, medium: 0.25, high: 0.40 };
    const volatility = volatilityMap[marketData.volatilityLevel];

    return {
      rsi: Number(clampedRsi.toFixed(2)),
      ma20: Number(ma20.toFixed(2)),
      ma50: Number(ma50.toFixed(2)),
      volatility: Number(volatility.toFixed(3))
    };
  }, [marketData, ohlcData.close]);

  // Get recent price trend
  const getRecentTrend = () => {
    if (!date || historicalData.length < 5) return 'neutral';
    
    const currentDateStr = dayjs(date).format('YYYY-MM-DD');
    const currentIndex = historicalData.findIndex(d => d.date === currentDateStr);
    
    if (currentIndex === -1 || currentIndex < 4) return 'neutral';
    
    const recentData = historicalData.slice(currentIndex - 4, currentIndex + 1);
    const positiveChanges = recentData.filter(d => d.priceChange > 0).length;
    
    if (positiveChanges >= 3) return 'bullish';
    if (positiveChanges <= 1) return 'bearish';
    return 'neutral';
  };

  const trend = getRecentTrend();

  if (!date || !marketData) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-full sm:w-[600px] lg:w-[700px] p-6 sm:p-8 theme-transition">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-foreground">Market Details</SheetTitle>
            <SheetDescription className="text-muted-foreground">
              Select a date to view detailed market information
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:w-[600px] lg:w-[700px] overflow-y-auto p-6 sm:p-8 theme-transition">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2 text-foreground">
            <BarChart3 className="h-5 w-5" />
            Market Details
          </SheetTitle>
          <SheetDescription className="text-muted-foreground">
            {dayjs(date).format('MMMM D, YYYY')} • {dayjs(date).format('dddd')}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Price Overview */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 p-4 bg-card border border-border rounded-lg">
              <h3 className="text-sm font-medium text-muted-foreground">Price Change</h3>
              <div className={cn(
                "text-2xl font-bold",
                marketData.priceChange > 0 && "text-green-600 dark:text-green-400",
                marketData.priceChange < 0 && "text-red-600 dark:text-red-400",
                marketData.priceChange === 0 && "text-muted-foreground"
              )}>
                {marketData.priceChange > 0 ? '+' : ''}{marketData.priceChange.toFixed(2)}%
              </div>
            </div>
            <div className="space-y-2 p-4 bg-card border border-border rounded-lg">
              <h3 className="text-sm font-medium text-muted-foreground">Trend</h3>
              <div className="flex items-center gap-2">
                {trend === 'bullish' && <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />}
                {trend === 'bearish' && <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />}
                {trend === 'neutral' && <Activity className="h-5 w-5 text-muted-foreground" />}
                <span className={cn(
                  "capitalize font-medium",
                  trend === 'bullish' && "text-green-600 dark:text-green-400",
                  trend === 'bearish' && "text-red-600 dark:text-red-400",
                  trend === 'neutral' && "text-muted-foreground"
                )}>
                  {trend}
                </span>
              </div>
            </div>
          </div>

          {/* OHLC Data */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              OHLC Values
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Open:</span>
                  <span className="font-medium text-foreground">${ohlcData.open}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">High:</span>
                  <span className="font-medium text-green-600 dark:text-green-400">${ohlcData.high}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Low:</span>
                  <span className="font-medium text-red-600 dark:text-red-400">${ohlcData.low}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Close:</span>
                  <span className="font-medium text-foreground">${ohlcData.close}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Volume & Liquidity */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Droplets className="h-4 w-4" />
              Volume & Liquidity
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Volume:</span>
                <span className="font-medium text-foreground">{formatVolume(marketData.volume)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Liquidity:</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${marketData.liquidity}%` }}
                    />
                  </div>
                  <span className="font-medium text-sm text-foreground">{marketData.liquidity}%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Volatility:</span>
                <span className={cn(
                  "font-medium capitalize",
                  marketData.volatilityLevel === 'low' && "text-green-600 dark:text-green-400",
                  marketData.volatilityLevel === 'medium' && "text-orange-600 dark:text-orange-400",
                  marketData.volatilityLevel === 'high' && "text-red-600 dark:text-red-400"
                )}>
                  {marketData.volatilityLevel}
                </span>
              </div>
            </div>
          </div>

          {/* Technical Indicators */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Technical Indicators
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">RSI (14):</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full transition-all duration-300",
                        technicalIndicators.rsi > 70 ? "bg-red-500 dark:bg-red-400" :
                        technicalIndicators.rsi < 30 ? "bg-green-500 dark:bg-green-400" : "bg-primary"
                      )}
                      style={{ width: `${technicalIndicators.rsi}%` }}
                    />
                  </div>
                  <span className="font-medium text-sm text-foreground">{technicalIndicators.rsi}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">MA (20):</span>
                <span className="font-medium text-foreground">${technicalIndicators.ma20}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">MA (50):</span>
                <span className="font-medium text-foreground">${technicalIndicators.ma50}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Volatility (σ):</span>
                <span className="font-medium text-foreground">{technicalIndicators.volatility}</span>
              </div>
            </div>
          </div>

          {/* Performance Summary */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Performance Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Performance:</span>
                <span className={cn(
                  "capitalize font-medium",
                  marketData.performance === 'positive' && "text-green-600 dark:text-green-400",
                  marketData.performance === 'negative' && "text-red-600 dark:text-red-400",
                  marketData.performance === 'neutral' && "text-muted-foreground"
                )}>
                  {marketData.performance}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Market Condition:</span>
                <span className="font-medium text-foreground">
                  {marketData.volatilityLevel === 'high' ? 'Volatile' :
                   marketData.volatilityLevel === 'medium' ? 'Moderate' : 'Stable'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Liquidity Level:</span>
                <span className="font-medium text-foreground">
                  {marketData.liquidity > 70 ? 'High' :
                   marketData.liquidity > 40 ? 'Medium' : 'Low'}
                </span>
              </div>
            </div>
          </div>

          {/* Simple Price Chart Visualization */}
          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Price Action</h3>
            <div className="h-32 flex items-end justify-between gap-1">
              {[ohlcData.open, ohlcData.high, ohlcData.low, ohlcData.close].map((price, index) => {
                const maxPrice = Math.max(ohlcData.open, ohlcData.high, ohlcData.low, ohlcData.close);
                const minPrice = Math.min(ohlcData.open, ohlcData.high, ohlcData.low, ohlcData.close);
                const range = maxPrice - minPrice || 1;
                const height = ((price - minPrice) / range) * 100 + 20; // 20% minimum height
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className={cn(
                        "w-full rounded-t transition-all duration-300",
                        index === 0 && "bg-blue-500", // Open
                        index === 1 && "bg-green-500", // High
                        index === 2 && "bg-red-500", // Low
                        index === 3 && "bg-purple-500" // Close
                      )}
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-xs mt-1 text-gray-500">
                      {['O', 'H', 'L', 'C'][index]}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-2 text-xs text-gray-500 text-center">
              Open • High • Low • Close
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
} 