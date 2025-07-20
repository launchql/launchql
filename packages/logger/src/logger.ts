import chalk from 'chalk';

export type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'success';

const levelPriority: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  success: 2,
  warn: 3,
  error: 4
};

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

// Parse LOG_LEVEL from environment
let globalLogLevel: LogLevel =
  (process.env.LOG_LEVEL?.toLowerCase() as LogLevel) ?? 'info';

// Update log level at runtime
export const setLogLevel = (level: LogLevel) => {
  if (levelPriority[level] !== undefined) {
    globalLogLevel = level;
  }
};

// Scope filtering
interface ScopeFilter {
  include: Set<string>;
  exclude: Set<string>;
}

const parseScopeFilter = (env: string | undefined): ScopeFilter => {
  const include = new Set<string>();
  const exclude = new Set<string>();

  (env ?? '').split(',').map(s => s.trim()).forEach(scope => {
    if (!scope) return;
    if (scope === '*') {
      include.add('*');
    } else if (scope.startsWith('^')) {
      exclude.add(scope.slice(1));
    } else {
      include.add(scope);
    }
  });

  return { include, exclude };
};

let { include: allowedScopes, exclude: blockedScopes } = parseScopeFilter(process.env.LOG_SCOPE);

// Update scopes at runtime
export const setLogScopes = (scopes: string[]) => {
  const parsed = parseScopeFilter(scopes.join(','));
  allowedScopes = parsed.include;
  blockedScopes = parsed.exclude;
};

// Logger class
export class Logger {
  private scope: string;

  constructor(scope: string) {
    this.scope = scope;
  }

  private log(level: LogLevel, ...args: any[]) {
    // Respect log level
    if (levelPriority[level] < levelPriority[globalLogLevel]) return;

    // Scope filtering
    if (blockedScopes.has(this.scope)) return;
    if (
      allowedScopes.size > 0 &&
      !allowedScopes.has('*') &&
      !allowedScopes.has(this.scope)
    ) {
      return;
    }

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

// Factory function
export const createLogger = (scope: string) => new Logger(scope);
