import fs from 'fs';
import os from 'os';
import path from 'path';
import { writeExtensions, generateControlFileContent } from '../../../src/files/extension/writer';
import { getInstalledExtensions } from '../../../src/files/extension/reader';

describe('extension writer', () => {
  let tempDir: string;
  let packageDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'launchql-test-'));
    packageDir = path.join(tempDir, 'test-module');
    fs.mkdirSync(packageDir, { recursive: true });

    fs.writeFileSync(
      path.join(packageDir, 'package.json'),
      JSON.stringify({ name: 'test-module', version: '1.0.0' }, null, 2)
    );

    fs.writeFileSync(
      path.join(packageDir, 'launchql.plan'),
      '%project=test-module\n\nschema 2024-01-01T00:00:00Z Test User <test@example.com> # Add schema\n'
    );
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe('generateControlFileContent', () => {
    it('generates control file with single extension', () => {
      const content = generateControlFileContent({
        name: 'test-module',
        version: '1.0.0',
        requires: ['pgcrypto']
      });

      expect(content).toContain("comment = 'test-module extension'");
      expect(content).toContain("default_version = '1.0.0'");
      expect(content).toContain("module_pathname = '$libdir/test-module'");
      expect(content).toContain("requires = 'pgcrypto'");
      expect(content).toContain('relocatable = false');
      expect(content).toContain('superuser = false');
    });

    it('generates control file with multiple extensions', () => {
      const content = generateControlFileContent({
        name: 'test-module',
        version: '1.0.0',
        requires: ['pgcrypto', 'postgis', 'plpgsql']
      });

      expect(content).toContain("requires = 'pgcrypto,postgis,plpgsql'");
    });

    it('generates control file without requires when empty array', () => {
      const content = generateControlFileContent({
        name: 'test-module',
        version: '1.0.0',
        requires: []
      });

      expect(content).not.toContain('requires =');
      expect(content).toContain("comment = 'test-module extension'");
      expect(content).toContain("default_version = '1.0.0'");
    });

    it('generates control file with custom comment', () => {
      const content = generateControlFileContent({
        name: 'test-module',
        version: '1.0.0',
        comment: 'Custom test module',
        requires: []
      });

      expect(content).toContain("comment = 'Custom test module'");
    });

    it('generates control file with custom module_pathname', () => {
      const content = generateControlFileContent({
        name: 'test-module',
        version: '1.0.0',
        module_pathname: '$libdir/custom-path',
        requires: []
      });

      expect(content).toContain("module_pathname = '$libdir/custom-path'");
    });

    it('generates control file with schema', () => {
      const content = generateControlFileContent({
        name: 'test-module',
        version: '1.0.0',
        schema: 'public',
        requires: []
      });

      expect(content).toContain('schema = public');
    });
  });

  describe('writeExtensions', () => {
    it('writes control file and Makefile with single extension', () => {
      writeExtensions(packageDir, ['pgcrypto']);

      const controlFile = path.join(packageDir, 'test-module.control');
      const makefile = path.join(packageDir, 'Makefile');

      expect(fs.existsSync(controlFile)).toBe(true);
      expect(fs.existsSync(makefile)).toBe(true);

      const controlContent = fs.readFileSync(controlFile, 'utf-8');
      expect(controlContent).toContain("requires = 'pgcrypto'");
      expect(controlContent).toContain("default_version = '1.0.0'");

      const makefileContent = fs.readFileSync(makefile, 'utf-8');
      expect(makefileContent).toContain('EXTENSION = test-module');
      expect(makefileContent).toContain('DATA = sql/test-module--1.0.0.sql');
    });

    it('writes control file with multiple extensions', () => {
      writeExtensions(packageDir, ['pgcrypto', 'postgis', 'plpgsql']);

      const controlFile = path.join(packageDir, 'test-module.control');
      const controlContent = fs.readFileSync(controlFile, 'utf-8');

      expect(controlContent).toContain("requires = 'pgcrypto,postgis,plpgsql'");

      const extensions = getInstalledExtensions(controlFile);
      expect(extensions).toEqual(['pgcrypto', 'postgis', 'plpgsql']);
    });

    it('writes control file without requires when empty array', () => {
      writeExtensions(packageDir, []);

      const controlFile = path.join(packageDir, 'test-module.control');
      const controlContent = fs.readFileSync(controlFile, 'utf-8');

      expect(controlContent).not.toContain('requires =');

      const extensions = getInstalledExtensions(controlFile);
      expect(extensions).toEqual([]);
    });

    it('updates existing control file with new extensions', () => {
      writeExtensions(packageDir, ['pgcrypto']);

      let controlFile = path.join(packageDir, 'test-module.control');
      let extensions = getInstalledExtensions(controlFile);
      expect(extensions).toEqual(['pgcrypto']);

      writeExtensions(packageDir, ['pgcrypto', 'postgis']);

      extensions = getInstalledExtensions(controlFile);
      expect(extensions).toEqual(['pgcrypto', 'postgis']);
    });

    it('handles idempotent writes with same extensions', () => {
      writeExtensions(packageDir, ['pgcrypto', 'postgis']);

      const controlFile = path.join(packageDir, 'test-module.control');
      const firstContent = fs.readFileSync(controlFile, 'utf-8');

      writeExtensions(packageDir, ['pgcrypto', 'postgis']);

      const secondContent = fs.readFileSync(controlFile, 'utf-8');
      expect(secondContent).toBe(firstContent);
    });

    it('overwrites control file when extensions change', () => {
      writeExtensions(packageDir, ['pgcrypto']);

      const controlFile = path.join(packageDir, 'test-module.control');
      let extensions = getInstalledExtensions(controlFile);
      expect(extensions).toEqual(['pgcrypto']);

      writeExtensions(packageDir, ['postgis', 'plpgsql']);

      extensions = getInstalledExtensions(controlFile);
      expect(extensions).toEqual(['postgis', 'plpgsql']);
    });

    it('writes extensions in the order provided', () => {
      writeExtensions(packageDir, ['plpgsql', 'pgcrypto', 'postgis']);

      const controlFile = path.join(packageDir, 'test-module.control');
      const controlContent = fs.readFileSync(controlFile, 'utf-8');

      expect(controlContent).toContain("requires = 'plpgsql,pgcrypto,postgis'");

      const extensions = getInstalledExtensions(controlFile);
      expect(extensions).toEqual(['plpgsql', 'pgcrypto', 'postgis']);
    });
  });
});
