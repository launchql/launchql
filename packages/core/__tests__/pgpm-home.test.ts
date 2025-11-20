import fs from 'fs';
import os from 'os';
import path from 'path';

import { PgpmHome } from '../src/utils/pgpm-home';

describe('PgpmHome Class', () => {
  let tempHome: string;
  let tempStateDir: string;

  beforeEach(() => {
    tempHome = fs.mkdtempSync(path.join(os.tmpdir(), 'pgpm-home-test-'));
    tempStateDir = path.join(tempHome, '.pgpm');
    
    jest.spyOn(os, 'homedir').mockReturnValue(tempHome);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    
    if (fs.existsSync(tempHome)) {
      fs.rmSync(tempHome, { recursive: true, force: true });
    }
  });

  describe('Constructor and path resolution', () => {
    it('should use default stateDir (~/.pgpm) when not specified', () => {
      const pgpmHome = new PgpmHome();
      
      expect(pgpmHome.getStateDir()).toBe(path.join(tempHome, '.pgpm'));
      expect(pgpmHome.getStateFilePath()).toBe(path.join(tempHome, '.pgpm', 'state.json'));
    });

    it('should use custom stateDir when specified', () => {
      const customDir = path.join(tempHome, 'custom-state');
      const pgpmHome = new PgpmHome({ stateDir: customDir });
      
      expect(pgpmHome.getStateDir()).toBe(customDir);
      expect(pgpmHome.getStateFilePath()).toBe(path.join(customDir, 'state.json'));
    });

    it('should expand ~ in stateDir path', () => {
      const pgpmHome = new PgpmHome({ stateDir: '~/.custom-pgpm' });
      
      expect(pgpmHome.getStateDir()).toBe(path.join(tempHome, '.custom-pgpm'));
    });

    it('should handle homedir failure gracefully', () => {
      jest.spyOn(os, 'homedir').mockImplementation(() => {
        throw new Error('No home directory');
      });
      
      const pgpmHome = new PgpmHome();
      
      expect(pgpmHome.getStateDir()).toBe('.pgpm');
    });
  });

  describe('exists()', () => {
    it('should return false when state directory does not exist', () => {
      const pgpmHome = new PgpmHome({ stateDir: tempStateDir });
      
      expect(pgpmHome.exists()).toBe(false);
    });

    it('should return true when state directory exists', () => {
      fs.mkdirSync(tempStateDir);
      const pgpmHome = new PgpmHome({ stateDir: tempStateDir });
      
      expect(pgpmHome.exists()).toBe(true);
    });

    it('should return false on error', () => {
      const pgpmHome = new PgpmHome({ stateDir: '/nonexistent/path/that/will/fail' });
      jest.spyOn(fs, 'existsSync').mockImplementation(() => {
        throw new Error('Permission denied');
      });
      
      expect(pgpmHome.exists()).toBe(false);
    });
  });

  describe('ensure()', () => {
    it('should create state directory if it does not exist', () => {
      const pgpmHome = new PgpmHome({ stateDir: tempStateDir });
      
      const result = pgpmHome.ensure();
      
      expect(result).toBe(true);
      expect(fs.existsSync(tempStateDir)).toBe(true);
    });

    it('should return true if state directory already exists', () => {
      fs.mkdirSync(tempStateDir);
      const pgpmHome = new PgpmHome({ stateDir: tempStateDir });
      
      const result = pgpmHome.ensure();
      
      expect(result).toBe(true);
      expect(fs.existsSync(tempStateDir)).toBe(true);
    });

    it('should return false on creation failure', () => {
      const pgpmHome = new PgpmHome({ stateDir: tempStateDir });
      
      jest.spyOn(fs, 'mkdirSync').mockImplementation(() => {
        throw new Error('EACCES: permission denied');
      });
      
      const result = pgpmHome.ensure();
      expect(result).toBe(false);
    });

    it('should not throw on permission errors', () => {
      const pgpmHome = new PgpmHome({ stateDir: tempStateDir });
      
      jest.spyOn(fs, 'mkdirSync').mockImplementation(() => {
        throw new Error('EACCES: permission denied');
      });
      
      expect(() => pgpmHome.ensure()).not.toThrow();
    });
  });

  describe('readState()', () => {
    it('should return null when state file does not exist', () => {
      const pgpmHome = new PgpmHome({ stateDir: tempStateDir });
      
      const state = pgpmHome.readState();
      expect(state).toBeNull();
    });

    it('should read state from state.json file', () => {
      fs.mkdirSync(tempStateDir);
      const testState = { key: 'value', count: 42 };
      fs.writeFileSync(
        path.join(tempStateDir, 'state.json'),
        JSON.stringify(testState)
      );
      
      const pgpmHome = new PgpmHome({ stateDir: tempStateDir });
      const state = pgpmHome.readState();
      
      expect(state).toEqual(testState);
    });

    it('should return null on read error', () => {
      const pgpmHome = new PgpmHome({ stateDir: tempStateDir });
      
      jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
        throw new Error('Read error');
      });
      
      const state = pgpmHome.readState();
      expect(state).toBeNull();
    });

    it('should return null on invalid JSON', () => {
      fs.mkdirSync(tempStateDir);
      fs.writeFileSync(path.join(tempStateDir, 'state.json'), 'invalid json');
      
      const pgpmHome = new PgpmHome({ stateDir: tempStateDir });
      const state = pgpmHome.readState();
      
      expect(state).toBeNull();
    });

    it('should support generic type parameter', () => {
      fs.mkdirSync(tempStateDir);
      interface CustomState {
        name: string;
        count: number;
      }
      const testState: CustomState = { name: 'test', count: 42 };
      fs.writeFileSync(
        path.join(tempStateDir, 'state.json'),
        JSON.stringify(testState)
      );
      
      const pgpmHome = new PgpmHome({ stateDir: tempStateDir });
      const state = pgpmHome.readState<CustomState>();
      
      expect(state).toEqual(testState);
      expect(state?.name).toBe('test');
    });
  });

  describe('writeState()', () => {
    it('should write state to state.json file', () => {
      const pgpmHome = new PgpmHome({ stateDir: tempStateDir });
      const testState = { key: 'value', count: 42 };
      
      const result = pgpmHome.writeState(testState);
      
      expect(result).toBe(true);
      
      const statePath = path.join(tempStateDir, 'state.json');
      expect(fs.existsSync(statePath)).toBe(true);
      
      const content = JSON.parse(fs.readFileSync(statePath, 'utf-8'));
      expect(content).toEqual(testState);
    });

    it('should create state directory if it does not exist', () => {
      const pgpmHome = new PgpmHome({ stateDir: tempStateDir });
      const testState = { key: 'value' };
      
      const result = pgpmHome.writeState(testState);
      
      expect(result).toBe(true);
      expect(fs.existsSync(tempStateDir)).toBe(true);
    });

    it('should return false on write error', () => {
      const pgpmHome = new PgpmHome({ stateDir: tempStateDir });
      
      jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {
        throw new Error('Write error');
      });
      
      const result = pgpmHome.writeState({ key: 'value' });
      expect(result).toBe(false);
    });

    it('should not throw on permission errors', () => {
      const pgpmHome = new PgpmHome({ stateDir: tempStateDir });
      
      jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {
        throw new Error('EACCES: permission denied');
      });
      
      expect(() => pgpmHome.writeState({ key: 'value' })).not.toThrow();
      expect(pgpmHome.writeState({ key: 'value' })).toBe(false);
    });
  });

  describe('updateState()', () => {
    it('should update existing state', () => {
      const pgpmHome = new PgpmHome({ stateDir: tempStateDir });
      const initialState = { key1: 'value1', key2: 'value2' };
      pgpmHome.writeState(initialState);
      
      const result = pgpmHome.updateState({ key2: 'updated', key3: 'new' });
      
      expect(result).toBe(true);
      
      const state = pgpmHome.readState();
      expect(state).toEqual({
        key1: 'value1',
        key2: 'updated',
        key3: 'new'
      });
    });

    it('should create state if it does not exist', () => {
      const pgpmHome = new PgpmHome({ stateDir: tempStateDir });
      
      const result = pgpmHome.updateState({ key: 'value' });
      
      expect(result).toBe(true);
      
      const state = pgpmHome.readState();
      expect(state).toEqual({ key: 'value' });
    });

    it('should return false on error', () => {
      const pgpmHome = new PgpmHome({ stateDir: tempStateDir });
      
      jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {
        throw new Error('Write error');
      });
      
      const result = pgpmHome.updateState({ key: 'value' });
      expect(result).toBe(false);
    });
  });

  describe('get()', () => {
    it('should return value for existing key', () => {
      const pgpmHome = new PgpmHome({ stateDir: tempStateDir });
      pgpmHome.writeState({ key1: 'value1', key2: 42 });
      
      expect(pgpmHome.get('key1')).toBe('value1');
      expect(pgpmHome.get('key2')).toBe(42);
    });

    it('should return null for non-existing key', () => {
      const pgpmHome = new PgpmHome({ stateDir: tempStateDir });
      pgpmHome.writeState({ key1: 'value1' });
      
      expect(pgpmHome.get('key2')).toBeNull();
    });

    it('should return null when state file does not exist', () => {
      const pgpmHome = new PgpmHome({ stateDir: tempStateDir });
      
      expect(pgpmHome.get('key')).toBeNull();
    });

    it('should return null on error', () => {
      const pgpmHome = new PgpmHome({ stateDir: tempStateDir });
      
      jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
        throw new Error('Read error');
      });
      
      expect(pgpmHome.get('key')).toBeNull();
    });
  });

  describe('initialize()', () => {
    it('should create directory and initialize state file', () => {
      const pgpmHome = new PgpmHome({ stateDir: tempStateDir });
      
      const result = pgpmHome.initialize();
      
      expect(result.dirCreated).toBe(true);
      expect(result.stateInitialized).toBe(true);
      
      expect(fs.existsSync(tempStateDir)).toBe(true);
      
      const statePath = path.join(tempStateDir, 'state.json');
      expect(fs.existsSync(statePath)).toBe(true);
      
      const state = pgpmHome.readState();
      expect(state).toHaveProperty('created');
      expect(state).toHaveProperty('version');
      expect(state?.version).toBe('1.0.0');
    });

    it('should not overwrite existing state file', () => {
      const pgpmHome = new PgpmHome({ stateDir: tempStateDir });
      const existingState = { custom: 'data', version: '2.0.0' };
      pgpmHome.writeState(existingState);
      
      const result = pgpmHome.initialize();
      
      expect(result.dirCreated).toBe(true);
      expect(result.stateInitialized).toBe(true);
      
      const state = pgpmHome.readState();
      expect(state).toEqual(existingState);
    });

    it('should handle directory creation failure gracefully', () => {
      const pgpmHome = new PgpmHome({ stateDir: tempStateDir });
      
      jest.spyOn(fs, 'mkdirSync').mockImplementation(() => {
        throw new Error('Permission denied');
      });
      
      const result = pgpmHome.initialize();
      
      expect(result.dirCreated).toBe(false);
      expect(result.stateInitialized).toBe(false);
    });
  });

  describe('Integration: Full workflow', () => {
    it('should support complete read-write-update cycle', () => {
      const pgpmHome = new PgpmHome({ stateDir: tempStateDir });
      
      const initResult = pgpmHome.initialize();
      expect(initResult.dirCreated).toBe(true);
      expect(initResult.stateInitialized).toBe(true);
      
      let state = pgpmHome.readState();
      expect(state).toHaveProperty('created');
      expect(state).toHaveProperty('version');
      
      const updateResult = pgpmHome.updateState({
        lastRun: '2025-11-16T00:00:00Z',
        runCount: 1
      });
      expect(updateResult).toBe(true);
      
      state = pgpmHome.readState();
      expect(state?.lastRun).toBe('2025-11-16T00:00:00Z');
      expect(state?.runCount).toBe(1);
      expect(state?.version).toBe('1.0.0');
      
      const runCount = pgpmHome.get('runCount');
      expect(runCount).toBe(1);
      
      pgpmHome.updateState({ runCount: 2 });
      expect(pgpmHome.get('runCount')).toBe(2);
    });

    it('should work with default stateDir', () => {
      const pgpmHome = new PgpmHome();
      
      pgpmHome.initialize();
      pgpmHome.updateState({ test: 'value' });
      
      expect(pgpmHome.get('test')).toBe('value');
      expect(pgpmHome.getStateDir()).toBe(path.join(tempHome, '.pgpm'));
    });
  });
});
