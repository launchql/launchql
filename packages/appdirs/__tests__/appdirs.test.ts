import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { appdirs, ensure, resolve } from '../src';

describe('appdirs', () => {
  let tempBase: string;

  beforeEach(() => {
    tempBase = fs.mkdtempSync(path.join(os.tmpdir(), 'appdirs-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(tempBase)) {
      fs.rmSync(tempBase, { recursive: true, force: true });
    }
  });

  describe('Basic functionality', () => {
    it('should return correct directory paths for a tool', () => {
      const dirs = appdirs('pgpm', { baseDir: tempBase });
      
      expect(dirs.root).toBe(path.join(tempBase, '.pgpm'));
      expect(dirs.config).toBe(path.join(tempBase, '.pgpm', 'config'));
      expect(dirs.cache).toBe(path.join(tempBase, '.pgpm', 'cache'));
      expect(dirs.data).toBe(path.join(tempBase, '.pgpm', 'data'));
      expect(dirs.logs).toBe(path.join(tempBase, '.pgpm', 'logs'));
      expect(dirs.tmp).toBe(path.join(os.tmpdir(), 'pgpm'));
      expect(dirs.usedFallback).toBeUndefined();
    });

    it('should work with different tool names', () => {
      const dirs1 = appdirs('lql', { baseDir: tempBase });
      const dirs2 = appdirs('myapp', { baseDir: tempBase });
      
      expect(dirs1.root).toBe(path.join(tempBase, '.lql'));
      expect(dirs2.root).toBe(path.join(tempBase, '.myapp'));
    });

    it('should use custom tmpRoot when provided', () => {
      const customTmp = path.join(tempBase, 'tmp');
      const dirs = appdirs('pgpm', { baseDir: tempBase, tmpRoot: customTmp });
      
      expect(dirs.tmp).toBe(path.join(customTmp, 'pgpm'));
    });
  });

  describe('ensure option', () => {
    it('should create directories when ensure is true', () => {
      const dirs = appdirs('pgpm', { baseDir: tempBase, ensure: true });
      
      expect(fs.existsSync(dirs.root)).toBe(true);
      expect(fs.existsSync(dirs.config)).toBe(true);
      expect(fs.existsSync(dirs.cache)).toBe(true);
      expect(fs.existsSync(dirs.data)).toBe(true);
      expect(fs.existsSync(dirs.logs)).toBe(true);
      expect(dirs.usedFallback).toBeFalsy();
    });

    it('should not create directories when ensure is false', () => {
      const dirs = appdirs('pgpm', { baseDir: tempBase, ensure: false });
      
      expect(fs.existsSync(dirs.root)).toBe(false);
      expect(fs.existsSync(dirs.config)).toBe(false);
    });

    it('should not create tmp directory', () => {
      const customTmp = path.join(tempBase, 'tmp');
      const dirs = appdirs('pgpm', { baseDir: tempBase, ensure: true, tmpRoot: customTmp });
      
      expect(fs.existsSync(dirs.tmp)).toBe(false);
    });
  });

  describe('ensure function', () => {
    it('should create directories that do not exist', () => {
      const dirs = appdirs('pgpm', { baseDir: tempBase });
      const result = ensure(dirs);
      
      expect(result.created.length).toBeGreaterThan(0);
      expect(result.created).toContain(dirs.root);
      expect(result.created).toContain(dirs.config);
      expect(result.usedFallback).toBe(false);
      
      expect(fs.existsSync(dirs.root)).toBe(true);
      expect(fs.existsSync(dirs.config)).toBe(true);
    });

    it('should not recreate existing directories', () => {
      const dirs = appdirs('pgpm', { baseDir: tempBase, ensure: true });
      const result = ensure(dirs);
      
      expect(result.created.length).toBe(0);
      expect(result.usedFallback).toBe(false);
    });
  });

  describe('resolve function', () => {
    it('should resolve paths within config directory', () => {
      const dirs = appdirs('pgpm', { baseDir: tempBase });
      const configPath = resolve(dirs, 'config', 'settings.json');
      
      expect(configPath).toBe(path.join(dirs.config, 'settings.json'));
    });

    it('should resolve paths within cache directory', () => {
      const dirs = appdirs('pgpm', { baseDir: tempBase });
      const cachePath = resolve(dirs, 'cache', 'repos', 'my-repo');
      
      expect(cachePath).toBe(path.join(dirs.cache, 'repos', 'my-repo'));
    });

    it('should resolve paths within data directory', () => {
      const dirs = appdirs('pgpm', { baseDir: tempBase });
      const dataPath = resolve(dirs, 'data', 'db.json');
      
      expect(dataPath).toBe(path.join(dirs.data, 'db.json'));
    });

    it('should resolve paths within logs directory', () => {
      const dirs = appdirs('pgpm', { baseDir: tempBase });
      const logPath = resolve(dirs, 'logs', 'app.log');
      
      expect(logPath).toBe(path.join(dirs.logs, 'app.log'));
    });

    it('should resolve paths within tmp directory', () => {
      const dirs = appdirs('pgpm', { baseDir: tempBase });
      const tmpPath = resolve(dirs, 'tmp', 'temp-file.txt');
      
      expect(tmpPath).toBe(path.join(dirs.tmp, 'temp-file.txt'));
    });
  });

  describe('Edge cases', () => {
    it('should handle tool names with special characters', () => {
      const dirs = appdirs('my-app', { baseDir: tempBase });
      
      expect(dirs.root).toBe(path.join(tempBase, '.my-app'));
    });

    it('should be consistent across multiple calls', () => {
      const dirs1 = appdirs('pgpm', { baseDir: tempBase });
      const dirs2 = appdirs('pgpm', { baseDir: tempBase });
      
      expect(dirs1.root).toBe(dirs2.root);
      expect(dirs1.config).toBe(dirs2.config);
      expect(dirs1.cache).toBe(dirs2.cache);
    });
  });

  describe('Integration tests', () => {
    it('should support full workflow: resolve, ensure, use', () => {
      const dirs = appdirs('pgpm', { baseDir: tempBase });
      
      const ensureResult = ensure(dirs);
      expect(ensureResult.usedFallback).toBe(false);
      
      const configFile = resolve(dirs, 'config', 'settings.json');
      
      fs.writeFileSync(configFile, JSON.stringify({ test: 'value' }));
      
      const content = JSON.parse(fs.readFileSync(configFile, 'utf8'));
      expect(content.test).toBe('value');
    });

    it('should work with ensure option', () => {
      const dirs = appdirs('pgpm', { baseDir: tempBase, ensure: true });
      
      expect(fs.existsSync(dirs.root)).toBe(true);
      expect(fs.existsSync(dirs.config)).toBe(true);
      expect(dirs.root).toBe(path.join(tempBase, '.pgpm'));
    });
  });
});
