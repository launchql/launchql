import app from '@launchql/openfaas-job-fn';
import env from './env';

app.post('*', async (req, res, next) => {
  console.log('inside example fn');
  console.log(req.body);
  if (req.body.throw1) {
    next(new Error('THROWN_ERROR'));
  } else if (req.body.throw2) {
    throw new Error('THROWN_ERROR');
  } else if (req.body.throw3) {
    res.set({
      'Content-Type': 'application/json',
      'X-Job-Error': true
    });
    return res.status(500).send({ error: 'here my error from fn' });
  } else {
    res.status(200).send({
      fn: 'example-fn',
      message: 'hi I did a lot of work',
      body: req.body
    });
  }
});

app.listen(env.PORT);
