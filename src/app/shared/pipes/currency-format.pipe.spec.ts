import { CurrencyFormatPipe } from './currency-format.pipe';

describe('CurrencyFormatPipe', () => {
  let pipe: CurrencyFormatPipe;

  beforeEach(() => {
    pipe = new CurrencyFormatPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should convert cents to dollars with cents', () => {
    expect(pipe.transform(1050)).toBe('$10.50');
    expect(pipe.transform(100)).toBe('$1.00');
    expect(pipe.transform(0)).toBe('$0.00');
  });

  it('should handle negative amounts', () => {
    expect(pipe.transform(-1050)).toBe('-$10.50');
    expect(pipe.transform(-100)).toBe('-$1.00');
  });

  it('should handle large amounts', () => {
    expect(pipe.transform(100000050)).toBe('$1,000,000.50');
  });

  it('should format without cents when showCents is false', () => {
    expect(pipe.transform(1050, false)).toBe('$11');
    expect(pipe.transform(12345, false)).toBe('$123');
  });

  it('should handle null and undefined', () => {
    expect(pipe.transform(null)).toBe('$0.00');
    expect(pipe.transform(undefined)).toBe('$0.00');
  });

  it('should handle zero', () => {
    expect(pipe.transform(0)).toBe('$0.00');
  });

  it('should round correctly for display without cents', () => {
    expect(pipe.transform(1550, false)).toBe('$16');
    expect(pipe.transform(1450, false)).toBe('$15');
  });
});
