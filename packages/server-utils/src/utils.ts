import { Express, NextFunction,Request, Response } from 'express';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Whether a string is a canonical (8-4-4-4-12) UUID. */
export const isUuid = (value: string): boolean => UUID_RE.test(value);

export const healthz = (app: Express): void => {
  app.get('/healthz', (req: Request, res: Response) => {
    // could be checking db, etc..
    res.send('ok');
  });
};

export const poweredBy = (name: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    res.set({
      'X-Powered-By': name,
    });
    return next();
  };
};

