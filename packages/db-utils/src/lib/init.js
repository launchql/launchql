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
      test: 'FAST_TEST=1 launchql-templatedb && jest',
      'test:watch': 'FAST_TEST=1 jest --watch'
    },
    devDependencies: {
      '@babel/cli': '7.10.4',
      '@babel/core': '7.10.4',
      '@babel/plugin-proposal-class-properties': '7.10.4',
      '@babel/plugin-proposal-export-default-from': '7.10.4',
      '@babel/plugin-proposal-object-rest-spread': '7.10.4',
      '@babel/plugin-transform-runtime': '7.10.4',
      '@babel/preset-env': '7.10.4',
      '@launchql/db-testing': 'latest',
      '@launchql/graphql-testing': 'latest',
      'babel-eslint': '10.1.0',
      'babel-jest': '26.1.0',
      'babel-plugin-import-graphql': '2.7.0',
      'babel-plugin-macros': '2.8.0',
      eslint: '^7.3.1',
      'eslint-config-prettier': '^6.10.0',
      'eslint-plugin-prettier': '^3.1.2',
      'graphql-tag': '2.10.3',
      graphql: '^14.0.2',
      jest: '26.1.0',
      prettier: '2.0.5',
      'regenerator-runtime': '^0.13.2'
    },
    dependencies: {
      '@babel/runtime': '^7.4.2'
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
  writeFileSync(
    `${sqitchPath}/.npmignore`,
    `*.log
npm-debug.log*

# Coverage directory used by tools like istanbul
coverage
.nyc_output

# Dependency directories
node_modules

# npm package lock
package-lock.json
yarn.lock

# project files
src
test
examples
CHANGELOG.md
.travis.yml
.editorconfig
.eslintignore
.eslintrc
.babelrc
.gitignore
`
  );
  writeFileSync(
    `${sqitchPath}/.gitignore`,
    `node_modules
`
  );
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
      '@babel/cli': '7.10.4',
      '@babel/core': '7.10.4',
      '@pyramation/babel-preset-env': '0.1.0',
      'babel-eslint': '10.1.0',
      'babel-jest': '26.1.0',
      eslint: '7.3.1',
      'eslint-config-prettier': '^6.10.0',
      'eslint-plugin-prettier': '^3.1.2',
      jest: '26.1.0',
      lerna: '3.22.1',
      prettier: '2.0.5'
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
  const ignore = `node_modules
.DS_Store
.eslintcache
*.log
**/node_modules
coverage
packages/**/build
packages/**/main
packages/**/module`;
  writeFileSync(`${process.cwd()}/.gitignore`, ignore);
  writeFileSync(`${process.cwd()}/.npmignore`, ignore);
  writeFileSync(
    `${process.cwd()}/Makefile`,
    `
up:
\tdocker-compose up -d

down:
\tdocker-compose down -v

ssh:
\tdocker exec -it ${name}-postgres /bin/bash

install:
\tdocker exec ${name}-postgres /sql-extensions/install.sh

  `
  );
  writeFileSync(
    `${process.cwd()}/docker-compose.yml`,
    `version: "2"
services:
  postgres:
    container_name: ${name}-postgres
    image: pyramation/postgres-plv8
    environment:
      - "POSTGRES_USER=postgres"
      - "POSTGRES_PASSWORD=password"
    ports:
      - "5432:5432"
    expose:
      - "5432"
    volumes:
      - ./packages:/sql-extensions
      - ./node_modules:/sql-modules
  `
  );
};
