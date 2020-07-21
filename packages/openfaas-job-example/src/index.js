import app from '@launchql/openfaas-job-fn';
import env from './env';

app.post('*', async (req, res) => {
  res.status(200).send({
    fn: 'example-fn',
    message: 'hi I did a lot of work',
    body: req.body
  });
});

app.listen(env.PORT);
