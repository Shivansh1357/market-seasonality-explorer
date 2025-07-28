import { 
  fetchOrderBook, 
  fetchKlines, 
  fetch24hrTicker, 
  getAvailableSymbols,
  fetchMarketData,
  calculateVolatility,
  calculateLiquidityMetrics 
} from './binance';

/**
 * Test script to verify Binance API integration
 */
export async function testBinanceIntegration() {
  console.log('🚀 Testing Binance API Integration...\n');

  try {
    // Test 1: Fetch available symbols
    console.log('📊 Test 1: Fetching available symbols...');
    const symbols = await getAvailableSymbols();
    console.log(`✅ Found ${symbols.length} symbols:`, symbols.slice(0, 5));
    console.log('');

    // Test 2: Fetch orderbook for BTCUSDT
    console.log('📈 Test 2: Fetching orderbook for BTCUSDT...');
    const orderbook = await fetchOrderBook('BTCUSDT', 10);
    console.log('✅ Orderbook fetched successfully');
    console.log('Top 3 bids:', orderbook.bids.slice(0, 3));
    console.log('Top 3 asks:', orderbook.asks.slice(0, 3));
    console.log('');

    // Test 3: Calculate liquidity metrics
    console.log('💧 Test 3: Calculating liquidity metrics...');
    const liquidityMetrics = calculateLiquidityMetrics(orderbook);
    console.log('✅ Liquidity metrics calculated');
    console.log('Spread:', liquidityMetrics.spread.toFixed(2));
    console.log('Spread %:', liquidityMetrics.spreadPercent.toFixed(4) + '%');
    console.log('Liquidity Score:', liquidityMetrics.liquidity.toFixed(1));
    console.log('');

    // Test 4: Fetch 24hr ticker
    console.log('🎯 Test 4: Fetching 24hr ticker...');
    const ticker = await fetch24hrTicker('BTCUSDT');
    console.log('✅ 24hr ticker fetched successfully');
    console.log('Price:', ticker.lastPrice);
    console.log('24h Change:', ticker.priceChangePercent + '%');
    console.log('24h Volume:', ticker.volume);
    console.log('');

    // Test 5: Fetch historical klines
    console.log('📊 Test 5: Fetching historical klines...');
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const klines = await fetchKlines('BTCUSDT', '1d', 30, startDate.getTime(), endDate.getTime());
    console.log(`✅ Fetched ${klines.length} daily klines`);
    console.log('Latest kline:', {
      date: new Date(klines[klines.length - 1].openTime).toISOString().split('T')[0],
      open: klines[klines.length - 1].open,
      close: klines[klines.length - 1].close,
      volume: klines[klines.length - 1].volume
    });
    console.log('');

    // Test 6: Calculate volatility
    console.log('📈 Test 6: Calculating volatility...');
    const prices = klines.map(k => parseFloat(k.close));
    const volatility = calculateVolatility(prices);
    console.log('✅ Volatility calculated');
    console.log('Annualized Volatility:', (volatility * 100).toFixed(2) + '%');
    console.log('');

    // Test 7: Fetch comprehensive market data
    console.log('🎯 Test 7: Fetching comprehensive market data...');
    const marketData = await fetchMarketData('BTCUSDT', startDate, endDate);
    console.log(`✅ Generated ${marketData.length} market data points`);
    console.log('Sample data point:', {
      date: marketData[marketData.length - 1].date,
      volatilityLevel: marketData[marketData.length - 1].volatilityLevel,
      volume: marketData[marketData.length - 1].volume,
      performance: marketData[marketData.length - 1].performance,
      priceChange: marketData[marketData.length - 1].priceChange + '%',
      liquidity: marketData[marketData.length - 1].liquidity + '%'
    });
    console.log('');

    console.log('🎉 All tests passed! Binance API integration is working correctly.');
    return {
      success: true,
      data: {
        symbolsCount: symbols.length,
        orderbookSpread: liquidityMetrics.spreadPercent,
        currentPrice: ticker.lastPrice,
        priceChange24h: ticker.priceChangePercent,
        klinesCount: klines.length,
        volatility: volatility * 100,
        marketDataCount: marketData.length
      }
    };

  } catch (error) {
    console.error('❌ Test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Test multiple symbols to ensure robustness
 */
export async function testMultipleSymbols() {
  console.log('🔄 Testing multiple symbols...\n');
  
  const testSymbols = ['BTCUSDT', 'ETHUSDT', 'ADAUSDT'];
  const results = [];

  for (const symbol of testSymbols) {
    try {
      console.log(`Testing ${symbol}...`);
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
      
      const marketData = await fetchMarketData(symbol, startDate, endDate);
      console.log(`✅ ${symbol}: ${marketData.length} data points`);
      
      results.push({
        symbol,
        success: true,
        dataPoints: marketData.length,
        latestPrice: marketData[marketData.length - 1]?.priceChange || 0
      });
    } catch (error) {
      console.log(`❌ ${symbol}: Failed`);
      results.push({
        symbol,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  console.log('\n📊 Multi-symbol test results:');
  results.forEach(result => {
    if (result.success) {
      console.log(`✅ ${result.symbol}: ${result.dataPoints} points`);
    } else {
      console.log(`❌ ${result.symbol}: ${result.error}`);
    }
  });

  return results;
}

// Export for manual testing
if (typeof window === 'undefined') {
  // Node.js environment - can run tests directly
  console.log('Running Binance API tests...');
  testBinanceIntegration().then(result => {
    console.log('\nTest Result:', result);
  });
} 