import fs from 'fs';
import os from 'os';
import path from 'path';

import {
  ensurePgpmHome,
  getPgpmHomePath,
  getPgpmStateFilePath,
  getPgpmStateValue,
  initializePgpmHome,
  pgpmHomeExists,
  readPgpmState,
  updatePgpmState,
  writePgpmState
} from '../src/utils/pgpm-home';

describe('PGPM Home Directory', () => {
  let originalHome: string;
  let tempHome: string;

  beforeEach(() => {
    originalHome = os.homedir();
    
    tempHome = fs.mkdtempSync(path.join(os.tmpdir(), 'pgpm-home-test-'));
    
    jest.spyOn(os, 'homedir').mockReturnValue(tempHome);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    
    if (fs.existsSync(tempHome)) {
      fs.rmSync(tempHome, { recursive: true, force: true });
    }
  });

  describe('getPgpmHomePath', () => {
    it('should return path to .pgpm directory in home', () => {
      const pgpmPath = getPgpmHomePath();
      expect(pgpmPath).toBe(path.join(tempHome, '.pgpm'));
    });

    it('should return null if homedir fails', () => {
      jest.spyOn(os, 'homedir').mockImplementation(() => {
        throw new Error('No home directory');
      });
      
      const pgpmPath = getPgpmHomePath();
      expect(pgpmPath).toBeNull();
    });
  });

  describe('getPgpmStateFilePath', () => {
    it('should return path to state.json file', () => {
      const statePath = getPgpmStateFilePath();
      expect(statePath).toBe(path.join(tempHome, '.pgpm', 'state.json'));
    });

    it('should return null if homedir fails', () => {
      jest.spyOn(os, 'homedir').mockImplementation(() => {
        throw new Error('No home directory');
      });
      
      const statePath = getPgpmStateFilePath();
      expect(statePath).toBeNull();
    });
  });

  describe('pgpmHomeExists', () => {
    it('should return false when .pgpm does not exist', () => {
      expect(pgpmHomeExists()).toBe(false);
    });

    it('should return true when .pgpm exists', () => {
      const pgpmPath = path.join(tempHome, '.pgpm');
      fs.mkdirSync(pgpmPath);
      
      expect(pgpmHomeExists()).toBe(true);
    });

    it('should return false on error', () => {
      jest.spyOn(os, 'homedir').mockImplementation(() => {
        throw new Error('No home directory');
      });
      
      expect(pgpmHomeExists()).toBe(false);
    });
  });

  describe('ensurePgpmHome', () => {
    it('should create .pgpm directory if it does not exist', () => {
      const result = ensurePgpmHome();
      
      expect(result).toBe(true);
      expect(fs.existsSync(path.join(tempHome, '.pgpm'))).toBe(true);
    });

    it('should return true if .pgpm already exists', () => {
      const pgpmPath = path.join(tempHome, '.pgpm');
      fs.mkdirSync(pgpmPath);
      
      const result = ensurePgpmHome();
      
      expect(result).toBe(true);
      expect(fs.existsSync(pgpmPath)).toBe(true);
    });

    it('should return false on creation failure', () => {
      jest.spyOn(os, 'homedir').mockImplementation(() => {
        throw new Error('No home directory');
      });
      
      const result = ensurePgpmHome();
      expect(result).toBe(false);
    });

    it('should not throw on permission errors', () => {
      jest.spyOn(fs, 'mkdirSync').mockImplementation(() => {
        throw new Error('EACCES: permission denied');
      });
      
      expect(() => ensurePgpmHome()).not.toThrow();
      expect(ensurePgpmHome()).toBe(false);
    });
  });

  describe('readPgpmState', () => {
    it('should return null when state file does not exist', () => {
      const state = readPgpmState();
      expect(state).toBeNull();
    });

    it('should read state from state.json file', () => {
      const pgpmPath = path.join(tempHome, '.pgpm');
      fs.mkdirSync(pgpmPath);
      
      const testState = { key: 'value', count: 42 };
      fs.writeFileSync(
        path.join(pgpmPath, 'state.json'),
        JSON.stringify(testState)
      );
      
      const state = readPgpmState();
      expect(state).toEqual(testState);
    });

    it('should return null on read error', () => {
      jest.spyOn(os, 'homedir').mockImplementation(() => {
        throw new Error('No home directory');
      });
      
      const state = readPgpmState();
      expect(state).toBeNull();
    });

    it('should return null on invalid JSON', () => {
      const pgpmPath = path.join(tempHome, '.pgpm');
      fs.mkdirSync(pgpmPath);
      fs.writeFileSync(path.join(pgpmPath, 'state.json'), 'invalid json');
      
      const state = readPgpmState();
      expect(state).toBeNull();
    });
  });

  describe('writePgpmState', () => {
    it('should write state to state.json file', () => {
      const testState = { key: 'value', count: 42 };
      const result = writePgpmState(testState);
      
      expect(result).toBe(true);
      
      const statePath = path.join(tempHome, '.pgpm', 'state.json');
      expect(fs.existsSync(statePath)).toBe(true);
      
      const content = JSON.parse(fs.readFileSync(statePath, 'utf-8'));
      expect(content).toEqual(testState);
    });

    it('should create .pgpm directory if it does not exist', () => {
      const testState = { key: 'value' };
      const result = writePgpmState(testState);
      
      expect(result).toBe(true);
      expect(fs.existsSync(path.join(tempHome, '.pgpm'))).toBe(true);
    });

    it('should return false on write error', () => {
      jest.spyOn(os, 'homedir').mockImplementation(() => {
        throw new Error('No home directory');
      });
      
      const result = writePgpmState({ key: 'value' });
      expect(result).toBe(false);
    });

    it('should not throw on permission errors', () => {
      jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {
        throw new Error('EACCES: permission denied');
      });
      
      expect(() => writePgpmState({ key: 'value' })).not.toThrow();
      expect(writePgpmState({ key: 'value' })).toBe(false);
    });
  });

  describe('updatePgpmState', () => {
    it('should update existing state', () => {
      const initialState = { key1: 'value1', key2: 'value2' };
      writePgpmState(initialState);
      
      const result = updatePgpmState({ key2: 'updated', key3: 'new' });
      
      expect(result).toBe(true);
      
      const state = readPgpmState();
      expect(state).toEqual({
        key1: 'value1',
        key2: 'updated',
        key3: 'new'
      });
    });

    it('should create state if it does not exist', () => {
      const result = updatePgpmState({ key: 'value' });
      
      expect(result).toBe(true);
      
      const state = readPgpmState();
      expect(state).toEqual({ key: 'value' });
    });

    it('should return false on error', () => {
      jest.spyOn(os, 'homedir').mockImplementation(() => {
        throw new Error('No home directory');
      });
      
      const result = updatePgpmState({ key: 'value' });
      expect(result).toBe(false);
    });
  });

  describe('getPgpmStateValue', () => {
    it('should return value for existing key', () => {
      writePgpmState({ key1: 'value1', key2: 42 });
      
      expect(getPgpmStateValue('key1')).toBe('value1');
      expect(getPgpmStateValue('key2')).toBe(42);
    });

    it('should return null for non-existing key', () => {
      writePgpmState({ key1: 'value1' });
      
      expect(getPgpmStateValue('key2')).toBeNull();
    });

    it('should return null when state file does not exist', () => {
      expect(getPgpmStateValue('key')).toBeNull();
    });

    it('should return null on error', () => {
      jest.spyOn(os, 'homedir').mockImplementation(() => {
        throw new Error('No home directory');
      });
      
      expect(getPgpmStateValue('key')).toBeNull();
    });
  });

  describe('initializePgpmHome', () => {
    it('should create directory and initialize state file', () => {
      const result = initializePgpmHome();
      
      expect(result.dirCreated).toBe(true);
      expect(result.stateInitialized).toBe(true);
      
      const pgpmPath = path.join(tempHome, '.pgpm');
      expect(fs.existsSync(pgpmPath)).toBe(true);
      
      const statePath = path.join(pgpmPath, 'state.json');
      expect(fs.existsSync(statePath)).toBe(true);
      
      const state = readPgpmState();
      expect(state).toHaveProperty('created');
      expect(state).toHaveProperty('version');
      expect(state?.version).toBe('1.0.0');
    });

    it('should not overwrite existing state file', () => {
      const existingState = { custom: 'data', version: '2.0.0' };
      writePgpmState(existingState);
      
      const result = initializePgpmHome();
      
      expect(result.dirCreated).toBe(true);
      expect(result.stateInitialized).toBe(true);
      
      const state = readPgpmState();
      expect(state).toEqual(existingState);
    });

    it('should handle directory creation failure gracefully', () => {
      jest.spyOn(os, 'homedir').mockImplementation(() => {
        throw new Error('No home directory');
      });
      
      const result = initializePgpmHome();
      
      expect(result.dirCreated).toBe(false);
      expect(result.stateInitialized).toBe(false);
    });
  });

  describe('Integration: Full workflow', () => {
    it('should support complete read-write-update cycle', () => {
      const initResult = initializePgpmHome();
      expect(initResult.dirCreated).toBe(true);
      expect(initResult.stateInitialized).toBe(true);
      
      let state = readPgpmState();
      expect(state).toHaveProperty('created');
      expect(state).toHaveProperty('version');
      
      const updateResult = updatePgpmState({
        lastRun: '2025-11-16T00:00:00Z',
        runCount: 1
      });
      expect(updateResult).toBe(true);
      
      state = readPgpmState();
      expect(state?.lastRun).toBe('2025-11-16T00:00:00Z');
      expect(state?.runCount).toBe(1);
      expect(state?.version).toBe('1.0.0');
      
      const runCount = getPgpmStateValue('runCount');
      expect(runCount).toBe(1);
      
      updatePgpmState({ runCount: 2 });
      expect(getPgpmStateValue('runCount')).toBe(2);
    });
  });
});
