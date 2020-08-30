import walkup from 'node-walkup';
import { join } from 'path';
import { readFileSync } from 'fs';
export const lqlPath = (cwd = process.cwd()) => {
  let obj;
  return new Promise((resolve, reject) => {
    // if (process.env.LAUNCHQL_PATH) {
    //   return resolve(process.env.LAUNCHQL_PATH);
    // }
    if (obj) {
      return resolve(obj);
    }
    walkup(
      '.lqlrc',
      {
        cwd
      },
      (err, matches) => {
        if (err) {
          return reject(err);
        }
        if (!matches || !matches.length) {
          console.error('Not inside of a LaunchQL project');
        }
        obj = join(matches[0].dir, matches[0].files[0]);
        resolve(obj);
      }
    );
  });
};

export const lqlEnv = async (cwd = process.cwd()) => {
  let env;
  const path = await lqlPath(cwd);
  return new Promise((resolve, reject) => {
    if (env) {
      return resolve(env);
    }
    env = {};
    readFileSync(path)
      .toString()
      .split('\n')
      .map((e) => e.trim())
      .forEach((vari) => {
        vari.replace(/(\w+)=(.+)/g, function ($0, $1, $2) {
          env[$1] = $2;
        });
        return vari;
      });

    resolve(env);
  });
};
