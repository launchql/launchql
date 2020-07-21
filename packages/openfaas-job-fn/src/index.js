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
// eslint-disable-next-line no-unused-vars
app.use((error, _req, res, _next) => {
  res.status(500).send({ error });
});

export default app;
