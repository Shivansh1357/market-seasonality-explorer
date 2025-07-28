import axios from 'axios';
import { MarketData, VolatilityLevel, Performance } from '@/types/market';
import dayjs from 'dayjs';

// Binance API base URL
const BINANCE_API_BASE = 'https://api.binance.com/api/v3';
const BINANCE_WS_BASE = 'wss://stream.binance.com:9443/ws';

// Types for Binance API responses
export interface BinanceOrderBook {
  lastUpdateId: number;
  bids: [string, string][];
  asks: [string, string][];
}

export interface BinanceKline {
  openTime: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  closeTime: number;
  quoteAssetVolume: string;
  numberOfTrades: number;
  takerBuyBaseAssetVolume: string;
  takerBuyQuoteAssetVolume: string;
}

export interface BinanceTicker24hr {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  weightedAvgPrice: string;
  prevClosePrice: string;
  lastPrice: string;
  lastQty: string;
  bidPrice: string;
  askPrice: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
  openTime: number;
  closeTime: number;
  firstId: number;
  lastId: number;
  count: number;
}

// Create axios instance with timeout and retry logic
const binanceApi = axios.create({
  baseURL: BINANCE_API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add retry interceptor
binanceApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (!config || !config.retry) {
      config.retry = 0;
    }
    
    if (config.retry < 3 && error.response?.status >= 500) {
      config.retry += 1;
      await new Promise(resolve => setTimeout(resolve, 1000 * config.retry));
      return binanceApi(config);
    }
    
    return Promise.reject(error);
  }
);

/**
 * Fetch orderbook data for a symbol
 */
