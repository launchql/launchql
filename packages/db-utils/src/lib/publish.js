import * as shell from 'shelljs';
import { listModules, getExtensionsAndModulesChanges } from './modules';
import { getExtensionInfo } from './extensions';
import { writePackage } from './package';
import { skitchPath } from './paths';
import * as semver from 'semver';

const releaseTypes = [
  'major',
  'premajor',
  'minor',
  'preminor',
  'patch',
  'prepatch',
  'prerelease'
];

export const publish = async (sqlmodule, release = 'patch') => {
  const cur = process.cwd();

  const path = await skitchPath();
  const modules = await listModules();
  const mod = modules[sqlmodule];

  const info = await getExtensionInfo(`${path}/${mod.path}`);

  const { packageDir } = info;
  const version = info.version;

  const modulesAndChanges = await getExtensionsAndModulesChanges(sqlmodule);
  const needsTag = await modulesAndChanges.sqitch.reduce(
    async (m, v) => {
      if (/^@/.test(v.latest)) {
        return m;
      }
      const mod = modules[v.name];
      const info = await getExtensionInfo(`${path}/${mod.path}`);
      m.deps[v.name] = { versionInfo: v, info };
      return m;
    },
    { deps: {} }
  );

  const keys = Object.keys(needsTag.deps);
  const pkg = require(packageDir + '/package.json');

  pkg.dependencies = pkg.dependencies || [];

  for (var i = 0; i < keys.length; i++) {
    const { info } = needsTag.deps[keys[i]];

    // tag and write package
    process.chdir(info.packageDir);
    console.log('\n');
    console.log(info.packageDir);
    console.log(`sqitch tag ${version} -n 'tag ${version}'`);
    shell.exec(`sqitch tag ${version} -n 'tag ${version}'`, {
      cwd: info.packageDir
    });
    await writePackage(version, true, info.packageDir);

    // add update
    process.chdir(packageDir);
    console.log('\n');
    console.log(packageDir);
    console.log(
      `sqitch add updates/${keys[i]}/${version} -r ${keys[i]}:@${version} -n 'update ${version}'`
    );
    shell.exec(
      `sqitch add updates/${keys[i]}/${version} -r ${keys[i]}:@${version} -n 'update ${version}'`,
      {
        cwd: packageDir
      }
    );
  }

  process.chdir(packageDir);
  console.log('\n');
  console.log(packageDir);
  console.log(`sqitch tag ${version} -n 'tag ${version}'`);

  shell.exec(`sqitch tag ${version} -n 'tag ${version}'`, {
    cwd: packageDir
  });
  await writePackage(version, true, packageDir);

  process.chdir(cur);
};

export const publishAndBump = async (sqlmodule, release = 'patch') => {
  const cur = process.cwd();

  if (!releaseTypes.includes(release)) {
    throw new Error('not a proper release');
  }

  const path = await skitchPath();
  const modules = await listModules();
  const mod = modules[sqlmodule];

  const info = await getExtensionInfo(`${path}/${mod.path}`);
  shell.rm(info.packageDir + '/sql/' + info.sqlFile);
  const { packageDir } = info;
  let version = semver.inc(info.version, release);

  const modulesAndChanges = await getExtensionsAndModulesChanges(sqlmodule);
  const needsTag = await modulesAndChanges.sqitch.reduce(
    async (m, v) => {
      if (/^@/.test(v.latest)) {
        return m;
      }

      const mod = modules[v.name];
      const info = await getExtensionInfo(`${path}/${mod.path}`);

      if (semver.gt(info.version, version)) {
        m.version = semver.inc(info.version, release);
        version = m.version;
      }

      //shell.rm(info.packageDir + '/sql/' + info.sqlFile);

      m.deps[v.name] = { versionInfo: v, info };
      return m;
    },
    { version, deps: {} }
  );

  const keys = Object.keys(needsTag.deps);
  const pkg = require(packageDir + '/package.json');

  pkg.dependencies = pkg.dependencies || [];

  for (var i = 0; i < keys.length; i++) {
    const { info } = needsTag.deps[keys[i]];

    // tag and write package
    process.chdir(info.packageDir);
    shell.exec(`sqitch tag ${version} -n 'tag ${version}'`, {
      cwd: info.packageDir
    });
    await writePackage(version, true, info.packageDir);

    // add update
    process.chdir(packageDir);
    shell.exec(
      `sqitch add updates/${keys[i]}/${version} -r ${keys[i]}:@${version} -n 'update ${version}'`,
      {
        cwd: packageDir
      }
    );
  }

  process.chdir(packageDir);
  shell.exec(`sqitch tag ${version} -n 'tag ${version}'`, {
    cwd: packageDir
  });
  await writePackage(version, true, packageDir);

  process.chdir(cur);
};
