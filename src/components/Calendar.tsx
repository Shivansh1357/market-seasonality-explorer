'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarProps, CalendarView } from '@/types/market';
import { CalendarCell } from './CalendarCell';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { getMarketDataForDate, aggregateDataByWeek, aggregateDataByMonth } from '@/lib/market-utils';
import dayjs from 'dayjs';
import { cn } from '@/lib/utils';

export function Calendar({ view, onViewChange, selectedDate, onDateSelect, marketData }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [focusedDate, setFocusedDate] = useState<Date | null>(null);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!focusedDate) return;

      const focused = dayjs(focusedDate);
      let newDate: dayjs.Dayjs;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          newDate = view === 'daily' ? focused.subtract(7, 'day') :
                   view === 'weekly' ? focused.subtract(1, 'month') :
                   focused.subtract(3, 'month');
          break;
        case 'ArrowDown':
          e.preventDefault();
          newDate = view === 'daily' ? focused.add(7, 'day') :
                   view === 'weekly' ? focused.add(1, 'month') :
                   focused.add(3, 'month');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          newDate = view === 'daily' ? focused.subtract(1, 'day') :
                   view === 'weekly' ? focused.subtract(1, 'week') :
                   focused.subtract(1, 'month');
          break;
        case 'ArrowRight':
          e.preventDefault();
          newDate = view === 'daily' ? focused.add(1, 'day') :
                   view === 'weekly' ? focused.add(1, 'week') :
                   focused.add(1, 'month');
          break;
        case 'Enter':
          e.preventDefault();
          onDateSelect(focusedDate);
          return;
        case 'Escape':
          e.preventDefault();
          setFocusedDate(null);
          return;
        default:
          return;
      }

      setFocusedDate(newDate.toDate());
      // Update current view if needed
      if (view === 'daily' && !newDate.isSame(currentDate, 'month')) {
        setCurrentDate(newDate);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedDate, view, currentDate, onDateSelect]);

  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    setCurrentDate(prev => 
      direction === 'prev' ? prev.subtract(1, 'month') : prev.add(1, 'month')
    );
  }, []);

  const navigateYear = useCallback((direction: 'prev' | 'next') => {
    setCurrentDate(prev => 
      direction === 'prev' ? prev.subtract(1, 'year') : prev.add(1, 'year')
    );
  }, []);

  const handleCellClick = useCallback((date: Date) => {
    onDateSelect(date);
    setFocusedDate(date);
  }, [onDateSelect]);

  const renderDailyView = () => {
    const startOfMonth = currentDate.startOf('month');
    const endOfMonth = currentDate.endOf('month');
    const startOfCalendar = startOfMonth.startOf('week');
    const endOfCalendar = endOfMonth.endOf('week');

    const days = [];
    let current = startOfCalendar;

    while (current.isBefore(endOfCalendar) || current.isSame(endOfCalendar, 'day')) {
      days.push(current.toDate());
      current = current.add(1, 'day');
    }

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="space-y-2">
                 {/* Week day headers */}
         <div className="grid grid-cols-7 gap-1">
           {weekDays.map(day => (
             <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
               {day}
             </div>
           ))}
         </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map(date => {
            const marketDataForDate = getMarketDataForDate(marketData, date);
            const isSelected = selectedDate && dayjs(date).isSame(selectedDate, 'day');
            const isFocused = focusedDate && dayjs(date).isSame(focusedDate, 'day');
            
            return (
              <div
                key={date.toISOString()}
                className={cn(
                  'relative',
                  isFocused && 'ring-2 ring-blue-400 ring-offset-2 rounded-md'
                )}
              >
                <CalendarCell
                  date={date}
                  marketData={marketDataForDate}
                  selected={!!isSelected}
                  onClick={handleCellClick}
                  view={view}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeeklyView = () => {
    const weekData = aggregateDataByWeek(marketData, currentDate.year());
    const startOfYear = dayjs().year(currentDate.year()).startOf('year');
    
    const weeks = [];
    for (let week = 1; week <= 52; week++) {
      const weekStart = startOfYear.add(week - 1, 'week').startOf('week');
      weeks.push(weekStart.toDate());
    }

    return (
      <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-13 gap-2">
        {weeks.map((weekStart, index) => {
          const weekNumber = index + 1;
          const aggregatedData = weekData.find(w => w.period === `${currentDate.year()}-W${weekNumber}`);
          const isSelected = selectedDate && dayjs(weekStart).isSame(selectedDate, 'week');
          const isFocused = focusedDate && dayjs(weekStart).isSame(focusedDate, 'week');
          
          // Convert aggregated data to MarketData format for the cell
          const cellMarketData = aggregatedData ? {
            date: dayjs(weekStart).format('YYYY-MM-DD'),
            volatilityLevel: aggregatedData.avgVolatility,
            volume: aggregatedData.totalVolume,
            performance: aggregatedData.avgPerformance,
            priceChange: aggregatedData.avgPriceChange,
            liquidity: aggregatedData.avgLiquidity,
          } : undefined;

          return (
            <div
              key={weekStart.toISOString()}
              className={cn(
                'relative',
                isFocused && 'ring-2 ring-blue-400 ring-offset-2 rounded-md'
              )}
            >
              <CalendarCell
                date={weekStart}
                marketData={cellMarketData}
                selected={!!isSelected}
                onClick={handleCellClick}
                view={view}
              />
            </div>
          );
        })}
      </div>
    );
  };

  const renderMonthlyView = () => {
    const monthData = aggregateDataByMonth(marketData, currentDate.year());
    
    const months = [];
    for (let month = 0; month < 12; month++) {
      const monthStart = dayjs().year(currentDate.year()).month(month).startOf('month');
      months.push(monthStart.toDate());
    }

    return (
      <div className="grid grid-cols-4 gap-2">
        {months.map(monthStart => {
          const monthKey = dayjs(monthStart).format('YYYY-MM');
          const aggregatedData = monthData.find(m => m.period === monthKey);
          const isSelected = selectedDate && dayjs(monthStart).isSame(selectedDate, 'month');
          const isFocused = focusedDate && dayjs(monthStart).isSame(focusedDate, 'month');
          
          // Convert aggregated data to MarketData format for the cell
          const cellMarketData = aggregatedData ? {
            date: dayjs(monthStart).format('YYYY-MM-DD'),
            volatilityLevel: aggregatedData.avgVolatility,
            volume: aggregatedData.totalVolume,
            performance: aggregatedData.avgPerformance,
            priceChange: aggregatedData.avgPriceChange,
            liquidity: aggregatedData.avgLiquidity,
          } : undefined;

          return (
            <div
              key={monthStart.toISOString()}
              className={cn(
                'relative',
                isFocused && 'ring-2 ring-blue-400 ring-offset-2 rounded-md'
              )}
            >
              <CalendarCell
                date={monthStart}
                marketData={cellMarketData}
                selected={!!isSelected}
                onClick={handleCellClick}
                view={view}
              />
            </div>
          );
        })}
      </div>
    );
  };

  const getTitle = () => {
    switch (view) {
      case 'daily':
        return currentDate.format('MMMM YYYY');
      case 'weekly':
        return `${currentDate.year()} - Weekly View`;
      case 'monthly':
        return `${currentDate.year()} - Monthly View`;
      default:
        return '';
    }
  };

  return (
    <Card className="w-full theme-transition">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <CalendarIcon className="h-5 w-5" />
            Market Seasonality Calendar
          </CardTitle>
          
          {/* View Toggle */}
          <div className="flex gap-1 bg-muted rounded-lg p-1 theme-transition">
            {(['daily', 'weekly', 'monthly'] as CalendarView[]).map(v => (
              <Button
                key={v}
                variant={view === v ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewChange(v)}
                className="capitalize theme-transition hover-lift"
              >
                {v}
              </Button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => view === 'daily' ? navigateMonth('prev') : navigateYear('prev')}
              className="h-9 w-9 p-0 sm:h-8 sm:w-auto sm:px-3"
              aria-label="Previous period"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Prev</span>
            </Button>
            
            <h2 className="text-base sm:text-lg font-semibold min-w-[180px] sm:min-w-[200px] text-center">
              {getTitle()}
            </h2>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => view === 'daily' ? navigateMonth('next') : navigateYear('next')}
              className="h-9 w-9 p-0 sm:h-8 sm:w-auto sm:px-3"
              aria-label="Next period"
            >
              <ChevronRight className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Next</span>
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCurrentDate(dayjs());
              onDateSelect(new Date());
              setFocusedDate(new Date());
            }}
            className="w-full sm:w-auto"
          >
            Today
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="min-h-[400px]">
          {view === 'daily' && renderDailyView()}
          {view === 'weekly' && renderWeeklyView()}
          {view === 'monthly' && renderMonthlyView()}
        </div>
        
                 {/* Legend */}
         <div className="mt-6 pt-4 border-t border-border">
           <div className="flex flex-wrap gap-4 text-sm">
             <div className="flex items-center gap-2">
               <span className="font-medium text-foreground">Volatility:</span>
               <div className="flex gap-1">
                 <div className="w-4 h-4 bg-green-100 dark:bg-green-900/30 border border-border rounded"></div>
                 <span className="text-xs text-muted-foreground">Low</span>
                 <div className="w-4 h-4 bg-orange-100 dark:bg-orange-900/30 border border-border rounded"></div>
                 <span className="text-xs text-muted-foreground">Medium</span>
                 <div className="w-4 h-4 bg-red-100 dark:bg-red-900/30 border border-border rounded"></div>
                 <span className="text-xs text-muted-foreground">High</span>
               </div>
             </div>
             <div className="flex items-center gap-2">
               <span className="font-medium text-foreground">Volume:</span>
               <div className="w-8 h-2 bg-primary rounded"></div>
               <span className="text-xs text-muted-foreground">Bar height</span>
             </div>
           </div>
         </div>
      </CardContent>
    </Card>
  );
} 