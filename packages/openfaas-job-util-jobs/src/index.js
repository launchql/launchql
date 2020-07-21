import express from 'express';
import bodyParser from 'body-parser';
import env from './env';

// const getDbString = () =>
//   `postgres://${env.PGUSER}:${env.PGPASSWORD}@${env.PGHOST}:${env.PGPORT}/${env.PGDATABASE}`;

const app = express();
app.use(bodyParser.json());
// app.use((req, res, next) => {
//   res.set({
//     'Content-Type': 'application/json',
//     'X-Worker-Id': req.get('X-Worker-Id'),
//     'X-Job-Id': req.get('X-Job-Id')
//   });
//   next();
// });
app.use((error, req, res, next) => {
  res.status(500).send({ error });
});

app.post('complete', (req, res) => {
  console.log('complete');
  console.log({
    'X-Error-Url': req.get('X-Error-Url'),
    'X-Callback-Url': req.get('X-Callback-Url'),
    'X-Worker-Id': req.get('X-Worker-Id'),
    'X-Job-Id': req.get('X-Job-Id')
  });
  res.status(200).send({ complete: true });
});

app.post('error', (req, res) => {
  console.log('error');
  console.log({
    'X-Error-Url': req.get('X-Error-Url'),
    'X-Callback-Url': req.get('X-Callback-Url'),
    'X-Worker-Id': req.get('X-Worker-Id'),
    'X-Job-Id': req.get('X-Job-Id')
  });
  res.status(200).send({ complete: true });
});

app.listen(env.PORT);
