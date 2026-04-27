import chalk from 'chalk';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const COLORS: Record<LogLevel, ((str: string) => string) | null> = {
  debug: chalk?.gray ?? null,
  info: chalk?.blue ?? null,
  warn: chalk?.yellow ?? null,
  error: chalk?.red ?? null,
};

export class Logger {
  private level: LogLevel;

  constructor(level: LogLevel = 'info') {
    this.level = level;
  }

  shouldLog(logLevel: LogLevel): boolean {
    return LOG_LEVELS[logLevel] >= LOG_LEVELS[this.level];
  }

  format(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    const levelStr = `[${timestamp}] [${level.toUpperCase()}]`;
    const colorFn = COLORS[level];
    return colorFn ? `${colorFn(levelStr)} ${message}` : `${levelStr} ${message}`;
  }

  debug(message: string): void {
    if (this.shouldLog('debug')) {
      console.log(this.format('debug', message));
    }
  }

  info(message: string): void {
    if (this.shouldLog('info')) {
      console.log(this.format('info', message));
    }
  }

  warn(message: string): void {
    if (this.shouldLog('warn')) {
      console.warn(this.format('warn', message));
    }
  }

  error(message: string): void {
    if (this.shouldLog('error')) {
      console.error(this.format('error', message));
    }
  }
}

export const logger = new Logger('info');