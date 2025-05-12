import '@launchql/db-template';
import { promisify } from 'util';
import { exec } from 'child_process';
import { sqitchPath, launchqlPath } from './paths';
import {
  writeExtensionMakefile,
  writeExtensionControlFile,
  getExtensionInfo
} from './extensions';
import { dirname, basename } from 'path';
import * as shell from 'shelljs';
import { writeFileSync } from 'fs';
import { makePlan } from './plans';
import { sluggify } from './utils';

// const srcPath = dirname(require.resolve('@launchql/db-template'));

interface PackageOptions {
  name: string;
  description: string;
  author: string;
}

interface InitOptions extends PackageOptions {
  extensions: string[];
  username: string;
  scoped: boolean;
}

const makePackage = ({ name, description, author }: PackageOptions): Record<string, any> => ({
  name,
  version: '0.0.1',
  description,
  author,
  publishConfig: {
    access: 'restricted'
  },
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
    '@babel/runtime': '^7.4.2',
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
  dependencies: {}
});

export const init = async ({
  name,
  description,
  author,
  extensions,
  username,
  scoped
}: InitOptions): Promise<void> => {
  const workspacePath = await launchqlPath();

  const cur = process.cwd();
  if (process.env.INIT_PATH) {
    process.chdir(process.env.INIT_PATH);
  }

  const pkgname = scoped ? `@${username}/${name}` : name;
  const sqitchname = scoped ? `${username}-${name}` : name;

  const cmd = ['sqitch', 'init', sqitchname, '--engine', 'pg'].join(' ');
  await promisify(exec)(cmd.trim());

  const pkgPath = await sqitchPath();
  const pkg = makePackage({ name: pkgname, description, author });

  // TODO — discover what was inside of the sqitch/* in the old template 
//   shell.cp('-r', `${srcPath}/sqitch/*`, `${pkgPath}/`);
//   shell.cp('-r', `${srcPath}/sqitch/.*`, `${pkgPath}/`);

  writeFileSync(`${pkgPath}/package.json`, JSON.stringify(pkg, null, 2));
  shell.mkdir('-p', `${pkgPath}/sql`);

  const extname = sluggify(sqitchname);
  const info = await getExtensionInfo(pkgPath);

  await writeExtensionMakefile(
    info.Makefile,
    extname,
    '0.0.1'
  );

  await writeExtensionControlFile(
    info.controlFile,
    extname,
    extensions,
    '0.0.1'
  );

  const settings = { name: sqitchname, projects: true };
  const plan = await makePlan(workspacePath, pkgPath, settings);

  writeFileSync(`${pkgPath}/sqitch.plan`, plan);
  writeFileSync(`${pkgPath}/.npmignore`, `# NOTE keeping this minimal since we generally want everything

*.log
npm-debug.log*
node_modules
package-lock.json
yarn.lock    
`);
  writeFileSync(`${pkgPath}/.gitignore`, `node_modules\n`);
  process.chdir(cur);
};

export const initSkitch = async (): Promise<void> => {
  const dir = process.cwd();
  // shell.cp('-r', `${srcPath}/template/*`, `${dir}/`);
  // shell.cp('-r', `${srcPath}/template/.*`, `${dir}/`);

  const name = sluggify(basename(process.cwd()));
  const pkg = {
    private: true,
    name,
    scripts: {
      build: 'lerna run prepare --parallel',
      bootstrap: 'lerna bootstrap --use-workspaces'
    },
    devDependencies: {
      '@babel/cli': '7.12.1',
      '@babel/core': '7.12.3',
      '@pyramation/babel-preset-env': '0.1.0',
      'babel-eslint': '10.1.0',
      'babel-jest': '26.6.1',
      eslint: '7.12.1',
      'eslint-config-prettier': '^6.10.0',
      'eslint-plugin-prettier': '^3.1.2',
      jest: '26.6.1',
      lerna: '3.22.1',
      prettier: '2.1.2'
    },
    workspaces: ['packages/*']
  };

  writeFileSync(`${dir}/package.json`, JSON.stringify(pkg, null, 2));

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

  const ignore = `node_modules
.DS_Store
.eslintcache
*.log
**/node_modules
coverage
packages/**/build
packages/**/main
packages/**/module`;

  writeFileSync(`${dir}/lerna.json`, JSON.stringify(lerna, null, 2));
  writeFileSync(`${dir}/.gitignore`, ignore);
  writeFileSync(`${dir}/.npmignore`, ignore);

  writeFileSync(
    `${dir}/Makefile`,
    `
up:
\tdocker-compose up -d

down:
\tdocker-compose down -v

ssh:
\tdocker exec -it ${name}-postgres /bin/bash

install:
\tdocker exec ${name}-postgres /sql-bin/install.sh
`
  );

  writeFileSync(
    `${dir}/docker-compose.yml`,
    `version: "2"
services:
  postgres:
    container_name: ${name}-postgres
    image: pyramation/postgis
    environment:
      - "POSTGRES_USER=postgres"
      - "POSTGRES_PASSWORD=password"
    ports:
      - "5432:5432"
    expose:
      - "5432"
    volumes:
      - ./bin:/sql-bin
      - ./packages:/sql-packages
      - ./extensions:/sql-extensions
`
  );
};
