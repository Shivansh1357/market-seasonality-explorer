'use client';

import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/Calendar';
import { MarketDetailsPanel } from '@/components/MarketDetailsPanel';
import { FiltersBar } from '@/components/FiltersBar';
import { CalendarView, MarketData } from '@/types/market';
import { generateMockMarketData, getMarketDataForDate } from '@/lib/market-utils';
import { exportToCSV, exportCalendarAsPNG, generateSummaryReport } from '@/lib/export-utils';
import { exportEnhancedCSV, exportAnalysisReport, exportJSONData } from '@/lib/enhanced-export';
import { PatternAnalysis } from '@/components/PatternAnalysis';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useMarketData, useDataRecovery } from '@/hooks/useBinanceData';
import { Button } from '@/components/ui/button';
import { Download, FileText, Image, Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import dayjs from 'dayjs';

export default function Home() {
  const [view, setView] = useState<CalendarView>('daily');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [useRealData, setUseRealData] = useState(true);
  
  // Filter states
  const [instrument, setInstrument] = useState('BTCUSDT');
  const [metricType, setMetricType] = useState('combined');
  const [timePeriod, setTimePeriod] = useState('6M');

  // Calculate date range based on time period
  const dateRange = React.useMemo(() => {
    const now = dayjs();
    let startDate: dayjs.Dayjs;
    
    switch (timePeriod) {
      case '1M':
        startDate = now.subtract(1, 'month');
        break;
      case '3M':
        startDate = now.subtract(3, 'month');
        break;
      case '6M':
        startDate = now.subtract(6, 'month');
        break;
      case '1Y':
        startDate = now.subtract(1, 'year');
        break;
      case '2Y':
        startDate = now.subtract(2, 'year');
        break;
      case 'ALL':
        startDate = now.subtract(3, 'year');
        break;
      default:
        startDate = now.subtract(6, 'month');
    }
    
    return {
      startDate: startDate.toDate(),
      endDate: now.add(1, 'day').toDate()
    };
  }, [timePeriod]);

  // Fetch real market data from Binance
  const { 
    data: realMarketData, 
    isLoading: isLoadingRealData, 
    error: realDataError,
    refetch: refetchRealData
  } = useMarketData(instrument, dateRange.startDate, dateRange.endDate, useRealData);

  // Data recovery for error handling (currently unused but available for future enhancements)
  const { } = useDataRecovery();

  // Fallback to mock data
  const [mockData, setMockData] = useState<MarketData[]>([]);

  // Generate mock data as fallback
  useEffect(() => {
    if (!useRealData || realDataError) {
      const mockDataGenerated = generateMockMarketData(dateRange.startDate, dateRange.endDate);
      setMockData(mockDataGenerated);
    }
  }, [dateRange.startDate, dateRange.endDate, useRealData, realDataError]);

  // Determine which data to use
  const marketData: MarketData[] = React.useMemo(() => {
    if (useRealData && realMarketData && !realDataError) {
      return realMarketData;
    }
    return mockData;
  }, [useRealData, realMarketData, realDataError, mockData]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setIsPanelOpen(true);
  };

  const handleZoomIn = () => {
    if (view === 'daily') setView('weekly');
    else if (view === 'weekly') setView('monthly');
  };

  const handleZoomOut = () => {
    if (view === 'monthly') setView('weekly');
    else if (view === 'weekly') setView('daily');
  };

  const handleReset = () => {
    setView('daily');
    setSelectedDate(new Date());
    setInstrument('BTCUSDT');
    setMetricType('combined');
    setTimePeriod('6M');
    setIsPanelOpen(false);
  };

  const selectedMarketData = selectedDate ? getMarketDataForDate(marketData, selectedDate) : null;

  const handleExportCSV = () => {
    exportEnhancedCSV(marketData, `market-analysis-${instrument}-${timePeriod}`);
  };

  const handleExportPNG = () => {
    exportCalendarAsPNG('calendar-container', `calendar-${instrument}-${view}`);
  };

  const handleExportReport = () => {
    exportAnalysisReport(marketData, `analysis-report-${instrument}-${timePeriod}`);
  };

  const handleExportJSON = () => {
    exportJSONData(marketData, {
      instrument,
      timePeriod,
      view,
      analysisDate: dayjs().toISOString(),
      settings: { useRealData, metricType }
    });
  };

  return (
    <main className="min-h-screen bg-background p-4 theme-transition">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Market Seasonality Explorer
              </h1>
              <p className="text-lg text-muted-foreground">
                Explore market patterns, volatility, and trading volumes across different time periods
              </p>
            </div>
            <ThemeToggle />
          </div>
          
          {/* Data Source Status */}
          <div className="mt-4 flex items-center gap-3">
            <div className="flex items-center gap-2">
              {useRealData ? (
                <>
                  <Wifi className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">
                    {isLoadingRealData ? 'Loading real data...' : 'Real Binance Data'}
                  </span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-700">Mock Data Mode</span>
                </>
              )}
            </div>
            
            {realDataError && (
              <div className="flex items-center gap-1 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">API Error - Fallback Active</span>
              </div>
            )}
            
            <div className="text-sm text-gray-500">
              {marketData.length} data points loaded
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Filters Bar */}
                    <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <FiltersBar
              instrument={instrument}
              onInstrumentChange={setInstrument}
              metricType={metricType}
              onMetricTypeChange={setMetricType}
              timePeriod={timePeriod}
              onTimePeriodChange={setTimePeriod}
              view={view}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onReset={handleReset}
            />
          </div>

          {/* Data Source & Export Controls */}
          <div className="bg-card rounded-lg border border-border p-4 animate-slide-up theme-transition" style={{ animationDelay: '0.2s' }}>
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Data Source & Export</h3>
                                 <p className="text-xs text-gray-500">Switch between real Binance data and mock data, or download your analysis</p>
                
                {/* Data Source Toggle */}
                <div className="mt-3 flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant={useRealData ? "default" : "outline"}
                      size="sm"
                      onClick={() => setUseRealData(true)}
                      className="text-xs"
                    >
                      <Wifi className="h-3 w-3 mr-1" />
                                             Real Data
                     </Button>
                     <Button
                       variant={!useRealData ? "default" : "outline"}
                       size="sm"
                       onClick={() => setUseRealData(false)}
                       className="text-xs"
                     >
                       <WifiOff className="h-3 w-3 mr-1" />
                       Mock Data
                     </Button>
                  </div>
                  
                  {realDataError && (
                    <div className="flex items-center gap-2 text-orange-600">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-xs">API Error - Using Mock Data</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => refetchRealData()}
                        className="h-6 w-6 p-0"
                      >
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  
                                {isLoadingRealData && (
                <div className="flex items-center gap-2 text-blue-600">
                  <LoadingSpinner size="sm" />
                  <span className="text-xs">Loading real data...</span>
                </div>
              )}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportCSV}
                  className="w-full sm:w-auto"
                >
                                     <Download className="h-4 w-4 mr-2" />
                   Export CSV
                 </Button>
                 <Button
                   variant="outline"
                   size="sm"
                   onClick={handleExportPNG}
                   className="w-full sm:w-auto"
                 >
                   <Image className="h-4 w-4 mr-2" />
                   Export PNG
                 </Button>
                                  <Button
                   variant="outline"
                   size="sm"
                   onClick={handleExportReport}
                   className="w-full sm:w-auto"
                 >
                   <FileText className="h-4 w-4 mr-2" />
                   Export Report
                 </Button>
                 <Button
                   variant="outline"
                   size="sm"
                   onClick={handleExportJSON}
                   className="w-full sm:w-auto"
                 >
                   <Download className="h-4 w-4 mr-2" />
                   Export JSON
                 </Button>
              </div>
            </div>
          </div>

          {/* Calendar Component */}
          <div id="calendar-container" className="animate-scale-in" style={{ animationDelay: '0.3s' }}>
            <Calendar
              view={view}
              onViewChange={setView}
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              marketData={marketData}
            />
          </div>

          {/* Pattern Analysis */}
          <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <PatternAnalysis 
              marketData={marketData}
              selectedDate={selectedDate}
            />
          </div>

          {/* Selected Date Info */}
          {selectedDate && (
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">
                Selected Date: {dayjs(selectedDate).format('MMMM D, YYYY')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {view.charAt(0).toUpperCase() + view.slice(1)}
                  </div>
                  <div className="text-sm text-gray-500">Current View</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {marketData.length}
                  </div>
                  <div className="text-sm text-gray-500">Data Points</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {dayjs(selectedDate).format('dddd')}
                  </div>
                  <div className="text-sm text-gray-500">Day of Week</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {selectedMarketData ? selectedMarketData.volatilityLevel.toUpperCase() : 'N/A'}
                  </div>
                  <div className="text-sm text-gray-500">Volatility</div>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              How to Use
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
              <div>
                <h4 className="font-medium mb-2">Navigation:</h4>
                <ul className="space-y-1">
                  <li>• Use arrow buttons to navigate months/years</li>
                  <li>• Click &quot;Today&quot; to return to current date</li>
                  <li>• Switch between Daily, Weekly, and Monthly views</li>
                  <li>• Click any cell to open detailed panel</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Keyboard Shortcuts:</h4>
                <ul className="space-y-1">
                  <li>• Arrow keys: Navigate dates</li>
                  <li>• Enter: Select focused date</li>
                  <li>• Escape: Clear focus</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Filters & Controls:</h4>
                <ul className="space-y-1">
                  <li>• Select different instruments</li>
                  <li>• Choose analysis type</li>
                  <li>• Adjust time period</li>
                  <li>• Use zoom controls for quick view changes</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">Visual Legend</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Volatility Colors:</h4>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-100 border rounded"></div>
                    <span>Low Volatility</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-100 border rounded"></div>
                    <span>Medium Volatility</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-100 border rounded"></div>
                    <span>High Volatility</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Volume Indicator:</h4>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-2 bg-blue-500 rounded"></div>
                    <span>Volume bar at bottom</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Height represents relative volume
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Performance Icons:</h4>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">↗</span>
                    <span>Positive performance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-red-600">↘</span>
                    <span>Negative performance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">—</span>
                    <span>Neutral performance</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Special Indicators:</h4>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Large positive change (&gt;2%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>Large negative change (&gt;2%)</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Liquidity shown as gradient overlay
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Market Details Panel */}
        <MarketDetailsPanel
          isOpen={isPanelOpen}
          onClose={() => setIsPanelOpen(false)}
          date={selectedDate}
          marketData={selectedMarketData || null}
          historicalData={marketData}
        />
      </div>
    </main>
  );
}
