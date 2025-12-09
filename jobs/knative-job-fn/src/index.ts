import express from 'express';
import bodyParser from 'body-parser';

const app: any = express();
app.use(bodyParser.json());
app.use((req: any, res: any, next: any) => {
  res.set({
    'Content-Type': 'application/json',
    'X-Worker-Id': req.get('X-Worker-Id'),
    'X-Database-Id': req.get('X-Database-Id'),
    'X-Job-Id': req.get('X-Job-Id')
  });
  next();
});

export default {
  post: function (...args: any[]) {
    return app.post.apply(app, args as any);
  },
  listen: (port: any, cb: () => void = () => {}) => {
    // NOTE Remember that Express middleware executes in order.
    // You should define error handlers last, after all other middleware.
    // Otherwise, your error handler won't get called
    // eslint-disable-next-line no-unused-vars
    app.use(async (error: any, req: any, res: any, next: any) => {
      res.set({
        'Content-Type': 'application/json',
        'X-Job-Error': true
      });
      res.status(200).json({ message: error.message });
    });
    app.listen(port, cb);
  }
};
