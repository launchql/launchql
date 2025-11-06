// @ts-nocheck
// TODO: Fix TypeScript module resolution issue with @launchql/templatizer
// TypeScript compiler cannot resolve exports from templatizer package even though
// the type definitions are correctly generated. This is a known issue that needs
// to be resolved. Runtime behavior works correctly.
import { loadTemplates, type TemplateSource } from '@launchql/templatizer';
import { join } from 'path';

describe('Template loading', () => {
  describe('local path templates', () => {
    it('loads workspace templates from local path', () => {
      const source: TemplateSource = {
        type: 'local',
        path: join(__dirname, '../../../boilerplates/workspace'),
      };

      const templates = loadTemplates(source, 'workspace');
      expect(templates.length).toBeGreaterThan(0);
    });

    it('loads module templates from local path', () => {
      const source: TemplateSource = {
        type: 'local',
        path: join(__dirname, '../../../boilerplates/module'),
      };

      const templates = loadTemplates(source, 'module');
      expect(templates.length).toBeGreaterThan(0);
    });

    it('loads templates from boilerplates root directory', () => {
      const source: TemplateSource = {
        type: 'local',
        path: join(__dirname, '../../../boilerplates'),
      };

      const templates = loadTemplates(source, 'workspace');
      expect(templates.length).toBeGreaterThan(0);
    });

    it('handles invalid local path', () => {
      const source: TemplateSource = {
        type: 'local',
        path: '/nonexistent/path',
      };

      expect(() => {
        loadTemplates(source, 'workspace');
      }).toThrow();
    });

    it('handles invalid template type in local path', () => {
      const source: TemplateSource = {
        type: 'local',
        path: join(__dirname, '../../../boilerplates'),
      };

      expect(() => {
        loadTemplates(source, 'nonexistent' as 'workspace');
      }).toThrow();
    });
  });

  describe('GitHub repository templates', () => {
    // Skip GitHub tests in CI unless network access is explicitly allowed
    const shouldSkipGitHubTests =
      process.env.CI === 'true' && !process.env.ALLOW_NETWORK_TESTS;

    (shouldSkipGitHubTests ? it.skip : it)(
      'loads workspace templates from GitHub repository',
      () => {
        const source: TemplateSource = {
          type: 'github',
          path: 'launchql/launchql',
        };

        const templates = loadTemplates(source, 'workspace');
        expect(templates.length).toBeGreaterThan(0);
      },
      30000 // Increase timeout for network operations
    );

    (shouldSkipGitHubTests ? it.skip : it)(
      'loads module templates from GitHub repository',
      () => {
        const source: TemplateSource = {
          type: 'github',
          path: 'launchql/launchql',
        };

        const templates = loadTemplates(source, 'module');
        expect(templates.length).toBeGreaterThan(0);
      },
      30000
    );

    (shouldSkipGitHubTests ? it.skip : it)(
      'loads templates from specific branch',
      () => {
        const source: TemplateSource = {
          type: 'github',
          path: 'launchql/launchql',
          branch: 'main',
        };

        const templates = loadTemplates(source, 'workspace');
        expect(templates.length).toBeGreaterThan(0);
      },
      30000
    );

    (shouldSkipGitHubTests ? it.skip : it)(
      'handles invalid GitHub repository',
      () => {
        const source: TemplateSource = {
          type: 'github',
          path: 'nonexistent/repo-that-does-not-exist-12345',
        };

        expect(() => {
          loadTemplates(source, 'workspace');
        }).toThrow();
      },
      30000
    );

    (shouldSkipGitHubTests ? it.skip : it)(
      'handles invalid branch',
      () => {
        const source: TemplateSource = {
          type: 'github',
          path: 'launchql/launchql',
          branch: 'nonexistent-branch-12345',
        };

        expect(() => {
          loadTemplates(source, 'workspace');
        }).toThrow();
      },
      30000
    );
  });
});
