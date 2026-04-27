import { describe, it, expect } from 'vitest';
import { Logger } from '../../src/utils/logger.js';

describe('Logger', () => {
  it('logs info messages with timestamp', () => {
    const logger = new Logger('info');
    const message = logger.format('INFO', 'Test message');
    expect(message).toContain('[INFO]');
    expect(message).toContain('Test message');
  });

  it('does not log debug when level is info', () => {
    const logger = new Logger('info');
    expect(logger.shouldLog('debug')).toBe(false);
    expect(logger.shouldLog('info')).toBe(true);
  });

  it('logs all levels when level is debug', () => {
    const logger = new Logger('debug');
    expect(logger.shouldLog('debug')).toBe(true);
    expect(logger.shouldLog('info')).toBe(true);
    expect(logger.shouldLog('error')).toBe(true);
  });
});