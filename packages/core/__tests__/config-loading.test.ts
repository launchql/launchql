import fs from 'fs';
import os from 'os';
import path from 'path';

import { PgpmPackage } from '../src/core/class/pgpm';

describe('Config Loading', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'launchql-config-test-'));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should load JSON config', () => {
    const configContent = {
      packages: ['packages/*', 'extensions/*']
    };
    
    fs.writeFileSync(
      path.join(tempDir, 'pgpm.json'),
      JSON.stringify(configContent, null, 2)
    );

    const project = new PgpmPackage(tempDir);
    
    expect(project.config).toEqual(configContent);
    expect(project.config?.packages).toEqual(['packages/*', 'extensions/*']);
  });

  it('should load JS config with JSDoc types', () => {
    const configContent = `/** @type {import('@pgpmjs/types').LaunchQLWorkspaceConfig} */
module.exports = {
  packages: ['packages/*', 'extensions/*'],
  name: 'test-workspace',
  settings: {
    enableExperimentalFeatures: true
  }
};`;
    
    fs.writeFileSync(
      path.join(tempDir, 'pgpm.config.js'),
      configContent
    );

    const project = new PgpmPackage(tempDir);
    
    expect(project.config?.packages).toEqual(['packages/*', 'extensions/*']);
    expect(project.config?.name).toBe('test-workspace');
    expect(project.config?.settings?.enableExperimentalFeatures).toBe(true);
  });

  it('should prefer JS config over JSON when both exist', () => {
    const jsonConfig = {
      packages: ['json-packages/*']
    };
    
    const jsConfig = `module.exports = {
  packages: ['js-packages/*'],
  name: 'js-workspace'
};`;
    
    fs.writeFileSync(
      path.join(tempDir, 'pgpm.json'),
      JSON.stringify(jsonConfig, null, 2)
    );
    
    fs.writeFileSync(
      path.join(tempDir, 'pgpm.config.js'),
      jsConfig
    );

    const project = new PgpmPackage(tempDir);
    
    expect(project.config?.packages).toEqual(['js-packages/*']);
    expect(project.config?.name).toBe('js-workspace');
  });

  it('should have no config when no config file exists', () => {
    const project = new PgpmPackage(tempDir);
    expect(project.config).toBeUndefined();
    expect(project.workspacePath).toBeUndefined();
  });
});
