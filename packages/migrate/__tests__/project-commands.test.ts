import { deployProject, revertProject, verifyProject, getAvailableModules } from '../src/project-commands';
import { runSqitch } from '../src/sqitch-wrapper';
import { deployCommand } from '../src/commands/deploy';
import * as core from '@launchql/core';

// Mock dependencies
jest.mock('../src/sqitch-wrapper');
jest.mock('../src/commands/deploy');
jest.mock('../src/commands/revert');
jest.mock('../src/commands/verify');
jest.mock('@launchql/core');
jest.mock('pg-env', () => ({
  getPgEnvOptions: jest.fn(() => ({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '',
    database: 'postgres'
  }))
}));

describe('project-commands', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('deployProject', () => {
    it('should handle non-recursive sqitch deployment', async () => {
      await deployProject({
        database: 'testdb',
        cwd: '/test/path',
        recursive: false,
        useSqitch: true
      });

      expect(runSqitch).toHaveBeenCalledWith('deploy', 'testdb', '/test/path');
      expect(deployCommand).not.toHaveBeenCalled();
    });

    it('should handle non-recursive migrate deployment', async () => {
      await deployProject({
        database: 'testdb',
        cwd: '/test/path',
        recursive: false,
        useSqitch: false,
        useTransaction: true
      });

      expect(runSqitch).not.toHaveBeenCalled();
      expect(deployCommand).toHaveBeenCalledWith(
        expect.any(Object),
        'testdb',
        '/test/path',
        { useTransaction: true, toChange: undefined }
      );
    });

    it('should handle recursive deployment', async () => {
      const mockProject = {
        getModuleMap: jest.fn(() => ({
          'test-module': { path: '/test/module/path' }
        }))
      };
      
      (core.LaunchQLProject as jest.Mock).mockImplementation(() => mockProject);
      (core.deploy as jest.Mock).mockResolvedValue(undefined);

      await deployProject({
        database: 'testdb',
        cwd: '/test/path',
        recursive: true,
        projectName: 'test-module',
        useSqitch: true,
        useTransaction: true
      });

      expect(core.deploy).toHaveBeenCalledWith(
        expect.any(Object),
        'test-module',
        'testdb',
        '/test/module/path',
        { useSqitch: true, useTransaction: true }
      );
    });

    it('should throw error if projectName is missing for recursive', async () => {
      await expect(deployProject({
        database: 'testdb',
        cwd: '/test/path',
        recursive: true,
        useSqitch: true
      })).rejects.toThrow('projectName is required when recursive is true');
    });
  });

  describe('getAvailableModules', () => {
    it('should return module names', async () => {
      const mockModules = [
        { getModuleName: () => 'module1' },
        { getModuleName: () => 'module2' }
      ];
      
      const mockProject = {
        getModules: jest.fn().mockResolvedValue(mockModules)
      };
      
      (core.LaunchQLProject as jest.Mock).mockImplementation(() => mockProject);

      const modules = await getAvailableModules('/test/path');
      
      expect(modules).toEqual(['module1', 'module2']);
    });
  });
});