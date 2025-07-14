import { join } from 'path';
import { writeFileSync, mkdirSync, rmSync } from 'fs';
import {
  parseConfigFile,
  parseConfigContent,
  getConfigValue,
  getConfigSection,
  hasConfigSection
} from '../src';
import { ConfigFile } from '../src/types';

describe('Config Parser', () => {
  const testDir = join(__dirname, 'test-configs');

  beforeAll(() => {
    mkdirSync(testDir, { recursive: true });
  });

  afterAll(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  describe('parseConfigFile', () => {
    it('should parse a simple config file', () => {
      const configContent = `[core]
    engine = pg
    plan_file = launchql.plan
    top_dir = .

[engine "pg"]
    target = db:pg://localhost/mydb
    registry = sqitch
    client = psql`;

      const configPath = join(testDir, 'simple.conf');
      writeFileSync(configPath, configContent);

      const result = parseConfigFile(configPath);
      
      expect(result.errors).toHaveLength(0);
      expect(result.data).toBeDefined();
      expect(result.data).toHaveProperty('core');
      expect(result.data).toHaveProperty('engine "pg"');
      expect(result.data!.core.engine).toBe('pg');
      expect(result.data!['engine "pg"'].target).toBe('db:pg://localhost/mydb');
    });

    it('should handle comments and empty lines', () => {
      const configContent = `# This is a comment
[core]
    # Another comment
    engine = pg
    
    plan_file = launchql.plan

# Section comment
[deploy]
    verify = true`;

      const configPath = join(testDir, 'with-comments.conf');
      writeFileSync(configPath, configContent);

      const result = parseConfigFile(configPath);
      
      expect(result.errors).toHaveLength(0);
      expect(result.data!.core.engine).toBe('pg');
      expect(result.data!.deploy.verify).toBe('true');
    });

    it('should report errors for multi-line values', () => {
      const configContent = `[core]
    engine = pg
    
[notes]
    add = This is a long \\
          multi-line \\
          value that continues`;

      const configPath = join(testDir, 'multiline.conf');
      writeFileSync(configPath, configContent);

      const result = parseConfigFile(configPath);
      
      // Multi-line values are not supported
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0].message).toContain('Invalid line format');
    });

    it('should report errors for invalid syntax', () => {
      const configContent = `[core]
    engine = pg
    
invalid line without equals
    
[deploy]
    verify = true`;

      const configPath = join(testDir, 'invalid.conf');
      writeFileSync(configPath, configContent);

      const result = parseConfigFile(configPath);
      
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].line).toBe(4);
    });
  });

  describe('parseConfigContent', () => {
    it('should parse config content directly', () => {
      const configContent = `[core]
    engine = pg
    plan_file = launchql.plan`;

      const result = parseConfigContent(configContent);
      
      expect(result.errors).toHaveLength(0);
      expect(result.data!.core.engine).toBe('pg');
    });
  });

  describe('getConfigValue', () => {
    const config: ConfigFile = {
      core: {
        engine: 'pg',
        plan_file: 'launchql.plan'
      },
      'engine "pg"': {
        target: 'db:pg://localhost/mydb',
        registry: 'sqitch'
      }
    };

    it('should get values from simple sections', () => {
      expect(getConfigValue(config, 'core', 'engine')).toBe('pg');
      expect(getConfigValue(config, 'core', 'plan_file')).toBe('launchql.plan');
    });

    it('should get values from quoted sections', () => {
      expect(getConfigValue(config, 'engine "pg"', 'target')).toBe('db:pg://localhost/mydb');
      expect(getConfigValue(config, 'engine "pg"', 'registry')).toBe('sqitch');
    });

    it('should return undefined for non-existent values', () => {
      expect(getConfigValue(config, 'core', 'nonexistent')).toBeUndefined();
      expect(getConfigValue(config, 'nonexistent', 'key')).toBeUndefined();
    });
  });

  describe('getConfigSection', () => {
    const config: ConfigFile = {
      core: {
        engine: 'pg',
        plan_file: 'launchql.plan'
      },
      deploy: {
        verify: 'true',
        mode: 'strict'
      }
    };

    it('should get entire sections', () => {
      const coreSection = getConfigSection(config, 'core');
      expect(coreSection).toEqual({
        engine: 'pg',
        plan_file: 'launchql.plan'
      });
    });

    it('should return undefined for non-existent sections', () => {
      expect(getConfigSection(config, 'nonexistent')).toBeUndefined();
    });
  });

  describe('hasConfigSection', () => {
    const config: ConfigFile = {
      core: { engine: 'pg' },
      deploy: { verify: 'true' }
    };

    it('should check if sections exist', () => {
      expect(hasConfigSection(config, 'core')).toBe(true);
      expect(hasConfigSection(config, 'deploy')).toBe(true);
      expect(hasConfigSection(config, 'nonexistent')).toBe(false);
    });
  });

  describe('Complex config scenarios', () => {
    it('should handle all sqitch config options', () => {
      const configContent = `[core]
    engine = pg
    plan_file = launchql.plan
    top_dir = .
    deploy_dir = deploy
    revert_dir = revert
    verify_dir = verify
    extension = sql

[engine "pg"]
    target = db:pg://localhost/mydb
    registry = sqitch
    client = psql

[deploy]
    verify = true
    mode = tag

[revert]
    prompt_accept = true

[target "production"]
    uri = db:pg://prod.example.com/mydb

[user]
    name = Developer
    email = dev@example.com`;

      const result = parseConfigContent(configContent);
      
      expect(result.errors).toHaveLength(0);
      expect(Object.keys(result.data!)).toHaveLength(6);
      expect(result.data!.core.engine).toBe('pg');
      expect(result.data!['engine "pg"'].client).toBe('psql');
      expect(result.data!.deploy.verify).toBe('true');
      expect(result.data!.revert.prompt_accept).toBe('true');
      expect(result.data!['target "production"'].uri).toBe('db:pg://prod.example.com/mydb');
      expect(result.data!.user.email).toBe('dev@example.com');
    });
  });
});