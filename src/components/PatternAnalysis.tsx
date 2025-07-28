'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MarketData } from '@/types/market';
import { TrendingUp, TrendingDown, AlertTriangle, Calendar, Activity } from 'lucide-react';
import dayjs from 'dayjs';

interface PatternAnalysisProps {
  marketData: MarketData[];
  selectedDate?: Date;
}

interface SeasonalPattern {
  type: 'bullish' | 'bearish' | 'volatile' | 'stable';
  period: string;
  strength: number; // 0-100
  description: string;
  frequency: number;
}

interface Anomaly {
  date: string;
  type: 'volume_spike' | 'volatility_spike' | 'price_gap';
  severity: 'low' | 'medium' | 'high';
  description: string;
  value: number;
}

export function PatternAnalysis({ marketData, selectedDate }: PatternAnalysisProps) {
  // Analyze seasonal patterns
  const seasonalPatterns = useMemo((): SeasonalPattern[] => {
    if (marketData.length < 30) return [];

    const patterns: SeasonalPattern[] = [];
    
    // Monthly patterns
    const monthlyData = marketData.reduce((acc, data) => {
      const month = dayjs(data.date).format('MM');
      if (!acc[month]) acc[month] = [];
      acc[month].push(data);
      return acc;
    }, {} as Record<string, MarketData[]>);

    Object.entries(monthlyData).forEach(([month, data]) => {
      if (data.length < 3) return;

      const avgChange = data.reduce((sum, d) => sum + d.priceChange, 0) / data.length;
      const volatilityCount = data.filter(d => d.volatilityLevel === 'high').length;
      const volatilityRatio = volatilityCount / data.length;

      if (Math.abs(avgChange) > 2) {
        patterns.push({
          type: avgChange > 0 ? 'bullish' : 'bearish',
          period: `Month ${month}`,
          strength: Math.min(100, Math.abs(avgChange) * 20),
          description: `Historically ${avgChange > 0 ? 'positive' : 'negative'} in month ${month} (${avgChange.toFixed(1)}% avg)`,
          frequency: data.length
        });
      }

      if (volatilityRatio > 0.6) {
        patterns.push({
          type: 'volatile',
          period: `Month ${month}`,
          strength: volatilityRatio * 100,
          description: `High volatility period in month ${month} (${(volatilityRatio * 100).toFixed(0)}% of days)`,
          frequency: data.length
        });
      }
    });

    // Weekly patterns
    const weeklyData = marketData.reduce((acc, data) => {
      const dayOfWeek = dayjs(data.date).day();
      if (!acc[dayOfWeek]) acc[dayOfWeek] = [];
      acc[dayOfWeek].push(data);
      return acc;
    }, {} as Record<number, MarketData[]>);

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    Object.entries(weeklyData).forEach(([day, data]) => {
      if (data.length < 3) return;

      const avgChange = data.reduce((sum, d) => sum + d.priceChange, 0) / data.length;
      const avgVolume = data.reduce((sum, d) => sum + d.volume, 0) / data.length;
      
      // Compare to overall average
      const overallAvgVolume = marketData.reduce((sum, d) => sum + d.volume, 0) / marketData.length;
      const volumeRatio = avgVolume / overallAvgVolume;

      if (Math.abs(avgChange) > 1.5) {
        patterns.push({
          type: avgChange > 0 ? 'bullish' : 'bearish',
          period: dayNames[parseInt(day)],
          strength: Math.min(100, Math.abs(avgChange) * 30),
          description: `${dayNames[parseInt(day)]}s tend to be ${avgChange > 0 ? 'positive' : 'negative'} (${avgChange.toFixed(1)}% avg)`,
          frequency: data.length
        });
      }

      if (volumeRatio > 1.3) {
        patterns.push({
          type: 'volatile',
          period: dayNames[parseInt(day)],
          strength: Math.min(100, (volumeRatio - 1) * 100),
          description: `High trading activity on ${dayNames[parseInt(day)]}s (${(volumeRatio * 100).toFixed(0)}% above average)`,
          frequency: data.length
        });
      }
    });

    return patterns.sort((a, b) => b.strength - a.strength).slice(0, 6);
  }, [marketData]);

  // Detect anomalies
  const anomalies = useMemo((): Anomaly[] => {
    if (marketData.length < 10) return [];

    const anomalies: Anomaly[] = [];
    
    // Calculate thresholds
    const avgVolume = marketData.reduce((sum, d) => sum + d.volume, 0) / marketData.length;
    const volumeStdDev = Math.sqrt(
      marketData.reduce((sum, d) => sum + Math.pow(d.volume - avgVolume, 2), 0) / marketData.length
    );

    const priceChanges = marketData.map(d => Math.abs(d.priceChange));
    const avgPriceChange = priceChanges.reduce((sum, c) => sum + c, 0) / priceChanges.length;
    const priceChangeStdDev = Math.sqrt(
      priceChanges.reduce((sum, c) => sum + Math.pow(c - avgPriceChange, 2), 0) / priceChanges.length
    );

    marketData.forEach((data, index) => {
      // Volume spikes
      const volumeZScore = (data.volume - avgVolume) / volumeStdDev;
      if (volumeZScore > 2) {
        anomalies.push({
          date: data.date,
          type: 'volume_spike',
          severity: volumeZScore > 3 ? 'high' : volumeZScore > 2.5 ? 'medium' : 'low',
          description: `Unusual trading volume: ${((data.volume / avgVolume - 1) * 100).toFixed(0)}% above average`,
          value: data.volume
        });
      }

      // Volatility spikes
      if (data.volatilityLevel === 'high' && Math.abs(data.priceChange) > avgPriceChange + 2 * priceChangeStdDev) {
        anomalies.push({
          date: data.date,
          type: 'volatility_spike',
          severity: Math.abs(data.priceChange) > avgPriceChange + 3 * priceChangeStdDev ? 'high' : 'medium',
          description: `High volatility event: ${Math.abs(data.priceChange).toFixed(1)}% price movement`,
          value: Math.abs(data.priceChange)
        });
      }

      // Price gaps (compare with previous day)
      if (index > 0) {
        const prevData = marketData[index - 1];
        const gap = Math.abs(data.priceChange - prevData.priceChange);
        if (gap > 5) {
          anomalies.push({
            date: data.date,
            type: 'price_gap',
            severity: gap > 10 ? 'high' : gap > 7 ? 'medium' : 'low',
            description: `Significant price gap: ${gap.toFixed(1)}% difference from previous day`,
            value: gap
          });
        }
      }
    });

    return anomalies
      .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf())
      .slice(0, 10);
  }, [marketData]);

  const getPatternIcon = (type: SeasonalPattern['type']) => {
    switch (type) {
      case 'bullish': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'bearish': return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'volatile': return <Activity className="h-4 w-4 text-orange-600" />;
      case 'stable': return <Calendar className="h-4 w-4 text-blue-600" />;
    }
  };

  const getPatternColor = (type: SeasonalPattern['type']) => {
    switch (type) {
      case 'bullish': return 'bg-green-100 text-green-800 border-green-200';
      case 'bearish': return 'bg-red-100 text-red-800 border-red-200';
      case 'volatile': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'stable': return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getAnomalySeverityColor = (severity: Anomaly['severity']) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Seasonal Patterns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Seasonal Patterns
          </CardTitle>
        </CardHeader>
        <CardContent>
          {seasonalPatterns.length > 0 ? (
            <div className="grid gap-3">
              {seasonalPatterns.map((pattern, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border transition-all duration-200 hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    {getPatternIcon(pattern.type)}
                    <div>
                      <div className="font-medium text-sm">{pattern.period}</div>
                      <div className="text-xs text-muted-foreground">{pattern.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getPatternColor(pattern.type)}>
                      {pattern.strength.toFixed(0)}% strength
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      {pattern.frequency} samples
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Insufficient data for pattern analysis</p>
              <p className="text-xs">Need at least 30 days of data</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Market Anomalies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Market Anomalies
          </CardTitle>
        </CardHeader>
        <CardContent>
          {anomalies.length > 0 ? (
            <div className="space-y-3">
              {anomalies.map((anomaly, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border transition-all duration-200 hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <div>
                      <div className="font-medium text-sm">
                        {dayjs(anomaly.date).format('MMM D, YYYY')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {anomaly.description}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={getAnomalySeverityColor(anomaly.severity)}
                    >
                      {anomaly.severity}
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      {anomaly.type.replace('_', ' ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No significant anomalies detected</p>
              <p className="text-xs">Market data appears normal</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 