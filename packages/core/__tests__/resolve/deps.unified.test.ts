import { TestFixture } from '../../test-utils';
import { resolveDependencies } from '../../src/deps';

let fixture: TestFixture;

beforeAll(() => {
  fixture = new TestFixture('sqitch');
});

afterAll(() => {
  fixture.cleanup();
});

describe('resolveDependencies with different options', () => {
  describe('tagResolution: preserve (default)', () => {
    it('should behave like original getDeps [simple-w-tags/2nd]', async () => {
      const res = await resolveDependencies(
        fixture.getFixturePath('simple-w-tags', 'packages', 'my-second'),
        'my-second'
      );
      expect(res).toMatchSnapshot();
    });
  });

  describe('tagResolution: resolve', () => {
    it('should resolve tags to their target changes [simple-w-tags/2nd]', async () => {
      const res = await resolveDependencies(
        fixture.getFixturePath('simple-w-tags', 'packages', 'my-second'),
        'my-second',
        { tagResolution: 'resolve' }
      );
      expect(res).toMatchSnapshot();
    });
  });

  describe('tagResolution: internal', () => {
    it('should preserve tags in output but resolve internally [simple-w-tags/2nd]', async () => {
      const res = await resolveDependencies(
        fixture.getFixturePath('simple-w-tags', 'packages', 'my-second'),
        'my-second',
        { tagResolution: 'internal' }
      );
      expect(res).toMatchSnapshot();
    });
  });

  describe('with custom plan loader', () => {
    it('should use custom plan loader when provided', async () => {
      const customLoader = jest.fn().mockReturnValue({
        project: 'my-first',
        changes: [
          { name: 'schema_myapp', note: 'Create schema' },
          { name: 'table_users', note: 'Create users table' },
          { name: 'table_products', note: 'Create products table' }
        ],
        tags: [
          { name: 'v1.0.0', change: 'table_users', note: 'First release' }
        ]
      });

      const res = await resolveDependencies(
        fixture.getFixturePath('simple-w-tags', 'packages', 'my-second'),
        'my-second',
        { 
          tagResolution: 'resolve',
          planFileLoader: customLoader
        }
      );
      
      expect(customLoader).toHaveBeenCalledWith('my-first', 'my-second', expect.any(String));
      expect(res).toMatchSnapshot();
    });
  });

  describe('with loadPlanFiles: false', () => {
    it('should not resolve tags when plan loading is disabled', async () => {
      const res = await resolveDependencies(
        fixture.getFixturePath('simple-w-tags', 'packages', 'my-second'),
        'my-second',
        { 
          tagResolution: 'resolve',
          loadPlanFiles: false
        }
      );
      expect(res).toMatchSnapshot();
    });
  });

  describe('complex scenarios', () => {
    it('should handle all modes correctly [simple-w-tags/3rd]', async () => {
      const packagePath = fixture.getFixturePath('simple-w-tags', 'packages', 'my-third');
      
      const preserveResult = await resolveDependencies(packagePath, 'my-third');
      const resolveResult = await resolveDependencies(packagePath, 'my-third', { tagResolution: 'resolve' });
      const internalResult = await resolveDependencies(packagePath, 'my-third', { tagResolution: 'internal' });
      
      expect({
        preserve: preserveResult,
        resolve: resolveResult,
        internal: internalResult
      }).toMatchSnapshot();
    });
  });
});