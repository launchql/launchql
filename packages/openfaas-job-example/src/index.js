import app from '@launchql/openfaas-job-fn';
import env from './env';

app.post('*', async (req, res) => {
  res.status(200).send({ hello: 'openfaas' });
});

app.listen(env.PORT);
