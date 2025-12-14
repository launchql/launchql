export class PgpmError extends Error {
  code: string;
  context?: any;
  httpCode?: number;
  
  constructor(code: string, message: string, context?: any, httpCode?: number) {
    super(message);
    this.name = 'PgpmError';
    this.code = code;
    this.context = context;
    this.httpCode = httpCode;
  
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, PgpmError);
    }
  }
  
  toString() {
    return `[${this.code}] ${this.message}`;
  }
}
  