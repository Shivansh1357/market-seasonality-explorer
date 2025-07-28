'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ZoomIn, ZoomOut, RotateCcw, Filter } from 'lucide-react';
import { CalendarView } from '@/types/market';
import { useAvailableSymbols } from '@/hooks/useBinanceData';

interface FiltersBarProps {
  instrument: string;
  onInstrumentChange: (instrument: string) => void;
  metricType: string;
  onMetricTypeChange: (metricType: string) => void;
  timePeriod: string;
  onTimePeriodChange: (timePeriod: string) => void;
  view: CalendarView;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

const instruments = [
  { value: 'BTCUSDT', label: 'Bitcoin (BTC/USDT)' },
  { value: 'ETHUSDT', label: 'Ethereum (ETH/USDT)' },
  { value: 'ADAUSDT', label: 'Cardano (ADA/USDT)' },
  { value: 'SOLUSDT', label: 'Solana (SOL/USDT)' },
  { value: 'DOTUSDT', label: 'Polkadot (DOT/USDT)' },
  { value: 'LINKUSDT', label: 'Chainlink (LINK/USDT)' },
  { value: 'MATICUSDT', label: 'Polygon (MATIC/USDT)' },
  { value: 'AVAXUSDT', label: 'Avalanche (AVAX/USDT)' }
];

const metricTypes = [
  { value: 'volatility', label: 'Volatility Analysis' },
  { value: 'volume', label: 'Volume Analysis' },
  { value: 'liquidity', label: 'Liquidity Analysis' },
  { value: 'performance', label: 'Performance Analysis' },
  { value: 'combined', label: 'Combined Metrics' }
];

const timePeriods = [
  { value: '1M', label: 'Last Month' },
  { value: '3M', label: 'Last 3 Months' },
  { value: '6M', label: 'Last 6 Months' },
  { value: '1Y', label: 'Last Year' },
  { value: '2Y', label: 'Last 2 Years' },
  { value: 'ALL', label: 'All Time' }
];

export function FiltersBar({
  instrument,
  onInstrumentChange,
  metricType,
  onMetricTypeChange,
  timePeriod,
  onTimePeriodChange,
  view,
  onZoomIn,
  onZoomOut,
  onReset
}: FiltersBarProps) {
  const canZoomIn = view === 'monthly';
  const canZoomOut = view === 'daily';
  
  // Fetch available symbols from Binance
  const { data: availableSymbols } = useAvailableSymbols();
  
  // Create instruments list from available symbols or fallback to defaults
  const dynamicInstruments = React.useMemo(() => {
    if (availableSymbols && availableSymbols.length > 0) {
      return availableSymbols.map(symbol => ({
        value: symbol,
        label: symbol.replace('USDT', '/USDT')
      }));
    }
    return instruments; // fallback to static list
  }, [availableSymbols]);

  return (
    <div className="bg-white border rounded-lg p-3 sm:p-4 mb-6">
      <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
        {/* Filters Section */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Filter className="h-4 w-4" />
            Filters:
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
                         {/* Instrument Selector */}
             <div className="space-y-1 w-full sm:w-auto">
               <label className="text-xs text-gray-500 font-medium">Instrument</label>
               <Select value={instrument} onValueChange={onInstrumentChange}>
                 <SelectTrigger className="w-full sm:w-[180px]">
                   <SelectValue placeholder="Select instrument" />
                 </SelectTrigger>
                                 <SelectContent>
                   {dynamicInstruments.map((item) => (
                     <SelectItem key={item.value} value={item.value}>
                       {item.label}
                     </SelectItem>
                   ))}
                 </SelectContent>
              </Select>
            </div>

                         {/* Metric Type Selector */}
             <div className="space-y-1 w-full sm:w-auto">
               <label className="text-xs text-gray-500 font-medium">Metric Type</label>
               <Select value={metricType} onValueChange={onMetricTypeChange}>
                 <SelectTrigger className="w-full sm:w-[160px]">
                   <SelectValue placeholder="Select metric" />
                 </SelectTrigger>
                <SelectContent>
                  {metricTypes.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

                         {/* Time Period Selector */}
             <div className="space-y-1 w-full sm:w-auto">
               <label className="text-xs text-gray-500 font-medium">Time Period</label>
               <Select value={timePeriod} onValueChange={onTimePeriodChange}>
                 <SelectTrigger className="w-full sm:w-[140px]">
                   <SelectValue placeholder="Select period" />
                 </SelectTrigger>
                <SelectContent>
                  {timePeriods.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Zoom Controls Section */}
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium text-gray-700 mr-2">
            View Controls:
          </div>
          
          <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onZoomOut}
              disabled={!canZoomOut}
              className="h-8 w-8 p-0"
              title="Zoom Out (Monthly → Weekly → Daily)"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onZoomIn}
              disabled={!canZoomIn}
              className="h-8 w-8 p-0"
              title="Zoom In (Daily → Weekly → Monthly)"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            
            <div className="w-px h-6 bg-gray-300 mx-1" />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="h-8 w-8 p-0"
              title="Reset to default view"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      <div className="mt-3 pt-3 border-t">
        <div className="flex flex-wrap gap-2 items-center text-sm">
          <span className="text-gray-500 font-medium">Active:</span>
          
                     <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
             {dynamicInstruments.find(i => i.value === instrument)?.label || instrument}
           </span>
          
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {metricTypes.find(m => m.value === metricType)?.label || metricType}
          </span>
          
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            {timePeriods.find(t => t.value === timePeriod)?.label || timePeriod}
          </span>
          
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 capitalize">
            {view} View
          </span>
        </div>
      </div>
    </div>
  );
} 