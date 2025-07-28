'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { CalendarCellProps } from '@/types/market';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatVolume } from '@/lib/market-utils';
import dayjs from 'dayjs';

export function CalendarCell({ date, marketData, selected, onClick, view }: CalendarCellProps) {
  const isToday = dayjs(date).isSame(dayjs(), 'day');
  const isWeekend = [0, 6].includes(date.getDay());
  
  // Get volatility background color using CSS variables
  const getVolatilityColor = () => {
    if (!marketData) return 'bg-muted/30';
    
    switch (marketData.volatilityLevel) {
      case 'low':
        return 'bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50';
      case 'medium':
        return 'bg-orange-100 hover:bg-orange-200 dark:bg-orange-900/30 dark:hover:bg-orange-900/50';
      case 'high':
        return 'bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50';
      default:
        return 'bg-muted/30';
    }
  };

  // Get performance icon
  const getPerformanceIcon = () => {
    if (!marketData) return null;
    
    const iconProps = { size: 12, className: 'opacity-70' };
    
    switch (marketData.performance) {
      case 'positive':
        return <TrendingUp {...iconProps} className={cn(iconProps.className, 'text-green-600')} />;
      case 'negative':
        return <TrendingDown {...iconProps} className={cn(iconProps.className, 'text-red-600')} />;
      case 'neutral':
        return <Minus {...iconProps} className={cn(iconProps.className, 'text-gray-600')} />;
      default:
        return null;
    }
  };

  // Get volume bar height (0-100% of container)
  const getVolumeBarHeight = () => {
    if (!marketData) return 0;
    // Normalize volume to 0-100 scale for visual representation
    const maxVolume = 1100000; // Based on our mock data range
    return Math.min((marketData.volume / maxVolume) * 100, 100);
  };

  // Get liquidity gradient
  const getLiquidityGradient = () => {
    if (!marketData) return '';
    const liquidity = marketData.liquidity;
    if (liquidity > 70) return 'from-blue-200 to-blue-300';
    if (liquidity > 40) return 'from-yellow-200 to-yellow-300';
    return 'from-gray-200 to-gray-300';
  };

  const cellContent = (
    <div
      className={cn(
        'relative w-full h-10 sm:h-12 p-1 cursor-pointer border border-border rounded-md touch-manipulation',
        'calendar-cell theme-transition focus-ring hover-lift',
        getVolatilityColor(),
        selected && 'ring-2 ring-primary ring-offset-1',
        isToday && 'ring-2 ring-blue-500',
        isWeekend && 'opacity-50',
        view === 'monthly' && 'h-12 sm:h-16',
        view === 'weekly' && 'h-16 sm:h-20'
      )}
      onClick={() => onClick(date)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(date);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`${dayjs(date).format('MMMM D, YYYY')}${marketData ? `, volatility: ${marketData.volatilityLevel}, volume: ${formatVolume(marketData.volume)}` : ', no data available'}`}
    >
      {/* Date number */}
      <div className="flex items-start justify-between h-full">
        <span className={cn(
          'text-xs font-medium text-foreground',
          isToday && 'text-blue-600 dark:text-blue-400 font-bold',
          selected && 'text-primary font-bold'
        )}>
          {view === 'daily' ? date.getDate() : 
           view === 'weekly' ? `W${dayjs(date).week()}` :
           dayjs(date).format('MMM')}
        </span>
        
        {/* Performance icon */}
        <div className="flex-shrink-0">
          {getPerformanceIcon()}
        </div>
      </div>

      {/* Volume bar - positioned at bottom */}
      {marketData && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted rounded-b-md overflow-hidden">
          <div
            className="h-full bg-primary theme-transition"
            style={{ width: `${getVolumeBarHeight()}%` }}
          />
        </div>
      )}

      {/* Liquidity gradient overlay */}
      {marketData && marketData.liquidity && (
        <div className={cn(
          'absolute inset-0 opacity-20 rounded-md bg-gradient-to-br',
          getLiquidityGradient()
        )} />
      )}

      {/* Price change indicator */}
      {marketData && Math.abs(marketData.priceChange) > 2 && (
        <div className={cn(
          'absolute top-1 right-1 w-2 h-2 rounded-full',
          marketData.priceChange > 0 ? 'bg-green-500' : 'bg-red-500'
        )} />
      )}
    </div>
  );

  if (!marketData) {
    return cellContent;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {cellContent}
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1 text-sm">
            <div className="font-semibold">
              {dayjs(date).format('MMM D, YYYY')}
            </div>
                         <div className="grid grid-cols-2 gap-2 text-xs">
               <div>
                 <span className="text-muted-foreground">Volatility:</span>
                 <span className={cn(
                   'ml-1 capitalize font-medium',
                   marketData.volatilityLevel === 'low' && 'text-green-600 dark:text-green-400',
                   marketData.volatilityLevel === 'medium' && 'text-orange-600 dark:text-orange-400',
                   marketData.volatilityLevel === 'high' && 'text-red-600 dark:text-red-400'
                 )}>
                   {marketData.volatilityLevel}
                 </span>
               </div>
               <div>
                 <span className="text-muted-foreground">Volume:</span>
                 <span className="ml-1 font-medium text-foreground">
                   {formatVolume(marketData.volume)}
                 </span>
               </div>
               <div>
                 <span className="text-muted-foreground">Change:</span>
                 <span className={cn(
                   'ml-1 font-medium',
                   marketData.priceChange > 0 && 'text-green-600 dark:text-green-400',
                   marketData.priceChange < 0 && 'text-red-600 dark:text-red-400',
                   marketData.priceChange === 0 && 'text-muted-foreground'
                 )}>
                   {marketData.priceChange > 0 ? '+' : ''}{marketData.priceChange.toFixed(2)}%
                 </span>
               </div>
               <div>
                 <span className="text-muted-foreground">Liquidity:</span>
                 <span className="ml-1 font-medium text-foreground">
                   {marketData.liquidity}%
                 </span>
               </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 