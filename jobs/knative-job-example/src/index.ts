import app from '@launchql/knative-job-fn';
import env from './env';

app.post('*', async (req: any, res: any, next: any) => {
  if (req.body.throw) {
    next(new Error('THROWN_ERROR'));
  } else {
    res.status(200).json({
      fn: 'example-fn',
      message: 'hi I did a lot of work',
      body: req.body
    });
  }
});

app.listen(env.PORT);
