import { pgpmDefaults, PgpmOptions } from '@pgpmjs/types';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import { getConnEnvOptions, getEnvOptions, getExtensionsDir } from '../src/merge';

const writeConfig = (dir: string, config: Record<string, unknown>): void => {
  fs.writeFileSync(path.join(dir, 'pgpm.json'), JSON.stringify(config, null, 2));
};

describe('getConnEnvOptions', () => {
  describe('roles resolution', () => {
    it('should always return roles with default values when no overrides provided', () => {
      const result = getConnEnvOptions();
      
      expect(result.roles).toBeDefined();
      expect(result.roles?.anonymous).toBe('anonymous');
      expect(result.roles?.authenticated).toBe('authenticated');
      expect(result.roles?.administrator).toBe('administrator');
    });

    it('should preserve default roles even when roles is explicitly undefined in overrides', () => {
      const result = getConnEnvOptions({ roles: undefined });
      
      expect(result.roles).toBeDefined();
      expect(result.roles?.anonymous).toBe('anonymous');
      expect(result.roles?.authenticated).toBe('authenticated');
      expect(result.roles?.administrator).toBe('administrator');
    });

    it('should allow overriding individual role names while preserving others', () => {
      const result = getConnEnvOptions({
        roles: {
          anonymous: 'custom_anon'
        }
      });
      
      expect(result.roles?.anonymous).toBe('custom_anon');
      expect(result.roles?.authenticated).toBe('authenticated');
      expect(result.roles?.administrator).toBe('administrator');
    });

    it('should allow overriding all role names', () => {
      const result = getConnEnvOptions({
        roles: {
          anonymous: 'custom_anon',
          authenticated: 'custom_auth',
          administrator: 'custom_admin'
        }
      });
      
      expect(result.roles?.anonymous).toBe('custom_anon');
      expect(result.roles?.authenticated).toBe('custom_auth');
      expect(result.roles?.administrator).toBe('custom_admin');
    });
  });

  describe('connections resolution', () => {
    it('should always return connections with default values when no overrides provided', () => {
      const result = getConnEnvOptions();
      
      expect(result.connections).toBeDefined();
      expect(result.connections?.app?.user).toBe('app_user');
      expect(result.connections?.app?.password).toBe('app_password');
      expect(result.connections?.admin?.user).toBe('app_admin');
      expect(result.connections?.admin?.password).toBe('admin_password');
    });

    it('should preserve default connections even when connections is explicitly undefined', () => {
      const result = getConnEnvOptions({ connections: undefined });
      
      expect(result.connections).toBeDefined();
      expect(result.connections?.app?.user).toBe('app_user');
      expect(result.connections?.admin?.user).toBe('app_admin');
    });

    it('should allow overriding individual connection properties while preserving others', () => {
      const result = getConnEnvOptions({
        connections: {
          app: {
            user: 'custom_app_user'
          }
        }
      });
      
      expect(result.connections?.app?.user).toBe('custom_app_user');
      expect(result.connections?.app?.password).toBe('app_password');
      expect(result.connections?.admin?.user).toBe('app_admin');
    });
  });

  describe('other properties', () => {
    it('should preserve other db properties from defaults', () => {
      const result = getConnEnvOptions();
      
      expect(result.rootDb).toBe(pgpmDefaults.db?.rootDb);
      expect(result.prefix).toBe(pgpmDefaults.db?.prefix);
    });

    it('should allow overriding other db properties', () => {
      const result = getConnEnvOptions({
        rootDb: 'custom_root',
        prefix: 'custom-'
      });
      
      expect(result.rootDb).toBe('custom_root');
      expect(result.prefix).toBe('custom-');
    });
  });
});

