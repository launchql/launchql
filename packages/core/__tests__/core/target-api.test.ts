import { LaunchQLPackage } from '../../src/core/class/launchql';
import { parseTarget } from '../../src/utils/target-utils';
import { TestFixture } from '../../test-utils';

describe('LaunchQLPackage Target API', () => {
  let fixture: TestFixture;

  beforeAll(() => {
    fixture = new TestFixture('sqitch');
  });

  afterAll(() => {
    fixture.cleanup();
  });

  describe('parseTarget utility function', () => {
    test('parses project-only target format', () => {
      const result = parseTarget('secrets');
      expect(result).toEqual({
        packageName: 'secrets',
        toChange: undefined
      });
    });

    test('parses project:change target format', () => {
      const result = parseTarget('secrets:procedures/secretfunction');
      expect(result).toEqual({
        packageName: 'secrets',
        toChange: 'procedures/secretfunction'
      });
    });

    test('parses project:@tag target format', () => {
      const result = parseTarget('secrets:@v1.0.0');
      expect(result).toEqual({
        packageName: 'secrets',
        toChange: '@v1.0.0'
      });
    });

    test('throws error for empty target', () => {
      expect(() => parseTarget('')).toThrow('Target parameter is required');
    });

    test('throws error for invalid tag format', () => {
      expect(() => parseTarget('secrets:@')).toThrow('Invalid tag name: secrets:@. Expected format: package:@tagName');
    });

    test('throws error for invalid change format', () => {
      expect(() => parseTarget('secrets:')).toThrow('Invalid change name: secrets:. Expected format: package:changeName');
    });

    test('throws error for invalid format with multiple colons', () => {
      expect(() => parseTarget('secrets:change:extra')).toThrow('Invalid change name: secrets:change:extra. Expected formats: package, package:changeName, or package:@tagName');
    });

    test('throws error for multi-colon tag format', () => {
      expect(() => parseTarget('my-third:my-first:@v1.0.0')).toThrow('Invalid change name: my-third:my-first:@v1.0.0. Expected formats: package, package:changeName, or package:@tagName');
    });
  });

  describe('deploy method with target parameter', () => {
    let project: LaunchQLPackage;
    beforeEach(() => {
      const fixturePath = fixture.getFixturePath('launchql');
      project = new LaunchQLPackage(fixturePath);
    });

    test('deploys with project-only target', async () => {
      const mockDeploy = jest.spyOn(project as any, 'deploy');
      mockDeploy.mockImplementation(async (opts, target) => {
        expect(target).toBe('secrets');
      });

      await project.deploy({} as any, 'secrets');
      expect(mockDeploy).toHaveBeenCalled();
      mockDeploy.mockRestore();
    });

    test('deploys with project:change target', async () => {
      const mockDeploy = jest.spyOn(project as any, 'deploy');
      mockDeploy.mockImplementation(async (opts, target) => {
        expect(target).toBe('secrets:procedures/secretfunction');
      });

      await project.deploy({} as any, 'secrets:procedures/secretfunction');
      expect(mockDeploy).toHaveBeenCalled();
      mockDeploy.mockRestore();
    });

    test('deploys with project:@tag target', async () => {
      const mockDeploy = jest.spyOn(project as any, 'deploy');
      mockDeploy.mockImplementation(async (opts, target) => {
        expect(target).toBe('secrets:@v1.0.0');
      });

      await project.deploy({} as any, 'secrets:@v1.0.0');
      expect(mockDeploy).toHaveBeenCalled();
      mockDeploy.mockRestore();
    });
  });

  describe('revert method with target parameter', () => {
    let project: LaunchQLPackage;

    beforeEach(() => {
      const fixturePath = fixture.getFixturePath('launchql');
      project = new LaunchQLPackage(fixturePath);
    });

    test('reverts with project-only target', async () => {
      const mockRevert = jest.spyOn(project as any, 'revert');
      mockRevert.mockImplementation(async (opts, target) => {
        expect(target).toBe('secrets');
      });

      await project.revert({} as any, 'secrets');
      expect(mockRevert).toHaveBeenCalled();
      mockRevert.mockRestore();
    });

    test('reverts with project:change target', async () => {
      const mockRevert = jest.spyOn(project as any, 'revert');
      mockRevert.mockImplementation(async (opts, target) => {
        expect(target).toBe('secrets:procedures/secretfunction');
      });

      await project.revert({} as any, 'secrets:procedures/secretfunction');
      expect(mockRevert).toHaveBeenCalled();
      mockRevert.mockRestore();
    });

    test('reverts with project:@tag target', async () => {
      const mockRevert = jest.spyOn(project as any, 'revert');
      mockRevert.mockImplementation(async (opts, target) => {
        expect(target).toBe('secrets:@v1.0.0');
      });

      await project.revert({} as any, 'secrets:@v1.0.0');
      expect(mockRevert).toHaveBeenCalled();
      mockRevert.mockRestore();
    });
  });

  describe('verify method with target parameter', () => {
    let project: LaunchQLPackage;

    beforeEach(() => {
      const fixturePath = fixture.getFixturePath('launchql');
      project = new LaunchQLPackage(fixturePath);
    });

    test('verifies with project-only target', async () => {
      const mockVerify = jest.spyOn(project as any, 'verify');
      mockVerify.mockImplementation(async (opts, target) => {
        expect(target).toBe('secrets');
      });

      await project.verify({} as any, 'secrets');
      expect(mockVerify).toHaveBeenCalled();
      mockVerify.mockRestore();
    });

    test('verifies with project:change target', async () => {
      const mockVerify = jest.spyOn(project as any, 'verify');
      mockVerify.mockImplementation(async (opts, target) => {
        expect(target).toBe('secrets:procedures/secretfunction');
      });

      await project.verify({} as any, 'secrets:procedures/secretfunction');
      expect(mockVerify).toHaveBeenCalled();
      mockVerify.mockRestore();
    });

    test('verifies with project:@tag target', async () => {
      const mockVerify = jest.spyOn(project as any, 'verify');
      mockVerify.mockImplementation(async (opts, target) => {
        expect(target).toBe('secrets:@v1.0.0');
      });

      await project.verify({} as any, 'secrets:@v1.0.0');
      expect(mockVerify).toHaveBeenCalled();
      mockVerify.mockRestore();
    });
  });

  describe('backward compatibility', () => {
    let project: LaunchQLPackage;

    beforeEach(() => {
      const fixturePath = fixture.getFixturePath('launchql');
      project = new LaunchQLPackage(fixturePath);
    });

    test('deploy works without target parameter (uses context)', async () => {
      const mockDeploy = jest.spyOn(project as any, 'deploy');
      mockDeploy.mockImplementation(async (opts, target) => {
        expect(target).toBeUndefined();
      });

      await project.deploy({} as any, undefined);
      expect(mockDeploy).toHaveBeenCalled();
      mockDeploy.mockRestore();
    });

    test('revert works without target parameter (uses context)', async () => {
      const mockRevert = jest.spyOn(project as any, 'revert');
      mockRevert.mockImplementation(async (opts, target) => {
        expect(target).toBeUndefined();
      });

      await project.revert({} as any, undefined);
      expect(mockRevert).toHaveBeenCalled();
      mockRevert.mockRestore();
    });

    test('verify works without target parameter (uses context)', async () => {
      const mockVerify = jest.spyOn(project as any, 'verify');
      mockVerify.mockImplementation(async (opts, target) => {
        expect(target).toBeUndefined();
      });

      await project.verify({} as any, undefined);
      expect(mockVerify).toHaveBeenCalled();
      mockVerify.mockRestore();
    });
  });
});
