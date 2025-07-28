# 🚀 Market Seasonality Explorer

An advanced React application for visualizing historical volatility, liquidity, and performance data across different time periods for financial instruments with real-time Binance API integration.

## ✨ Features

### 🎯 Core Functionality
- **Interactive Calendar Component** with daily, weekly, and monthly views
- **Real-time Binance API Integration** for live cryptocurrency market data
- **Advanced Data Visualization** with volatility heatmaps, liquidity indicators, and performance metrics
- **Multi-timeframe Support** with seamless transitions between time periods
- **Responsive Design** optimized for all device sizes
- **Dark/Light Theme System** with colorblind-friendly and high-contrast options

### 📊 Advanced Analytics
- **Seasonal Pattern Detection** - Automatically identifies recurring market patterns
- **Anomaly Detection** - Highlights unusual market events and volume spikes
- **Risk Assessment** - Comprehensive risk scoring and volatility analysis
- **Technical Indicators** - RSI, Moving Averages, and custom metrics
- **Performance Benchmarking** - Compare against historical data and trends

### 🎨 User Experience
- **Smooth Animations** and micro-interactions for enhanced UX
- **Keyboard Navigation** with full accessibility support
- **Touch-friendly Interface** optimized for mobile devices
- **Advanced Filtering** by instrument, metric type, and time period
- **Zoom Controls** for detailed analysis at different scales

### 📈 Data Export & Analysis
- **Enhanced CSV Export** with additional calculated metrics and trading signals
- **Comprehensive Analysis Reports** with statistical summaries and recommendations
- **JSON Data Export** with metadata and structured analytics
- **PNG Export Instructions** for visual documentation
- **Real-time Data Caching** with intelligent fallback to mock data

### 🔧 Technical Excellence
- **TypeScript** for type safety and better developer experience
- **Next.js 15** with App Router for optimal performance
- **TanStack React Query** for sophisticated data fetching and caching
- **ShadCN UI Components** built on Radix UI primitives
- **Comprehensive Unit Tests** with Vitest and Testing Library
- **Error Boundaries** and graceful error handling

## 🛠️ Tech Stack

### Frontend Framework
- **Next.js 15** - React framework with App Router
- **React 19** - UI library with latest features
- **TypeScript** - Type-safe JavaScript

### Styling & UI
- **Tailwind CSS** - Utility-first CSS framework
- **ShadCN UI** - High-quality component library
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icon library

### Data Management
- **TanStack React Query** - Server state management
- **Zustand** - Client state management
- **Axios** - HTTP client for API requests
- **Day.js** - Date manipulation library

### Charts & Visualization
- **Chart.js** - Flexible charting library
- **React-Chartjs-2** - React wrapper for Chart.js

### Real-time Data
- **Binance API** - Cryptocurrency market data
- **WebSocket** - Real-time order book updates
- **Custom Hooks** - Reusable data fetching logic

### Development & Testing
- **Vitest** - Fast unit test framework
- **Testing Library** - Testing utilities
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/market-seasonality-explorer.git
   cd market-seasonality-explorer
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Start the development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm test` - Run unit tests
- `pnpm test:ui` - Run tests with UI
- `pnpm test:coverage` - Run tests with coverage

## 📱 Usage Guide

### Navigation
- **Arrow Buttons**: Navigate between months/years
- **Today Button**: Return to current date
- **View Toggle**: Switch between Daily, Weekly, Monthly views
- **Cell Click**: Open detailed analysis panel

### Keyboard Shortcuts
- **Arrow Keys**: Navigate calendar dates
- **Enter**: Select focused date
- **Escape**: Clear focus and close panels
- **Tab**: Navigate through interactive elements

### Data Sources
- **Real Data Mode**: Live Binance cryptocurrency data
- **Mock Data Mode**: Generated realistic market data for demonstration
- **Automatic Fallback**: Seamlessly switches to mock data if API is unavailable

### Filtering & Analysis
- **Instrument Selection**: Choose from 20+ cryptocurrency pairs
- **Metric Types**: Volatility, Volume, Liquidity, Performance, Combined
- **Time Periods**: 1M, 3M, 6M, 1Y, 2Y, All Time
- **Zoom Controls**: Quick view transitions with smooth animations

### Export Options
- **Enhanced CSV**: Detailed data with calculated metrics and trading signals
- **Analysis Report**: Comprehensive statistical analysis with recommendations
- **JSON Export**: Structured data with metadata for further analysis
- **Visual Export**: Instructions for screenshot and print options

## 🎨 Theme System

### Available Themes
- **Light Mode**: Clean, professional appearance
- **Dark Mode**: Easy on the eyes for extended use
- **System**: Automatically follows OS preference

### Color Schemes
- **Default**: Standard color palette
- **Colorblind Friendly**: Optimized for color vision accessibility
- **High Contrast**: Enhanced visibility for users with visual impairments

## 🔌 API Integration

### Binance API Features
- **Historical Klines**: OHLCV data for technical analysis
- **24hr Ticker Statistics**: Volume and price change metrics
- **Order Book Data**: Real-time liquidity and spread information
- **Symbol Information**: Available trading pairs and market status
- **WebSocket Streams**: Live order book updates

### Data Processing
- **Volatility Calculation**: Statistical analysis of price movements
- **Liquidity Metrics**: Order book depth and spread analysis
- **Performance Indicators**: Price change and momentum calculations
- **Risk Assessment**: Comprehensive scoring based on multiple factors

## 🧪 Testing

### Test Coverage
- **Component Tests**: UI component behavior and rendering
- **Utility Tests**: Data processing and calculation functions
- **Integration Tests**: API integration and data flow
- **Accessibility Tests**: Keyboard navigation and screen reader support

### Running Tests
```bash
# Run all tests
pnpm test

# Run tests with UI
pnpm test:ui

# Run tests with coverage
pnpm test:coverage

# Run specific test file
pnpm test Calendar.test.tsx
```

## 📊 Data Structure

### MarketData Interface
```typescript
interface MarketData {
  date: string;              // ISO date string
  volatilityLevel: 'low' | 'medium' | 'high';
  volume: number;            // Trading volume
  performance: 'positive' | 'negative' | 'neutral';
  priceChange: number;       // Percentage change
  liquidity: number;         // 0-100 scale
}
```

### Aggregated Data
- **Weekly Summaries**: Consolidated metrics for week-over-week analysis
- **Monthly Summaries**: Long-term trend identification
- **Statistical Measures**: Averages, totals, and distribution analysis

## 🔧 Configuration

### Environment Variables
```env
# API Configuration (optional - uses public endpoints)
NEXT_PUBLIC_BINANCE_API_URL=https://api.binance.com/api/v3
NEXT_PUBLIC_BINANCE_WS_URL=wss://stream.binance.com:9443/ws

# Feature Flags
NEXT_PUBLIC_ENABLE_REAL_TIME=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

### Customization
- **Theme Colors**: Modify CSS variables in `globals.css`
- **Default Settings**: Update constants in component files
- **API Endpoints**: Configure in `lib/binance.ts`
- **Chart Options**: Customize in `components/MarketDetailsPanel.tsx`

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to main branch

### Other Platforms
- **Netlify**: Build command: `pnpm build`, Publish directory: `out`
- **AWS Amplify**: Use the provided build settings
- **Docker**: Dockerfile included for containerized deployment

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Commit with conventional commits: `git commit -m 'feat: add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Code Standards
- **TypeScript**: Strict type checking enabled
- **ESLint**: Enforced code quality rules
- **Prettier**: Consistent code formatting
- **Testing**: Minimum 80% test coverage required

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


---

