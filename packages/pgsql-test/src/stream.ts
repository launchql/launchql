import { spawn } from 'child_process';
import { getSpawnEnvWithPg,PgConfig } from 'pg-env';
import { Readable } from 'stream';

function setArgs(config: PgConfig): string[] {
  const args = [
    '-U', config.user,
    '-h', config.host,
    '-d', config.database
  ];
  if (config.port) {
    args.push('-p', String(config.port));
  }
  return args;
}

// Converts a string to a readable stream (replaces streamify-string)
function stringToStream(text: string): Readable {
  const stream = new Readable({
    read() {
      this.push(text);
      this.push(null);
    }
  });
  return stream;
}

export async function streamSql(config: PgConfig, sql: string): Promise<void> {
  const args = setArgs(config);

  return new Promise<void>((resolve, reject) => {
    const sqlStream = stringToStream(sql);

    const proc = spawn('psql', args, {
      env: getSpawnEnvWithPg(config)
    });

    sqlStream.pipe(proc.stdin);

    proc.on('close', (code) => {
      resolve();
    });

    proc.on('error', (error) => {
      reject(error);
    });

    proc.stderr.on('data', (data: Buffer) => {
      reject(new Error(data.toString()));
    });
  });
}
