import { CLIDeployTestFixture } from '../test-utils';
import fs from 'fs';
import path from 'path';

jest.setTimeout(30000);

describe('CLI Plan Command', () => {
  let fixture: CLIDeployTestFixture;

  afterAll(async () => {
    if (fixture) {
      await fixture.cleanup();
    }
    const { teardownPgPools } = require('pg-cache');
    await teardownPgPools();
  });

  describe('Simple module plan generation', () => {
    beforeAll(async () => {
      fixture = new CLIDeployTestFixture('sqitch', 'simple');
    });

    it('should generate plan for simple module via CLI', async () => {
      const commands = `
        cd packages/my-first
        lql plan
      `;
      
      const results = await fixture.runTerminalCommands(commands, {}, true);
      
      expect(results).toHaveLength(2);
      expect(results[0].type).toBe('cd');
      expect(results[1].type).toBe('cli');
      expect(results[1].result.argv._).toEqual(['plan']);
      
      const planPath = fixture.fixturePath('packages', 'my-first', 'launchql.plan');
      expect(fs.existsSync(planPath)).toBe(true);
      
      const planContent = fs.readFileSync(planPath, 'utf8');
      expect(planContent).toContain('%syntax-version=1.0.0');
      expect(planContent).toContain('%project=my-first');
      expect(planContent).toContain('%uri=my-first');
      expect(planContent).toContain('schema_myfirstapp');
      expect(planContent).toContain('table_users');
      expect(planContent).toContain('table_products');
    });

    it('should generate plan with packages option via CLI', async () => {
      const commands = `
        cd packages/my-first
        lql plan --packages
      `;
      
      const results = await fixture.runTerminalCommands(commands, {}, true);
      
      expect(results).toHaveLength(2);
      expect(results[0].type).toBe('cd');
      expect(results[1].type).toBe('cli');
      expect(results[1].result.argv.packages).toBe(true);
      
      const planPath = fixture.fixturePath('packages', 'my-first', 'launchql.plan');
      const planContent = fs.readFileSync(planPath, 'utf8');
      expect(planContent).toContain('%project=my-first');
    });

    it('should show help when --help flag is used', async () => {
      const commands = `
        cd packages/my-first
        lql plan --help
      `;
      
      const results = await fixture.runTerminalCommands(commands, {}, true);
      
      expect(results).toHaveLength(2);
      expect(results[0].type).toBe('cd');
      expect(results[1].type).toBe('cli');
      expect(results[1].result.argv.help).toBe(true);
    });
  });

  describe('Complex module plan generation', () => {
    beforeAll(async () => {
      fixture = new CLIDeployTestFixture('sqitch', 'launchql');
    });

    it('should generate plan for module with dependencies', async () => {
      const commands = `
        cd packages/secrets
        lql plan --packages
      `;
      
      const results = await fixture.runTerminalCommands(commands, {}, true);
      
      expect(results).toHaveLength(2);
      expect(results[0].type).toBe('cd');
      expect(results[1].type).toBe('cli');
      
      const planPath = fixture.fixturePath('packages', 'secrets', 'launchql.plan');
      expect(fs.existsSync(planPath)).toBe(true);
      
      const planContent = fs.readFileSync(planPath, 'utf8');
      expect(planContent).toContain('%project=secrets');
      expect(planContent).toContain('procedures/secretfunction');
      expect(planContent).toMatch(/\[.*totp:.*\]/);
    });

    it('should generate plan without dependencies when packages=false', async () => {
      const commands = `
        cd packages/secrets
        lql plan
      `;
      
      await fixture.runTerminalCommands(commands, {}, true);
      
      const planPath = fixture.fixturePath('packages', 'secrets', 'launchql.plan');
      const planContent = fs.readFileSync(planPath, 'utf8');
      expect(planContent).toContain('%project=secrets');
      expect(planContent).toContain('procedures/secretfunction');
      expect(planContent).not.toMatch(/\[.*totp:.*\]/);
    });

    it('should generate plan for utils module with dependencies', async () => {
      const commands = `
        cd packages/utils
        lql plan --packages
      `;
      
      await fixture.runTerminalCommands(commands, {}, true);
      
      const planPath = fixture.fixturePath('packages', 'utils', 'launchql.plan');
      const planContent = fs.readFileSync(planPath, 'utf8');
      expect(planContent).toContain('%project=utils');
      expect(planContent).toContain('procedures/myfunction');
      expect(planContent).toMatch(/\[.*totp:.*\]/);
    });
  });

  describe('Tagged module plan generation', () => {
    beforeAll(async () => {
      fixture = new CLIDeployTestFixture('sqitch', 'simple-w-tags');
    });

    it('should generate plan preserving existing tags', async () => {
      const commands = `
        cd packages/my-first
        lql plan --packages
      `;
      
      await fixture.runTerminalCommands(commands, {}, true);
      
      const planPath = fixture.fixturePath('packages', 'my-first', 'launchql.plan');
      const planContent = fs.readFileSync(planPath, 'utf8');
      expect(planContent).toContain('%project=my-first');
      expect(planContent).toContain('@v1.0.0');
      expect(planContent).toContain('First stable release');
    });
  });

  describe('Error cases', () => {
    beforeAll(async () => {
      fixture = new CLIDeployTestFixture('sqitch', 'simple');
    });

    it('should fail when not in a module directory', async () => {
      const commands = `lql plan`;
      
      await expect(
        fixture.runTerminalCommands(commands, {}, true)
      ).rejects.toThrow(/must be run inside a LaunchQL module/);
    });

    it('should handle custom working directory', async () => {
      const commands = `lql plan --cwd packages/my-first`;
      
      const results = await fixture.runTerminalCommands(commands, {}, true);
      
      expect(results).toHaveLength(1);
      expect(results[0].type).toBe('cli');
      expect(results[0].result.argv.cwd).toBe('packages/my-first');
      
      const planPath = fixture.fixturePath('packages', 'my-first', 'launchql.plan');
      expect(fs.existsSync(planPath)).toBe(true);
    });
  });
});