describe('getEnvOptions', () => {
  let tempDir = '';
  type PgpmOptionsWithPackages = PgpmOptions & { packages?: string[] };

  afterEach(() => {
    if (tempDir) {
      fs.rmSync(tempDir, { recursive: true, force: true });
      tempDir = '';
    }
  });

  it('merges defaults, config, env, and overrides', () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pgpm-env-'));
    writeConfig(tempDir, {
      pg: {
        host: 'config-host',
        database: 'config-db'
      },
      server: {
        port: 4000
      },
      db: {
        prefix: 'config-',
        connections: {
          app: {
            user: 'config_app'
          }
        }
      },
      deployment: {
        fast: true
      }
    });

    const testEnv: NodeJS.ProcessEnv = {
      PGHOST: 'env-host',
      PGPORT: '6543',
      PGUSER: 'env-user',
      PGPASSWORD: 'env-pass',
      DB_PREFIX: 'env-',
      DB_CONNECTIONS_APP_PASSWORD: 'env-app-pass',
      DB_CONNECTIONS_ADMIN_USER: 'env-admin-user',
      PORT: '7777',
      DEPLOYMENT_FAST: 'false'
    };

    const result = getEnvOptions(
      {
        db: {
          prefix: 'override-',
          cwd: '<CWD>'
        },
        pg: {
          host: 'override-host'
        },
        server: {
          port: 9999
        },
        deployment: {
          cache: true
        }
      },
      tempDir,
      testEnv
    );

    expect(result).toMatchSnapshot();
  });

  it('replaces array fields with later values (overrides win)', () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pgpm-env-replace-'));
    writeConfig(tempDir, {
      db: {
        extensions: ['uuid', 'postgis']
      },
      packages: ['testing/*', 'packages/*']
    });

    const testEnv: NodeJS.ProcessEnv = {
      DB_EXTENSIONS: 'postgis,pgcrypto'
    };

    const overrides: PgpmOptionsWithPackages = {
      db: {
        extensions: ['uuid', 'hstore']
      },
      packages: ['testing/*', 'extensions/*']
    };

    const result = getEnvOptions(overrides, tempDir, testEnv) as PgpmOptionsWithPackages;

    // Arrays are replaced, not merged - overrides win completely
    expect(result.db?.extensions).toEqual(['uuid', 'hstore']);
    expect(result.packages).toEqual(['testing/*', 'extensions/*']);
  });

  describe('production safety enforcement', () => {
    // Empty cwd so no pgpm.json overrides the dangerous built-in defaults.
    const emptyCwd = (): string =>
      (tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pgpm-env-prod-')));

    it('does not throw for bare defaults outside production', () => {
      expect(() =>
        getEnvOptions({}, emptyCwd(), { NODE_ENV: 'development' })
      ).not.toThrow();
    });

    it('throws in production when secrets/hosts are left at dev defaults (STRICT_ENV=throw)', () => {
      expect(() =>
        getEnvOptions({}, emptyCwd(), { NODE_ENV: 'production', STRICT_ENV: 'throw' })
      ).toThrow(/Unsafe production environment/);
    });

    it('warns (does not throw) in production by default', () => {
      const spy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
      try {
        expect(() =>
          getEnvOptions({}, emptyCwd(), { NODE_ENV: 'production' })
        ).not.toThrow();
        expect(spy).toHaveBeenCalled();
      } finally {
        spy.mockRestore();
      }
    });

    it('does not throw in production when sensitive values are provided via env', () => {
      const safeEnv: NodeJS.ProcessEnv = {
        NODE_ENV: 'production',
        STRICT_ENV: 'throw',
        PGHOST: 'db.internal',
        PGDATABASE: 'appdb',
        PGPASSWORD: 's3cret-pg',
        PGROOTDATABASE: 'app_root',
        SERVER_HOST: '0.0.0.0',
        DB_CONNECTIONS_APP_PASSWORD: 's3cret-app',
        DB_CONNECTIONS_ADMIN_PASSWORD: 's3cret-admin'
      };
      expect(() => getEnvOptions({}, emptyCwd(), safeEnv)).not.toThrow();
    });
  });
});

describe('getExtensionsDir', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pgpm-env-extdir-'));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('defaults to extensions', () => {
    writeConfig(tempDir, {});
    expect(getExtensionsDir(undefined, tempDir, {})).toBe('extensions');
  });

  it('reads extensionsDir from the config file', () => {
    writeConfig(tempDir, { extensionsDir: 'extensions-config' });
    expect(getExtensionsDir(undefined, tempDir, {})).toBe('extensions-config');
  });

  it('prefers PGPM_EXTENSIONS_DIR over the config file', () => {
    writeConfig(tempDir, { extensionsDir: 'extensions-config' });
    expect(
      getExtensionsDir(undefined, tempDir, { PGPM_EXTENSIONS_DIR: 'extensions-env' })
    ).toBe('extensions-env');
  });

  it('prefers an explicit override over env and config', () => {
    writeConfig(tempDir, { extensionsDir: 'extensions-config' });
    expect(
      getExtensionsDir('extensions-opt', tempDir, { PGPM_EXTENSIONS_DIR: 'extensions-env' })
    ).toBe('extensions-opt');
  });
});
