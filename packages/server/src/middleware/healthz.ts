import { Express, Request, Response } from 'express';

export const healthz = (app: Express): void => {
  app.get('/healthz', (req: Request, res: Response) => {
    // could be checking db, etc..
    res.send('ok');
  });
};