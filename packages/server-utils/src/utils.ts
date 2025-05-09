import { Express, Request, Response, NextFunction } from 'express';

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

export const trustProxy = (app: Express, trustProxy?: boolean): void => {
  if (trustProxy) {
    app.set('trust proxy', (ip: string) => {
      return true;
    });
  }
};
