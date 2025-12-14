import fs from 'fs';
import os from 'os';
import path from 'path';

import { PgpmPackage } from '../src';
import { getFixturePath } from './utils';

const { mkdtempSync, rmSync, cpSync } = fs;

export class TestFixture {
  readonly tempDir: string;
  readonly tempFixtureDir: string;
  readonly getFixturePath: (...paths: string[]) => string;
  readonly getModuleProject: (workspacePath: string[], moduleName: string) => PgpmPackage;
  
  constructor(...fixturePath: string[]) {
    const originalFixtureDir = getFixturePath(...fixturePath);
    this.tempDir = mkdtempSync(path.join(os.tmpdir(), 'launchql-test-'));
    this.tempFixtureDir = path.join(this.tempDir, ...fixturePath);
  
    cpSync(originalFixtureDir, this.tempFixtureDir, { recursive: true });
  
    this.getFixturePath = (...paths: string[]) =>
      path.join(this.tempFixtureDir, ...paths);
  
    this.getModuleProject = (workspacePath: string[], moduleName: string): PgpmPackage => {
      const workspace = new PgpmPackage(this.getFixturePath(...workspacePath));
      const moduleMap = workspace.getModuleMap();
      const meta = moduleMap[moduleName];
      if (!meta) throw new Error(`Module ${moduleName} not found in workspace`);
      return new PgpmPackage(this.getFixturePath(...workspacePath, meta.path));
    };
  }
  
  fixturePath(...paths: string[]) {
    return path.join(this.tempFixtureDir, ...paths);
  }
  
  cleanup() {
    rmSync(this.tempDir, { recursive: true, force: true });
  }
}
  