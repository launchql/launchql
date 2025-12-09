import { createJobFunction } from '@launchql/knative-job-fn';
import env from './env';

const app = createJobFunction(async (payload: any) => {
  if (payload?.throw) throw new Error('THROWN_ERROR');
});

app.listen(env.PORT);
