import express from 'express';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.set({
    'Content-Type': 'application/json',
    'X-Worker-Id': req.get('X-Worker-Id'),
    'X-Job-Id': req.get('X-Job-Id')
  });
  next();
});

export default {
  post: function () {
    return app.post.apply(app, arguments);
  },
  listen: (port, cb = () => {}) => {
    // NOTE Remember that Express middleware executes in order.
    // You should define error handlers last, after all other middleware.
    // Otherwise, your error handler won't get called
    // eslint-disable-next-line no-unused-vars
    app.use(async (error, req, res, next) => {
      res.set({
        'Content-Type': 'application/json',
        'X-Job-Error': true
      });
      return res.status(500).send({ error });
    });
    app.listen(port, cb);
  }
};
