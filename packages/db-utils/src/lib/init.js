import '@launchql/db-template';
import { promisify } from 'util';
import { exec } from 'child_process';
import { sqitchPath as path, skitchPath as sPath } from './paths';
import {
  writeExtensionMakefile,
  writeExtensionControlFile,
  getExtensionInfo
} from './extensions';
import { dirname, basename } from 'path';
import * as shell from 'shelljs';
import { writeFileSync } from 'fs';
const srcPath = dirname(require.resolve('@launchql/db-template'));
import { makePlan } from './plans';
import { sluggify } from './utils';

const makePackage = ({ name, description, author }) => {
  return {
    name,
    version: '0.0.1',
    description,
    author,
    private: true,
    scripts: {
      test: 'FAST_TEST=1 launchql-db-templatedb && jest',
      'test:watch': 'FAST_TEST=1 jest --watch'
    },
    devDependencies: {
      '@types/jest': '21.1.0',
      '@types/node': '8.0.0',
      'babel-cli': '6.24.1',
      'babel-jest': '20.0.3',
      'babel-preset-react-app': '3.0.0',
      jest: '20.0.4',
      '@launchql/db-testing': 'latest',
      uuid: '3.1.0'
    }
  };
};

export const init = async ({ name, description, author, extensions }) => {
  await sPath();

  // init sqitch

  const cmd = ['sqitch', 'init', name, '--engine', 'pg'].join(' ');
  await promisify(exec)(cmd.trim());

  // now we have a sqitch path!

  const sqitchPath = await path();
  const pkg = makePackage({ name, description, author });

  // initialize template
  shell.cp('-r', `${srcPath}/sqitch/*`, `${sqitchPath}/`);
  shell.cp('-r', `${srcPath}/sqitch/.*`, `${sqitchPath}/`);

  writeFileSync(`${sqitchPath}/package.json`, JSON.stringify(pkg, null, 2));

  shell.mkdir('-p', `${sqitchPath}/sql`);
  const extname = sluggify(name);

  const info = await getExtensionInfo();

  await writeExtensionMakefile({
    path: info.Makefile,
    extname,
    version: '0.0.1'
  });
  await writeExtensionControlFile({
    path: info.controlFile,
    extname,
    version: '0.0.1',
    extensions
  });

  const settings = {
    name,
    projects: true
  };

  const plan = await makePlan(sqitchPath, settings);
  writeFileSync(`${sqitchPath}/sqitch.plan`, plan);
};

export const initSkitch = async () => {
  const dir = process.cwd();
  shell.cp('-r', `${srcPath}/template/*`, `${dir}/`);
  shell.cp('-r', `${srcPath}/template/.*`, `${dir}/`);
  const name = sluggify(basename(dirname(process.cwd())));
  const pkg = {
    private: true,
    name,
    scripts: {
      build: 'lerna run prepare --parallel',
      bootstrap: 'lerna bootstrap --use-workspaces'
    },
    dependencies: {
      'skitch-extension-defaults': 'latest',
      'skitch-extension-default-roles': 'latest',
      'skitch-extension-verify': 'latest',
      'skitch-extension-utils': 'latest'
    },
    devDependencies: {
      '@babel/cli': '7.8.4',
      '@babel/core': '7.8.4',
      '@pyramation/babel-preset-env': '0.1.0',
      'babel-core': '7.0.0-bridge.0',
      'babel-eslint': '10.0.3',
      'babel-jest': '^24.9.0',
      eslint: '6.8.0',
      'eslint-config-prettier': '^6.10.0',
      'eslint-plugin-prettier': '^3.1.2',
      jest: '25.1.0',
      lerna: '3.20.2',
      prettier: '2.0.4'
    },
    workspaces: ['packages/*']
  };
  writeFileSync(`${process.cwd()}/package.json`, JSON.stringify(pkg, null, 2));
  const lerna = {
    lerna: '3.4.2',
    useWorkspaces: true,
    npmClient: 'yarn',
    npmClientArgs: ['--no-lockfile'],
    packages: ['packages/*'],
    version: 'independent',
    registry: 'https://registry.npmjs.org',
    command: {
      create: {
        license: 'SEE LICENSE IN LICENSE',
        access: 'restricted'
      },
      publish: {
        allowBranch: 'master'
      }
    }
  };
  writeFileSync(`${process.cwd()}/lerna.json`, JSON.stringify(lerna, null, 2));
};
