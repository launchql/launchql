import path from 'path';
import mkdirp from 'mkdirp';
import rimraf from 'rimraf';
import { sync as glob } from 'glob';
import { init } from '@launchql/db-utils';
import Case from 'case';

/*

preparePackage

simply creates a sqitch package if it doesn't exist...
otherwise deletes the deploy,revert,verify for new files to come...

*/
export const preparePackage = async ({ author, outdir, name, extensions }) => {
  const curDir = process.cwd();
  const sqitchDir = path.resolve(outdir + '/' + name);
  mkdirp.sync(sqitchDir);
  process.chdir(sqitchDir);

  // find if file exists....
  const plan = glob(path.join(sqitchDir, 'sqitch.plan'));
  if (!plan.length) {
    await init({
      name,
      description: name,
      author,
      extensions
    });
  } else {
    // until we fix the migrations and/or redeploy our app
    rimraf.sync(path.resolve(sqitchDir + '/deploy'));
    rimraf.sync(path.resolve(sqitchDir + '/revert'));
    rimraf.sync(path.resolve(sqitchDir + '/verify'));
  }
  process.chdir(curDir);
};

export const makeReplacer = ({ schemas, name }) => {
  const replacements = ['launchql-extension-name', name];
  const schemaReplacers = schemas.rows.map((schema) => {
    return [schema.schema_name, Case.snake(name + '_' + schema.name)];
  });

  const replace = [...schemaReplacers, replacements].map(([f, r]) => {
    return [new RegExp(f, 'g'), r];
  });

  const replacer = (str, n = 0) => {
    if (!str) return '';
    if (replace[n] && replace[n].length == 2) {
      return replacer(str.replace(replace[n][0], replace[n][1]), n + 1);
    }
    return str;
  };

  return { replacer, replace };
};
