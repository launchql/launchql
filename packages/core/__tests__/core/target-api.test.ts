import { LaunchQLProject } from '../../src/core/class/launchql';
import { parseTarget } from '../../src/utils/target-utils';
import { TestFixture } from '../../test-utils';

describe('LaunchQLProject Target API', () => {
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
        projectName: 'secrets',
        toChange: undefined
      });
    });

    test('parses project:change target format', () => {
      const result = parseTarget('secrets:procedures/secretfunction');
      expect(result).toEqual({
        projectName: 'secrets',
        toChange: 'procedures/secretfunction'
      });
    });

    test('parses project:@tag target format', () => {
      const result = parseTarget('secrets:@v1.0.0');
      expect(result).toEqual({
        projectName: 'secrets',
        toChange: 'secrets:@v1.0.0'
      });
    });

    test('throws error for empty target', () => {
      expect(() => parseTarget('')).toThrow('Target parameter is required');
    });

    test('throws error for invalid tag format', () => {
      expect(() => parseTarget('secrets:@')).toThrow('Invalid tag format: secrets:@. Expected format: project:@tagName');
    });

    test('throws error for invalid change format', () => {
      expect(() => parseTarget('secrets:')).toThrow('Invalid change format: secrets:. Expected format: project:changeName');
    });

    test('throws error for invalid format with multiple colons', () => {
      expect(() => parseTarget('secrets:change:extra')).toThrow('Invalid target format: secrets:change:extra. Expected formats: project, project:changeName, or project:@tagName');
    });
  });

  describe('deploy method with target parameter', () => {
    let project: LaunchQLProject;
    beforeEach(() => {
      const fixturePath = fixture.getFixturePath('launchql');
      project = new LaunchQLProject(fixturePath);
    });

    test('deploys with project-only target', async () => {
      const mockDeploy = jest.spyOn(project as any, 'deploy');
      mockDeploy.mockImplementation(async (opts, target, recursive) => {
        expect(target).toBe('secrets');
        expect(recursive).toBe(true);
      });

      await project.deploy({} as any, 'secrets', true);
      expect(mockDeploy).toHaveBeenCalled();
      mockDeploy.mockRestore();
    });

    test('deploys with project:change target', async () => {
      const mockDeploy = jest.spyOn(project as any, 'deploy');
      mockDeploy.mockImplementation(async (opts, target, recursive) => {
        expect(target).toBe('secrets:procedures/secretfunction');
        expect(recursive).toBe(true);
      });

      await project.deploy({} as any, 'secrets:procedures/secretfunction', true);
      expect(mockDeploy).toHaveBeenCalled();
      mockDeploy.mockRestore();
    });

    test('deploys with project:@tag target', async () => {
      const mockDeploy = jest.spyOn(project as any, 'deploy');
      mockDeploy.mockImplementation(async (opts, target, recursive) => {
        expect(target).toBe('secrets:@v1.0.0');
        expect(recursive).toBe(true);
      });

      await project.deploy({} as any, 'secrets:@v1.0.0', true);
      expect(mockDeploy).toHaveBeenCalled();
      mockDeploy.mockRestore();
    });
  });

  describe('revert method with target parameter', () => {
    let project: LaunchQLProject;

    beforeEach(() => {
      const fixturePath = fixture.getFixturePath('launchql');
      project = new LaunchQLProject(fixturePath);
    });

    test('reverts with project-only target', async () => {
      const mockRevert = jest.spyOn(project as any, 'revert');
      mockRevert.mockImplementation(async (opts, target, recursive) => {
        expect(target).toBe('secrets');
        expect(recursive).toBe(true);
      });

      await project.revert({} as any, 'secrets', true);
      expect(mockRevert).toHaveBeenCalled();
      mockRevert.mockRestore();
    });

    test('reverts with project:change target', async () => {
      const mockRevert = jest.spyOn(project as any, 'revert');
      mockRevert.mockImplementation(async (opts, target, recursive) => {
        expect(target).toBe('secrets:procedures/secretfunction');
        expect(recursive).toBe(true);
      });

      await project.revert({} as any, 'secrets:procedures/secretfunction', true);
      expect(mockRevert).toHaveBeenCalled();
      mockRevert.mockRestore();
    });

    test('reverts with project:@tag target', async () => {
      const mockRevert = jest.spyOn(project as any, 'revert');
      mockRevert.mockImplementation(async (opts, target, recursive) => {
        expect(target).toBe('secrets:@v1.0.0');
        expect(recursive).toBe(true);
      });

      await project.revert({} as any, 'secrets:@v1.0.0', true);
      expect(mockRevert).toHaveBeenCalled();
      mockRevert.mockRestore();
    });
  });

  describe('verify method with target parameter', () => {
    let project: LaunchQLProject;

    beforeEach(() => {
      const fixturePath = fixture.getFixturePath('launchql');
      project = new LaunchQLProject(fixturePath);
    });

    test('verifies with project-only target', async () => {
      const mockVerify = jest.spyOn(project as any, 'verify');
      mockVerify.mockImplementation(async (opts, target, recursive) => {
        expect(target).toBe('secrets');
        expect(recursive).toBe(true);
      });

      await project.verify({} as any, 'secrets', true);
      expect(mockVerify).toHaveBeenCalled();
      mockVerify.mockRestore();
    });

    test('verifies with project:change target', async () => {
      const mockVerify = jest.spyOn(project as any, 'verify');
      mockVerify.mockImplementation(async (opts, target, recursive) => {
        expect(target).toBe('secrets:procedures/secretfunction');
        expect(recursive).toBe(true);
      });

      await project.verify({} as any, 'secrets:procedures/secretfunction', true);
      expect(mockVerify).toHaveBeenCalled();
      mockVerify.mockRestore();
    });

    test('verifies with project:@tag target', async () => {
      const mockVerify = jest.spyOn(project as any, 'verify');
      mockVerify.mockImplementation(async (opts, target, recursive) => {
        expect(target).toBe('secrets:@v1.0.0');
        expect(recursive).toBe(true);
      });

      await project.verify({} as any, 'secrets:@v1.0.0', true);
      expect(mockVerify).toHaveBeenCalled();
      mockVerify.mockRestore();
    });
  });

  describe('backward compatibility', () => {
    let project: LaunchQLProject;

    beforeEach(() => {
      const fixturePath = fixture.getFixturePath('launchql');
      project = new LaunchQLProject(fixturePath);
    });

    test('deploy works without target parameter (uses context)', async () => {
      const mockDeploy = jest.spyOn(project as any, 'deploy');
      mockDeploy.mockImplementation(async (opts, target, recursive) => {
        expect(target).toBeUndefined();
        expect(recursive).toBe(true);
      });

      await project.deploy({} as any, undefined, true);
      expect(mockDeploy).toHaveBeenCalled();
      mockDeploy.mockRestore();
    });

    test('revert works without target parameter (uses context)', async () => {
      const mockRevert = jest.spyOn(project as any, 'revert');
      mockRevert.mockImplementation(async (opts, target, recursive) => {
        expect(target).toBeUndefined();
        expect(recursive).toBe(true);
      });

      await project.revert({} as any, undefined, true);
      expect(mockRevert).toHaveBeenCalled();
      mockRevert.mockRestore();
    });

    test('verify works without target parameter (uses context)', async () => {
      const mockVerify = jest.spyOn(project as any, 'verify');
      mockVerify.mockImplementation(async (opts, target, recursive) => {
        expect(target).toBeUndefined();
        expect(recursive).toBe(true);
      });

      await project.verify({} as any, undefined, true);
      expect(mockVerify).toHaveBeenCalled();
      mockVerify.mockRestore();
    });
  });
});
