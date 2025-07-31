import { LaunchQLPackage } from '@launchql/core';
import { Logger } from '@launchql/logger';
import { getEnvOptions } from '@launchql/env';
import { getPgEnvOptions } from 'pg-env';
import { jest } from '@jest/globals';

import remove from '../src/commands/remove';
import { getTargetDatabase } from '../src/utils';

jest.mock('@launchql/core');
jest.mock('@launchql/logger');
jest.mock('@launchql/env');
jest.mock('pg-env');
jest.mock('../src/utils');

const mockLaunchQLPackage = LaunchQLPackage as jest.MockedClass<typeof LaunchQLPackage>;
const mockGetTargetDatabase = getTargetDatabase as jest.MockedFunction<typeof getTargetDatabase>;
const mockGetEnvOptions = getEnvOptions as jest.MockedFunction<typeof getEnvOptions>;
const mockGetPgEnvOptions = getPgEnvOptions as jest.MockedFunction<typeof getPgEnvOptions>;

describe('remove command', () => {
  let mockPrompter: any;
  let mockPackageInstance: any;
  let mockLogger: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockPrompter = {
      prompt: jest.fn()
    };
    
    mockPackageInstance = {
      isInModule: jest.fn(),
      removeFromPlan: jest.fn()
    };
    
    mockLogger = {
      info: jest.fn(),
      debug: jest.fn(),
      success: jest.fn(),
      error: jest.fn()
    };
    
    mockLaunchQLPackage.mockImplementation(() => mockPackageInstance);
    (Logger as jest.MockedClass<typeof Logger>).mockImplementation(() => mockLogger);
    mockGetTargetDatabase.mockResolvedValue('test_db');
    mockGetEnvOptions.mockReturnValue({ pg: { database: 'test_db' } });
    mockGetPgEnvOptions.mockReturnValue({ database: 'test_db' } as any);
  });

  test('should handle confirmation and remove all changes when no --to parameter', async () => {
    const argv = {};
    const options = {} as any;
    
    mockPrompter.prompt
      .mockResolvedValueOnce({ yes: true, cwd: '/test/path' });
    
    mockPackageInstance.isInModule.mockReturnValue(true);
    mockPackageInstance.removeFromPlan.mockResolvedValue(undefined);

    const result = await remove(argv, mockPrompter, options);

    expect(mockGetTargetDatabase).toHaveBeenCalledWith(argv, mockPrompter, {
      message: 'Select database'
    });
    
    expect(mockPrompter.prompt).toHaveBeenCalledWith(argv, [
      {
        name: 'yes',
        type: 'confirm',
        message: 'Are you sure you want to proceed with removing changes?',
        required: true
      }
    ]);
    
    expect(mockLaunchQLPackage).toHaveBeenCalledWith('/test/path');
    expect(mockPackageInstance.isInModule).toHaveBeenCalled();
    expect(mockPackageInstance.removeFromPlan).toHaveBeenCalledWith(undefined);
    expect(mockLogger.success).toHaveBeenCalledWith('✅ Successfully removed all changes from plan.');
    expect(result).toBe(argv);
  });

  test('should handle --to parameter and remove changes from specified point', async () => {
    const argv = { to: 'table_users' };
    const options = {} as any;
    
    mockPrompter.prompt
      .mockResolvedValueOnce({ yes: true, cwd: '/test/path' });
    
    mockPackageInstance.isInModule.mockReturnValue(true);
    mockPackageInstance.removeFromPlan.mockResolvedValue(undefined);

    const result = await remove(argv, mockPrompter, options);

    expect(mockPackageInstance.removeFromPlan).toHaveBeenCalledWith('table_users');
    expect(mockLogger.success).toHaveBeenCalledWith("✅ Successfully removed changes from 'table_users' to end of plan.");
    expect(result).toBe(argv);
  });

  test('should cancel operation when user declines confirmation', async () => {
    const argv = {};
    const options = {} as any;
    
    mockPrompter.prompt
      .mockResolvedValueOnce({ yes: false, cwd: '/test/path' });

    const result = await remove(argv, mockPrompter, options);

    expect(mockLogger.info).toHaveBeenCalledWith('Operation cancelled.');
    expect(mockPackageInstance.removeFromPlan).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
  });

  test('should throw error when not in module directory', async () => {
    const argv = {};
    const options = {} as any;
    
    mockPrompter.prompt
      .mockResolvedValueOnce({ yes: true, cwd: '/test/path' });
    
    mockPackageInstance.isInModule.mockReturnValue(false);

    await expect(remove(argv, mockPrompter, options)).rejects.toThrow(
      'Not in a LaunchQL module directory. Please run this command from within a module.'
    );
    
    expect(mockPackageInstance.removeFromPlan).not.toHaveBeenCalled();
  });

  test('should handle removeFromPlan errors gracefully', async () => {
    const argv = { to: 'nonexistent_change' };
    const options = {} as any;
    
    mockPrompter.prompt
      .mockResolvedValueOnce({ yes: true, cwd: '/test/path' });
    
    mockPackageInstance.isInModule.mockReturnValue(true);
    mockPackageInstance.removeFromPlan.mockRejectedValue(new Error("Change 'nonexistent_change' not found in plan"));

    await expect(remove(argv, mockPrompter, options)).rejects.toThrow(
      "Change 'nonexistent_change' not found in plan"
    );
    
    expect(mockPackageInstance.removeFromPlan).toHaveBeenCalledWith('nonexistent_change');
  });

  test('should pass correct options to getEnvOptions and getPgEnvOptions', async () => {
    const argv = {};
    const options = {} as any;
    
    mockPrompter.prompt
      .mockResolvedValueOnce({ yes: true, cwd: '/test/path' });
    
    mockPackageInstance.isInModule.mockReturnValue(true);
    mockPackageInstance.removeFromPlan.mockResolvedValue(undefined);

    await remove(argv, mockPrompter, options);

    expect(mockGetPgEnvOptions).toHaveBeenCalledWith({ database: 'test_db' });
    expect(mockGetEnvOptions).toHaveBeenCalledWith({ 
      pg: { database: 'test_db' }
    });
  });

  test('should handle database selection correctly', async () => {
    const argv = { database: 'custom_db' };
    const options = {} as any;
    
    mockGetTargetDatabase.mockResolvedValue('custom_db');
    mockPrompter.prompt
      .mockResolvedValueOnce({ yes: true, cwd: '/test/path' });
    
    mockPackageInstance.isInModule.mockReturnValue(true);
    mockPackageInstance.removeFromPlan.mockResolvedValue(undefined);

    await remove(argv, mockPrompter, options);

    expect(mockGetTargetDatabase).toHaveBeenCalledWith(argv, mockPrompter, {
      message: 'Select database'
    });
    expect(mockGetPgEnvOptions).toHaveBeenCalledWith({ database: 'custom_db' });
  });

  test('should log debug information about working directory', async () => {
    const argv = {};
    const options = {} as any;
    
    mockPrompter.prompt
      .mockResolvedValueOnce({ yes: true, cwd: '/custom/working/dir' });
    
    mockPackageInstance.isInModule.mockReturnValue(true);
    mockPackageInstance.removeFromPlan.mockResolvedValue(undefined);

    await remove(argv, mockPrompter, options);

    expect(mockLogger.debug).toHaveBeenCalledWith('Using current directory: /custom/working/dir');
    expect(mockLaunchQLPackage).toHaveBeenCalledWith('/custom/working/dir');
  });
});
