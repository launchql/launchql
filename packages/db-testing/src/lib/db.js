import { promisify } from 'util'
import { exec } from 'child_process'

const asyncExec = promisify(exec)

export async function dropdb({
  database,
  host,
  password,
  port,
  user
}) {
  return await asyncExec(
    `dropdb -U ${user} -h ${host} -p ${port} ${database}`,
    {
      env: {
        PGPASSWORD: password
      }
    }
  )
}

export async function createdb({
  database,
  host,
  password,
  port,
  user
}) {
  return await asyncExec(
    `createdb -U ${user} -h ${host} -p ${port} ${database}`,
    {
      env: {
        PGPASSWORD: password
      }
    }
  )
}

export async function templatedb({
  database,
  host,
  password,
  port,
  template,
  user
}) {
  return await asyncExec(
    `createdb -U ${user} -h ${host} -p ${port} -e ${database} -T ${template}`,
    {
      env: {
        PGPASSWORD: password
      }
    }
  )
}

export async function installExt({
  database,
  host,
  password,
  port,
  template,
  user
}, extensions) {
  if (typeof extensions === 'string') {
    extensions = extensions.split(',');
  }
  for (let i=0; i<extensions.length; i++) {
    const extension = extensions[i];
    await asyncExec(
      `psql --dbname "${database}" -c 'CREATE EXTENSION IF NOT EXISTS "${extension}" CASCADE;'`,
      {
        env: {
          PGPASSWORD: password,
          PGUSER: user,
          PGHOST: host,
          PGPORT: port,
          PATH: process.env.PATH
        }
      }
    );
  }

}

export const connectionString = ({
  database,
  host,
  password,
  port,
  user
}) => {
  return `postgres://${user}:${password}@${host}:${port}/${database}`
}
