import walkup from 'node-walkup';
import { join } from 'path';
import { readFileSync, readdirSync, writeFileSync } from 'fs';
const CONFIG_JSON = 'config.json';

// export const lqlPath = (cwd = process.cwd()) => {
//   let obj;
//   return new Promise((resolve, reject) => {
//     // if (process.env.LAUNCHQL_PATH) {
//     //   return resolve(process.env.LAUNCHQL_PATH);
//     // }
//     if (obj) {
//       return resolve(obj);
//     }
//     walkup(
//       '.lqlrc',
//       {
//         cwd
//       },
//       (err, matches) => {
//         if (err) {
//           return reject(err);
//         }
//         if (!matches || !matches.length) {
//           console.error('Not inside of a LaunchQL project');
//         }
//         obj = join(matches[0].dir, matches[0].files[0]);
//         resolve(obj);
//       }
//     );
//   });
// };

export const getLqlDir = (cwd = process.cwd()) => {
  let obj;
  return new Promise((resolve, reject) => {
    if (obj) {
      return resolve(obj);
    }
    walkup(
      '.lql',
      {
        cwd
      },
      (err, matches) => {
        if (err) {
          return reject(err);
        }
        if (!matches || !matches.length) {
          console.error('cannot find a .lql directory anywhere');
        }
        obj = join(matches[0].dir, matches[0].files[0]);
        resolve(obj);
      }
    );
  });
};

// lqlEnv is for local environments, db info, etc

// export const lqlEnv = async (cwd = process.cwd()) => {
//   let env;
//   const path = await lqlPath(cwd);
//   return new Promise((resolve, reject) => {
//     if (env) {
//       return resolve(env);
//     }
//     env = {};
//     readFileSync(path)
//       .toString()
//       .split('\n')
//       .map((e) => e.trim())
//       .forEach((vari) => {
//         const line = vari.trim();
//         if (!line || !line.length || /^#/.test(line)) return;
//         vari.replace(/(\w+)=(.+)/g, function ($0, $1, $2) {
//           env[$1] = $2;
//         });
//         return vari;
//       });

//     resolve(env);
//   });
// };

// export const lqlContext = async (cwd = process.cwd()) => {
//   const env = await lqlEnv(cwd);
//   const config = await getConfig(cwd);
//   return {
//     env,
//     config
//   };
// };

export const setCurrentContext = async (name, cwd = process.cwd()) => {
  const config = await getConfig(cwd);
  config.currentContext = name;
  await setConfig(config, cwd);
};

export const setConfig = async (config, cwd = process.cwd()) => {
  const dir = await getLqlDir(cwd);
  writeFileSync(join(dir, CONFIG_JSON), JSON.stringify(config, null, 2));
};

export const getCurrentContext = async (cwd = process.cwd()) => {
  const config = await getConfig(cwd);

  if (!config) {
    console.warn('no config found!');
    return {};
  }

  const current = config.currentContext;
  const context = config.contexts.find((context) => context.name == current);
  if (!context) {
    console.warn('no context found!');
    return {};
  }
  context.user = config.users.find((el) => el.name == context.user);
  context.server = config.servers.find((el) => el.name == context.server);
  return context;
};

// lqlPath is for local environments, db info, etc
// getConfig
export const getConfig = async (cwd = process.cwd()) => {
  // use metaphors from KUBECONFIG
  // for now we just get the directory recursively...
  // KUBECONFIG => LQLCONFIG

  const dir = await getLqlDir(cwd);
  const ls = readdirSync(dir);

  let config = {};
  if (ls.includes(CONFIG_JSON)) {
    config = JSON.parse(readFileSync(join(dir, CONFIG_JSON)).toString());
  } else {
    console.warn('missing lql config!');
    return {};
  }

  return config;
};