export async function fetchOrderBook(symbol: string = 'BTCUSDT', limit: number = 100): Promise<BinanceOrderBook> {
  try {
    const response = await binanceApi.get('/depth', {
      params: { symbol: symbol.toUpperCase(), limit }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch orderbook:', error);
    throw new Error(`Failed to fetch orderbook for ${symbol}`);
  }
}

/**
 * Fetch historical kline data
 */
export async function fetchKlines(
  symbol: string = 'BTCUSDT',
  interval: string = '1d',
  limit: number = 500,
  startTime?: number,
  endTime?: number
): Promise<BinanceKline[]> {
  try {
    const params: Record<string, unknown> = {
      symbol: symbol.toUpperCase(),
      interval,
      limit
    };
    
    if (startTime) params.startTime = startTime;
    if (endTime) params.endTime = endTime;
    
    const response = await binanceApi.get('/klines', { params });
    
    return response.data.map((kline: unknown[]) => ({
      openTime: kline[0],
      open: kline[1],
      high: kline[2],
      low: kline[3],
      close: kline[4],
      volume: kline[5],
      closeTime: kline[6],
      quoteAssetVolume: kline[7],
      numberOfTrades: kline[8],
      takerBuyBaseAssetVolume: kline[9],
      takerBuyQuoteAssetVolume: kline[10]
    }));
  } catch (error) {
    console.error('Failed to fetch klines:', error);
    throw new Error(`Failed to fetch klines for ${symbol}`);
  }
}

/**
 * Fetch 24hr ticker statistics
 */
export async function fetch24hrTicker(symbol: string = 'BTCUSDT'): Promise<BinanceTicker24hr> {
  try {
    const response = await binanceApi.get('/ticker/24hr', {
      params: { symbol: symbol.toUpperCase() }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch 24hr ticker:', error);
    throw new Error(`Failed to fetch 24hr ticker for ${symbol}`);
  }
}

/**
 * Calculate volatility from price data
 */
export function calculateVolatility(prices: number[], period: number = 20): number {
  if (prices.length < period) return 0;
  
  const recentPrices = prices.slice(-period);
  const returns = [];
  
  for (let i = 1; i < recentPrices.length; i++) {
    const returnValue = (recentPrices[i] - recentPrices[i - 1]) / recentPrices[i - 1];
    returns.push(returnValue);
  }
  
  const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
  
  return Math.sqrt(variance * 252); // Annualized volatility
}

/**
 * Calculate liquidity metrics from orderbook
 */
export function calculateLiquidityMetrics(orderbook: BinanceOrderBook) {
  const bids = orderbook.bids.slice(0, 10); // Top 10 bids
  const asks = orderbook.asks.slice(0, 10); // Top 10 asks
  
  const bidVolume = bids.reduce((sum, [price, quantity]) => sum + parseFloat(quantity), 0);
  const askVolume = asks.reduce((sum, [price, quantity]) => sum + parseFloat(quantity), 0);
  const totalVolume = bidVolume + askVolume;
  
  const bestBid = parseFloat(bids[0]?.[0] || '0');
  const bestAsk = parseFloat(asks[0]?.[0] || '0');
  const spread = bestAsk - bestBid;
  const spreadPercent = bestBid > 0 ? (spread / bestBid) * 100 : 0;
  
  // Calculate depth (volume within 1% of best price)
  const midPrice = (bestBid + bestAsk) / 2;
  const depthThreshold = midPrice * 0.01; // 1%
  
  const bidDepth = bids
    .filter(([price]) => parseFloat(price) >= bestBid - depthThreshold)
    .reduce((sum, [, quantity]) => sum + parseFloat(quantity), 0);
    
  const askDepth = asks
    .filter(([price]) => parseFloat(price) <= bestAsk + depthThreshold)
    .reduce((sum, [, quantity]) => sum + parseFloat(quantity), 0);
  
  return {
    totalVolume,
    bidVolume,
    askVolume,
    spread,
    spreadPercent,
    bidDepth,
    askDepth,
    liquidity: Math.min(100, Math.max(0, 100 - (spreadPercent * 20))) // Liquidity score 0-100
  };
}

/**
 * Convert Binance data to our MarketData format
 */
export function convertToMarketData(
  klines: BinanceKline[],
  orderbooks: BinanceOrderBook[],
  tickers: BinanceTicker24hr[]
): MarketData[] {
  return klines.map((kline, index) => {
    const date = dayjs(kline.openTime).format('YYYY-MM-DD');
    const close = parseFloat(kline.close);
    const open = parseFloat(kline.open);
    const high = parseFloat(kline.high);
    const low = parseFloat(kline.low);
    const volume = parseFloat(kline.volume);
    
    // Calculate price change
    const priceChange = ((close - open) / open) * 100;
    
    // Calculate volatility from high-low range
    const dayVolatility = ((high - low) / open) * 100;
    
    // Determine volatility level
    let volatilityLevel: VolatilityLevel;
    if (dayVolatility < 2) volatilityLevel = 'low';
    else if (dayVolatility < 5) volatilityLevel = 'medium';
    else volatilityLevel = 'high';
    
    // Determine performance
    let performance: Performance;
    if (Math.abs(priceChange) < 0.5) performance = 'neutral';
    else if (priceChange > 0) performance = 'positive';
    else performance = 'negative';
    
    // Get liquidity from corresponding orderbook (if available)
    const orderbook = orderbooks[index];
    const liquidity = orderbook ? calculateLiquidityMetrics(orderbook).liquidity : 50;
    
    return {
      date,
      volatilityLevel,
      volume: Math.round(volume),
      performance,
      priceChange: Number(priceChange.toFixed(2)),
      liquidity: Math.round(liquidity)
    };
  });
}

/**
 * Fetch comprehensive market data for a symbol and date range
 */
export async function fetchMarketData(
  symbol: string = 'BTCUSDT',
  startDate: Date,
  endDate: Date
): Promise<MarketData[]> {
  try {
    const startTime = startDate.getTime();
    const endTime = endDate.getTime();
    
    // Fetch historical klines
    const klines = await fetchKlines(symbol, '1d', 500, startTime, endTime);
    
    // For demo, we'll use current orderbook for all dates
    // In production, you'd need historical orderbook data or use kline data for liquidity estimation
    const currentOrderbook = await fetchOrderBook(symbol, 100);
    const orderbooks = new Array(klines.length).fill(currentOrderbook);
    
    // Fetch current ticker for reference
    const ticker = await fetch24hrTicker(symbol);
    const tickers = new Array(klines.length).fill(ticker);
    
    return convertToMarketData(klines, orderbooks, tickers);
  } catch (error) {
    console.error('Failed to fetch market data:', error);
    throw error;
  }
}

/**
 * WebSocket connection for real-time data
 */
export class BinanceWebSocket {
  private ws: WebSocket | null = null;
  private symbol: string;
  private onData: (data: unknown) => void;
  private onError: (error: Event) => void;
  
  constructor(symbol: string, onData: (data: unknown) => void, onError: (error: Event) => void) {
    this.symbol = symbol.toLowerCase();
    this.onData = onData;
    this.onError = onError;
  }
  
  connect() {
    try {
      this.ws = new WebSocket(`${BINANCE_WS_BASE}/${this.symbol}@depth@100ms`);
      
      this.ws.onopen = () => {
        console.log(`WebSocket connected for ${this.symbol}`);
      };
      
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.onData(data);
        } catch (error) {
          console.error('Failed to parse WebSocket data:', error);
        }
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.onError(error);
      };
      
      this.ws.onclose = () => {
        console.log('WebSocket connection closed');
        // Auto-reconnect after 5 seconds
        setTimeout(() => this.connect(), 5000);
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.onError(error as Event);
    }
  }
  
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

/**
 * Get available trading symbols
 */
export async function getAvailableSymbols(): Promise<string[]> {
  try {
    const response = await binanceApi.get('/exchangeInfo');
    return response.data.symbols
      .filter((symbol: { status: string; symbol: string }) => symbol.status === 'TRADING' && symbol.symbol.endsWith('USDT'))
      .map((symbol: { symbol: string }) => symbol.symbol)
      .slice(0, 20); // Limit to top 20 for performance
  } catch (error) {
    console.error('Failed to fetch symbols:', error);
    // Return default symbols if API fails
    return ['BTCUSDT', 'ETHUSDT', 'ADAUSDT', 'SOLUSDT', 'DOTUSDT', 'LINKUSDT', 'MATICUSDT', 'AVAXUSDT'];
  }
} 