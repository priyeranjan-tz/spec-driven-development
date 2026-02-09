import { DateFormatPipe } from './date-format.pipe';

describe('DateFormatPipe', () => {
  let pipe: DateFormatPipe;

  beforeEach(() => {
    pipe = new DateFormatPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should format date in long format', () => {
    const result = pipe.transform('2026-02-06T10:30:00Z', 'long');
    expect(result).toContain('Feb');
    expect(result).toContain('6');
    expect(result).toContain('2026');
  });

  it('should format date in short format', () => {
    const result = pipe.transform('2026-02-06T10:30:00Z', 'short');
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  it('should format date only', () => {
    const result = pipe.transform('2026-02-06T10:30:00Z', 'date');
    expect(result).toContain('Feb');
    expect(result).toContain('6');
    expect(result).toContain('2026');
    expect(result).not.toContain(':');
  });

  it('should format time only', () => {
    const result = pipe.transform('2026-02-06T10:30:00Z', 'time');
    expect(result).toMatch(/\d{1,2}:\d{2}\s*(AM|PM)/);
  });

  it('should handle null', () => {
    expect(pipe.transform(null)).toBe('—');
  });

  it('should handle undefined', () => {
    expect(pipe.transform(undefined)).toBe('—');
  });

  it('should handle invalid date string', () => {
    expect(pipe.transform('invalid-date')).toBe('—');
  });

  it('should handle empty string', () => {
    expect(pipe.transform('')).toBe('—');
  });
});
