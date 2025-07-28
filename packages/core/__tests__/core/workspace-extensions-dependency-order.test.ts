process.env.LAUNCHQL_DEBUG = 'true';

import { LaunchQLProject } from '../../src/core/class/launchql';
import { TestFixture } from '../../test-utils';

let fixture: TestFixture;

beforeAll(() => {
  fixture = new TestFixture('sqitch');
});

afterAll(() => {
  fixture.cleanup();
});

describe('getWorkspaceExtensionsInDependencyOrder', () => {
  describe('with existing fixtures', () => {
    it('returns extensions in dependency order for simple-w-tags workspace', () => {
      const workspacePath = fixture.getFixturePath('simple-w-tags');
      const project = new LaunchQLProject(workspacePath);
      
      const result = project.resolveWorkspaceExtensionDependencies();
      expect(result).toMatchSnapshot();
    });

    it('returns extensions in dependency order for launchql workspace', () => {
      const workspacePath = fixture.getFixturePath('launchql');
      const project = new LaunchQLProject(workspacePath);
      
      const result = project.resolveWorkspaceExtensionDependencies();
      expect(result).toMatchSnapshot();
    });

    it('handles workspace with minimal modules', () => {
      const workspacePath = fixture.getFixturePath('simple');
      const project = new LaunchQLProject(workspacePath);
      
      const result = project.resolveWorkspaceExtensionDependencies();
      expect(result).toMatchSnapshot();
      
      expect(result).toHaveProperty('resolved');
      expect(result).toHaveProperty('external');
    });
  });

  describe('with complex existing fixtures', () => {
    it('returns extensions in dependency order for complex workspace', () => {
      const workspacePath = fixture.getFixturePath('launchql');
      const project = new LaunchQLProject(workspacePath);
      
      const result = project.resolveWorkspaceExtensionDependencies();
      expect(result).toMatchSnapshot();
      
      expect(Array.isArray(result.resolved)).toBe(true);
      expect(Array.isArray(result.external)).toBe(true);
    });

    it('verifies dependency ordering properties', () => {
      const workspacePath = fixture.getFixturePath('simple-w-tags');
      const project = new LaunchQLProject(workspacePath);
      
      const result = project.resolveWorkspaceExtensionDependencies();
      expect(result).toMatchSnapshot();
      
      expect(result).toHaveProperty('resolved');
      expect(result).toHaveProperty('external');
      expect(Array.isArray(result.resolved)).toBe(true);
      expect(Array.isArray(result.external)).toBe(true);
      
      expect(result.resolved.length).toBeGreaterThanOrEqual(0);
      expect(result.external.length).toBeGreaterThanOrEqual(0);
    });

    it('handles different fixture types consistently', () => {
      const workspacePath = fixture.getFixturePath('simple');
      const project = new LaunchQLProject(workspacePath);
      
      const result = project.resolveWorkspaceExtensionDependencies();
      expect(result).toMatchSnapshot();
      
      expect(result.resolved.length).toBeGreaterThan(0);
    });
  });
});
