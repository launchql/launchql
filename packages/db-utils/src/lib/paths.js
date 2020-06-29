var walkup = require('node-walkup');

export const sqitchPath = (cwd = process.cwd()) => {
  let obj;

  return new Promise((resolve, reject) => {
    if (process.env.SQITCH_PATH) {
      return resolve(process.env.SQITCH_PATH);
    }
    if (obj) {
      return resolve(obj);
    }
    walkup(
      'sqitch.conf',
      {
        cwd: process.cwd()
      },
      (err, matches) => {
        if (err) {
          return reject(err);
        }
        if (!matches || !matches.length) {
          console.error('Not inside of a Sqitch project');
          process.exit(1);
        }
        obj = matches[0].dir;
        resolve(matches[0].dir);
      }
    );
  });
};

export const skitchPath = (cwd = process.cwd()) => {
  let obj;

  return new Promise((resolve, reject) => {
    if (process.env.SKITCH_PATH) {
      return resolve(process.env.SKITCH_PATH);
    }
    if (obj) {
      return resolve(obj);
    }
    walkup(
      'skitch.json',
      {
        cwd: process.cwd()
      },
      (err, matches) => {
        if (err) {
          return reject(err);
        }
        if (!matches || !matches.length) {
          console.error('Not inside of a skitch project');
          process.exit(1);
        }
        obj = matches[0].dir;
        resolve(matches[0].dir);
      }
    );
  });
};
