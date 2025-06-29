import { LaunchQL } from '../src/class/launchql-refactored';
import fs from 'fs';
import os from 'os';
import path from 'path';

const { mkdtempSync, rmSync, cpSync } = fs;

export const FIXTURES_PATH = path.resolve(__dirname, '../../../__fixtures__');

export const getFixturePath = (...paths: string[]) =>
  path.join(FIXTURES_PATH, ...paths);

export const cleanText = (text: string): string =>
  text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join('\n');

/**
 * Test fixture for the refactored LaunchQL class
 * Provides utilities for creating temporary test environments
 */
export class LaunchQLTestFixture {
  readonly tempDir: string;
  readonly tempFixtureDir: string;
  readonly getFixturePath: (...paths: string[]) => string;
  readonly getLaunchQL: (workspacePath?: string[]) => LaunchQL;
  readonly getModuleLaunchQL: (workspacePath: string[], moduleName: string) => LaunchQL;

  constructor(...fixturePath: string[]) {
    const originalFixtureDir = getFixturePath(...fixturePath);
    this.tempDir = mkdtempSync(path.join(os.tmpdir(), 'launchql-test-'));
    this.tempFixtureDir = path.join(this.tempDir, ...fixturePath);

    cpSync(originalFixtureDir, this.tempFixtureDir, { recursive: true });

    this.getFixturePath = (...paths: string[]) =>
      path.join(this.tempFixtureDir, ...paths);

    // Create LaunchQL instance for workspace or specific path
    this.getLaunchQL = (workspacePath?: string[]): LaunchQL => {
      const cwd = workspacePath 
        ? this.getFixturePath(...workspacePath)
        : this.tempFixtureDir;
      return new LaunchQL(cwd);
    };

    // Create LaunchQL instance for a specific module
    this.getModuleLaunchQL = (workspacePath: string[], moduleName: string): LaunchQL => {
      const workspace = new LaunchQL(this.getFixturePath(...workspacePath));
      const moduleMap = workspace.getModuleMap();
      const meta = moduleMap[moduleName];
      if (!meta) throw new Error(`Module ${moduleName} not found in workspace`);
      return new LaunchQL(this.getFixturePath(...workspacePath, meta.path));
    };
  }

  /**
   * Get the full path to a file/directory within the fixture
   */
  fixturePath(...paths: string[]) {
    return path.join(this.tempFixtureDir, ...paths);
  }

  /**
   * Create a new file in the fixture
   */
  createFile(relativePath: string, content: string) {
    const fullPath = this.fixturePath(relativePath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(fullPath, content);
  }

  /**
   * Read a file from the fixture
   */
  readFile(relativePath: string): string {
    return fs.readFileSync(this.fixturePath(relativePath), 'utf-8');
  }

  /**
   * Check if a file exists in the fixture
   */
  fileExists(relativePath: string): boolean {
    return fs.existsSync(this.fixturePath(relativePath));
  }

  /**
   * List files in a directory
   */
  listFiles(relativePath: string = ''): string[] {
    const dir = this.fixturePath(relativePath);
    if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
      return [];
    }
    return fs.readdirSync(dir);
  }

  /**
   * Clean up the temporary directory
   */
  cleanup() {
    rmSync(this.tempDir, { recursive: true, force: true });
  }
}

/**
 * Helper to create a minimal workspace fixture
 */
export function createMinimalWorkspace(): LaunchQLTestFixture {
  const fixture = new LaunchQLTestFixture();
  
  // Create minimal launchql.json
  fixture.createFile('launchql.json', JSON.stringify({
    modules: {},
    extensions: {}
  }, null, 2));

  return fixture;
}

/**
 * Helper to create a workspace with a module
 */
export function createWorkspaceWithModule(moduleName: string, modulePath: string = 'packages/' + moduleName): LaunchQLTestFixture {
  const fixture = new LaunchQLTestFixture();
  
  // Create workspace config
  fixture.createFile('launchql.json', JSON.stringify({
    modules: {
      [moduleName]: {
        path: modulePath
      }
    },
    extensions: {}
  }, null, 2));

  // Create module directory
  fixture.createFile(path.join(modulePath, '.gitkeep'), '');

  // Create module sqitch.conf
  fixture.createFile(path.join(modulePath, 'sqitch.conf'), `[core]
	engine = pg
	plan_file = sqitch.plan
[engine "pg"]
	target = db:pg:
[deploy]
	verify = true
[rebase]
	verify = true
`);

  // Create empty plan
  fixture.createFile(path.join(modulePath, 'sqitch.plan'), `%syntax-version=1.0.0
%project=${moduleName}

`);

  // Create deploy/revert/verify directories
  fixture.createFile(path.join(modulePath, 'deploy', '.gitkeep'), '');
  fixture.createFile(path.join(modulePath, 'revert', '.gitkeep'), '');
  fixture.createFile(path.join(modulePath, 'verify', '.gitkeep'), '');

  return fixture;
}

/**
 * Helper to add a change to a module
 */
export function addChangeToModule(
  fixture: LaunchQLTestFixture, 
  modulePath: string,
  changeName: string,
  dependencies: string[] = []
): void {
  const deployPath = path.join(modulePath, 'deploy', `${changeName}.sql`);
  const revertPath = path.join(modulePath, 'revert', `${changeName}.sql`);
  const verifyPath = path.join(modulePath, 'verify', `${changeName}.sql`);

  // Create SQL files
  fixture.createFile(deployPath, `-- Deploy ${changeName}\nBEGIN;\n\n-- Your deploy SQL here\n\nCOMMIT;\n`);
  fixture.createFile(revertPath, `-- Revert ${changeName}\nBEGIN;\n\n-- Your revert SQL here\n\nCOMMIT;\n`);
  fixture.createFile(verifyPath, `-- Verify ${changeName}\nBEGIN;\n\n-- Your verify SQL here\n\nROLLBACK;\n`);

  // Update plan file
  const planPath = path.join(modulePath, 'sqitch.plan');
  const currentPlan = fixture.readFile(planPath);
  const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  const deps = dependencies.length > 0 ? `[${dependencies.join(' ')}] ` : '';
  const newLine = `${changeName} ${deps}${timestamp} Test User <test@example.com> # Add ${changeName}\n`;
  
  fixture.createFile(planPath, currentPlan + newLine);
}

/**
 * Helper to create a test database configuration
 */
export function createTestDatabaseConfig(fixture: LaunchQLTestFixture, modulePath: string): void {
  const sqitchConf = `[core]
	engine = pg
	plan_file = sqitch.plan
[engine "pg"]
	target = db:pg://postgres@localhost/testdb
[target "test"]
	uri = db:pg://postgres@localhost/testdb
[deploy]
	verify = true
[rebase]
	verify = true
`;
  
  fixture.createFile(path.join(modulePath, 'sqitch.conf'), sqitchConf);
}