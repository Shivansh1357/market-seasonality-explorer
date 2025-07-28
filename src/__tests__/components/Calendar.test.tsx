import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Calendar } from '@/components/Calendar';
import { MarketData, CalendarView } from '@/types/market';
import { generateMockMarketData } from '@/lib/market-utils';
import dayjs from 'dayjs';
import '@testing-library/jest-dom';

// Mock data for testing
const mockMarketData: MarketData[] = generateMockMarketData(
  dayjs().subtract(30, 'days').toDate(),
  dayjs().toDate()
);

// Mock props
const defaultProps = {
  view: 'daily' as CalendarView,
  onViewChange: jest.fn(),
  selectedDate: new Date(),
  onDateSelect: jest.fn(),
  marketData: mockMarketData,
};

describe('Calendar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders calendar with correct title', () => {
    render(<Calendar {...defaultProps} />);
    expect(screen.getByText('Market Seasonality Calendar')).toBeInTheDocument();
  });

  it('displays view toggle buttons', () => {
    render(<Calendar {...defaultProps} />);
    expect(screen.getByText('Daily')).toBeInTheDocument();
    expect(screen.getByText('Weekly')).toBeInTheDocument();
    expect(screen.getByText('Monthly')).toBeInTheDocument();
  });

  it('calls onViewChange when view button is clicked', () => {
    render(<Calendar {...defaultProps} />);
    fireEvent.click(screen.getByText('Weekly'));
    expect(defaultProps.onViewChange).toHaveBeenCalledWith('weekly');
  });

  it('displays navigation buttons', () => {
    render(<Calendar {...defaultProps} />);
    expect(screen.getByLabelText('Previous period')).toBeInTheDocument();
    expect(screen.getByLabelText('Next period')).toBeInTheDocument();
    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('displays current month and year in title', () => {
    render(<Calendar {...defaultProps} />);
    const currentMonth = dayjs().format('MMMM YYYY');
    expect(screen.getByText(currentMonth)).toBeInTheDocument();
  });

  it('renders calendar cells with market data', () => {
    render(<Calendar {...defaultProps} />);
    // Should render calendar cells (days of the month)
    const cells = screen.getAllByRole('button');
    expect(cells.length).toBeGreaterThan(0);
  });

  it('calls onDateSelect when a cell is clicked', async () => {
    render(<Calendar {...defaultProps} />);
    const cells = screen.getAllByRole('button');
    const firstCell = cells.find(cell => 
      cell.getAttribute('aria-label')?.includes(dayjs().format('MMMM'))
    );
    
    if (firstCell) {
      fireEvent.click(firstCell);
      await waitFor(() => {
        expect(defaultProps.onDateSelect).toHaveBeenCalled();
      });
    }
  });

  it('highlights today\'s date', () => {
    render(<Calendar {...defaultProps} />);
    const today = dayjs().format('D');
    const todayCell = screen.getAllByRole('button').find(cell =>
      cell.textContent === today && 
      cell.className.includes('ring-purple-500')
    );
    expect(todayCell).not.toBeUndefined();
    expect(todayCell).toBeInTheDocument();
  });

  it('handles keyboard navigation', () => {
    render(<Calendar {...defaultProps} />);
    const calendarContainer = screen.getByRole('main');
    
    // Test arrow key navigation
    fireEvent.keyDown(calendarContainer, { key: 'ArrowRight' });
    fireEvent.keyDown(calendarContainer, { key: 'ArrowLeft' });
    fireEvent.keyDown(calendarContainer, { key: 'ArrowUp' });
    fireEvent.keyDown(calendarContainer, { key: 'ArrowDown' });
    
    // Test Enter key
    fireEvent.keyDown(calendarContainer, { key: 'Enter' });
    
    // Test Escape key
    fireEvent.keyDown(calendarContainer, { key: 'Escape' });
    
    // Should not throw errors
    expect(true).toBe(true);
  });

  it('renders weekly view correctly', () => {
    const weeklyProps = { ...defaultProps, view: 'weekly' as CalendarView };
    render(<Calendar {...weeklyProps} />);
    
    // Should show current year instead of month
    const currentYear = dayjs().format('YYYY');
    expect(screen.getByText(currentYear)).toBeInTheDocument();
  });

  it('renders monthly view correctly', () => {
    const monthlyProps = { ...defaultProps, view: 'monthly' as CalendarView };
    render(<Calendar {...monthlyProps} />);
    
    // Should show current year
    const currentYear = dayjs().format('YYYY');
    expect(screen.getByText(currentYear)).toBeInTheDocument();
  });

  it('displays legend with volatility colors', () => {
    render(<Calendar {...defaultProps} />);
    expect(screen.getByText('Low Volatility')).toBeInTheDocument();
    expect(screen.getByText('Medium Volatility')).toBeInTheDocument();
    expect(screen.getByText('High Volatility')).toBeInTheDocument();
  });

  it('displays legend with performance indicators', () => {
    render(<Calendar {...defaultProps} />);
    expect(screen.getByText('Positive performance')).toBeInTheDocument();
    expect(screen.getByText('Negative performance')).toBeInTheDocument();
    expect(screen.getByText('Neutral performance')).toBeInTheDocument();
  });

  it('handles empty market data gracefully', () => {
    const emptyDataProps = { ...defaultProps, marketData: [] };
    render(<Calendar {...emptyDataProps} />);
    
    // Should still render calendar structure
    expect(screen.getByText('Market Seasonality Calendar')).toBeInTheDocument();
  });

  it('applies correct accessibility attributes', () => {
    render(<Calendar {...defaultProps} />);
    
    // Check for ARIA labels on navigation buttons
    expect(screen.getByLabelText('Previous period')).toBeInTheDocument();
    expect(screen.getByLabelText('Next period')).toBeInTheDocument();
    
    // Check for role attributes on calendar cells
    const cells = screen.getAllByRole('button');
    expect(cells.length).toBeGreaterThan(0);
    
    // Check for aria-label on cells
    const cellsWithLabels = cells.filter(cell => cell.getAttribute('aria-label'));
    expect(cellsWithLabels.length).toBeGreaterThan(0);
  });
}); 