import env from './env';
const { JOBS_SCHEMA } = env;

const fail = async (client, { workerId, jobId, message }) => {
  await client.query(`SELECT * FROM "${JOBS_SCHEMA}".fail_job($1, $2, $3);`, [
    workerId,
    jobId,
    message
  ]);
};

const complete = async (client, { workerId, jobId }) => {
  await client.query(`SELECT * FROM "${JOBS_SCHEMA}".complete_job($1, $2);`, [
    workerId,
    jobId
  ]);
};

const get = async (client, { workerId, supportedTaskNames }) => {
  const {
    rows: [job]
  } = await client.query(
    `SELECT * FROM "${JOBS_SCHEMA}".get_job($1, $2::text[]);`,
    [workerId, supportedTaskNames]
  );
  return job;
};

export { fail, complete, get };
