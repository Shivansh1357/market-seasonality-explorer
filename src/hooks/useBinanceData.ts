import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';
import { 
  fetchMarketData, 
  fetchOrderBook, 
  fetch24hrTicker,
  getAvailableSymbols,
  BinanceWebSocket,
  BinanceOrderBook
} from '@/lib/binance';
import { MarketData } from '@/types/market';

/**
 * Hook to fetch market data for a symbol and date range
 */
export function useMarketData(
  symbol: string,
  startDate: Date,
  endDate: Date,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['marketData', symbol, startDate.getTime(), endDate.getTime()],
    queryFn: () => fetchMarketData(symbol, startDate, endDate),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  });
}

/**
 * Hook to fetch orderbook data
 */
export function useOrderBook(symbol: string, limit: number = 100, enabled: boolean = true) {
  return useQuery({
    queryKey: ['orderbook', symbol, limit],
    queryFn: () => fetchOrderBook(symbol, limit),
    enabled,
    staleTime: 1000, // 1 second
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5000, // Refetch every 5 seconds
    retry: 2
  });
}

/**
 * Hook to fetch 24hr ticker data
 */
export function use24hrTicker(symbol: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['ticker24hr', symbol],
    queryFn: () => fetch24hrTicker(symbol),
    enabled,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 2
  });
}

/**
 * Hook to fetch available trading symbols
 */
export function useAvailableSymbols() {
  return useQuery({
    queryKey: ['availableSymbols'],
    queryFn: getAvailableSymbols,
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    retry: 1
  });
}

/**
 * Hook for real-time WebSocket orderbook data
 */
export function useRealtimeOrderbook(symbol: string, enabled: boolean = true) {
  const [orderbook, setOrderbook] = useState<BinanceOrderBook | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ws, setWs] = useState<BinanceWebSocket | null>(null);

  const handleData = useCallback((data: unknown) => {
    const parsedData = data as { bids?: unknown; asks?: unknown; lastUpdateId?: number; u?: number; b?: unknown; a?: unknown };
    if (parsedData.bids && parsedData.asks) {
              setOrderbook({
          lastUpdateId: parsedData.lastUpdateId || parsedData.u || 0,
          bids: (parsedData.bids || parsedData.b) as [string, string][],
          asks: (parsedData.asks || parsedData.a) as [string, string][]
        });
      setError(null);
    }
  }, []);

  const handleError = useCallback((_error: Event) => {
    setError('WebSocket connection error');
    setIsConnected(false);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const websocket = new BinanceWebSocket(symbol, handleData, handleError);
    setWs(websocket);
    websocket.connect();
    setIsConnected(true);

    return () => {
      websocket.disconnect();
      setIsConnected(false);
    };
  }, [symbol, enabled, handleData, handleError]);

  return {
    orderbook,
    isConnected,
    error,
    disconnect: () => {
      ws?.disconnect();
      setIsConnected(false);
    }
  };
}

/**
 * Hook to manage multiple symbols data
 */
export function useMultiSymbolData(symbols: string[], startDate: Date, endDate: Date) {
  const queryClient = useQueryClient();

  const results = useQuery({
    queryKey: ['multiSymbolData', symbols, startDate.getTime(), endDate.getTime()],
    queryFn: async () => {
      const promises = symbols.map(symbol => fetchMarketData(symbol, startDate, endDate));
      const results = await Promise.allSettled(promises);
      
      return results.map((result, index) => ({
        symbol: symbols[index],
        data: result.status === 'fulfilled' ? result.value : null,
        error: result.status === 'rejected' ? result.reason : null
      }));
    },
    enabled: symbols.length > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });

  const refetchAll = useCallback(() => {
    symbols.forEach(symbol => {
      queryClient.invalidateQueries({
        queryKey: ['marketData', symbol]
      });
    });
  }, [symbols, queryClient]);

  return {
    ...results,
    refetchAll
  };
}

/**
 * Hook for data prefetching
 */
export function usePrefetchMarketData() {
  const queryClient = useQueryClient();

  const prefetchSymbol = useCallback(async (
    symbol: string, 
    startDate: Date, 
    endDate: Date
  ) => {
    await queryClient.prefetchQuery({
      queryKey: ['marketData', symbol, startDate.getTime(), endDate.getTime()],
      queryFn: () => fetchMarketData(symbol, startDate, endDate),
      staleTime: 5 * 60 * 1000,
    });
  }, [queryClient]);

  const prefetchOrderbook = useCallback(async (symbol: string) => {
    await queryClient.prefetchQuery({
      queryKey: ['orderbook', symbol, 100],
      queryFn: () => fetchOrderBook(symbol, 100),
      staleTime: 1000,
    });
  }, [queryClient]);

  return {
    prefetchSymbol,
    prefetchOrderbook
  };
}

/**
 * Hook for error recovery and retry logic
 */
export function useDataRecovery() {
  const queryClient = useQueryClient();
  const [retryCount, setRetryCount] = useState(0);
  const [isRecovering, setIsRecovering] = useState(false);

  const retryFailedQueries = useCallback(async () => {
    setIsRecovering(true);
    setRetryCount(prev => prev + 1);

    try {
      await queryClient.refetchQueries({
        type: 'active',
        predicate: (query) => query.state.status === 'error'
      });
    } finally {
      setIsRecovering(false);
    }
  }, [queryClient]);

  const clearErrorQueries = useCallback(() => {
    queryClient.removeQueries({
      predicate: (query) => query.state.status === 'error'
    });
    setRetryCount(0);
  }, [queryClient]);

  return {
    retryFailedQueries,
    clearErrorQueries,
    retryCount,
    isRecovering
  };
} 