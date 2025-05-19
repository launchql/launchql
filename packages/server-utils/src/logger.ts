import chalk from 'chalk';

type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'success';

const levelColors: Record<LogLevel, chalk.Chalk> = {
  info: chalk.cyan,
  warn: chalk.yellow,
  error: chalk.red,
  debug: chalk.gray,
  success: chalk.green
};

const hasAnsi = (text: string): boolean => {
  return typeof text === 'string' && /\u001b\[\d+m/.test(text);
};

export class Logger {
  private scope: string;

  constructor(scope: string) {
    this.scope = scope;
  }

  private log(level: LogLevel, ...args: any[]) {
    const timestamp = chalk.dim(`[${new Date().toISOString()}]`);
    const tag = chalk.bold(`[${this.scope}]`);
    const color = levelColors[level];
    const prefix = color(`${level.toUpperCase()}:`);

    const formattedArgs = args.map(arg =>
      typeof arg === 'string' && !hasAnsi(arg) ? color(arg) : arg
    );

    const outputFn =
      level === 'error' ? console.error :
      level === 'warn'  ? console.warn  :
      level === 'debug' ? console.debug :
      console.log;

    outputFn(timestamp, tag, prefix, ...formattedArgs);
  }

  info(...args: any[]) {
    this.log('info', ...args);
  }

  warn(...args: any[]) {
    this.log('warn', ...args);
  }

  error(...args: any[]) {
    this.log('error', ...args);
  }

  debug(...args: any[]) {
    this.log('debug', ...args);
  }

  success(...args: any[]) {
    this.log('success', ...args);
  }
}

// factory
export const createLogger = (scope: string) => new Logger(scope);
