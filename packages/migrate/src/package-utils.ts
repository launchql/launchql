import path from 'path';
import mkdirp from 'mkdirp';
import rimraf from 'rimraf';
import { sync as glob } from 'glob';
// import { init } from '@launchql/db-utils';
import Case from 'case';

interface PreparePackageOptions {
  author: string;
  outdir: string;
  name: string;
  extensions: string[];
}

interface Schema {
  name: string;
  schema_name: string;
}

interface MakeReplacerOptions {
  schemas: Schema[];
  name: string;
}

interface ReplacerResult {
  replacer: (str: string, n?: number) => string;
  replace: [RegExp, string][];
}

/**
 * Creates a Sqitch package directory or resets the deploy/revert/verify directories if it exists.
 */
export const preparePackage = async ({
  author,
  outdir,
  name,
  extensions
}: PreparePackageOptions): Promise<void> => {
  const curDir = process.cwd();
  const sqitchDir = path.resolve(path.join(outdir, name));
  mkdirp.sync(sqitchDir);
  process.chdir(sqitchDir);

  const plan = glob(path.join(sqitchDir, 'sqitch.plan'));
  if (!plan.length) {
    console.log('this is where init would have gone...');
    // await init({
    //   name,
    //   description: name,
    //   author,
    //   extensions
    // });
  } else {
    rimraf.sync(path.resolve(sqitchDir, 'deploy'));
    rimraf.sync(path.resolve(sqitchDir, 'revert'));
    rimraf.sync(path.resolve(sqitchDir, 'verify'));
  }

  process.chdir(curDir);
};

/**
 * Generates a function for replacing schema names and extension names in strings.
 */
export const makeReplacer = ({ schemas, name }: MakeReplacerOptions): ReplacerResult => {
  const replacements: [string, string] = ['launchql-extension-name', name];
  const schemaReplacers: [string, string][] = schemas.map((schema) => [
    schema.schema_name,
    Case.snake(`${name}_${schema.name}`)
  ]);

  const replace: [RegExp, string][] = [...schemaReplacers, replacements].map(
    ([from, to]) => [new RegExp(from, 'g'), to]
  );

  const replacer = (str: string, n = 0): string => {
    if (!str) return '';
    if (replace[n] && replace[n].length === 2) {
      return replacer(str.replace(replace[n][0], replace[n][1]), n + 1);
    }
    return str;
  };

  return { replacer, replace };
};
