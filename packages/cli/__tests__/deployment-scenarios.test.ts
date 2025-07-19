import { TestFixture } from '../test-utils';
import { ParsedArgs } from 'minimist';
import * as path from 'path';

describe('CLI Deployment Scenarios', () => {
  let fixture: TestFixture;

  beforeAll(() => {
    fixture = new TestFixture('sqitch', 'simple-w-tags');
  });

  afterAll(() => {
    fixture.cleanup();
  });

  const parseScript = (script: string): Array<{ command: string; args: ParsedArgs }> => {
    return script
      .trim()
      .split('\n')
      .filter(line => line.trim() && !line.trim().startsWith('#'))
      .map(line => {
        const parts = line.trim().split(/\s+/);
        const [, command, ...argParts] = parts; // Skip 'lql'
        
        const args: ParsedArgs = {
          _: [command],
          cwd: fixture.tempFixtureDir,
          recursive: true,
          yes: true, // Auto-confirm prompts
          tx: true,  // Use transactions
          fast: false // Don't use fast deployment
        };

        for (let i = 0; i < argParts.length; i++) {
          const arg = argParts[i];
          if (arg.startsWith('--')) {
            const key = arg.slice(2);
            if (i + 1 < argParts.length && !argParts[i + 1].startsWith('--')) {
              args[key] = argParts[++i];
            } else {
              args[key] = true;
            }
          }
        }

        return { command, args };
      });
  };

  const runScriptCommands = async (script: string) => {
    const commands = parseScript(script);
    const results: Array<{
      command: string;
      result: {
        result: any;
        argv: ParsedArgs;
        writeResults: string[];
        transformResults: string[];
      };
    }> = [];

    for (const { command, args } of commands) {
      const result = await fixture.runCmd(args);
      results.push({ command, result });
    }

    return results;
  };

  test('handles modified deployment scenario for my-third using script approach', async () => {
    const script = `
      lql deploy --recursive --project my-third --database test_deployment_scenarios
      lql revert --recursive --project my-third --database test_deployment_scenarios --toChange my-first:@v1.0.0
      lql deploy --recursive --project my-third --database test_deployment_scenarios
      lql revert --recursive --project my-third --database test_deployment_scenarios --toChange my-first:@v1.0.0
      lql deploy --recursive --project my-third --database test_deployment_scenarios
      lql verify --recursive --project my-third --database test_deployment_scenarios
    `;

    const originalEnv = process.env;
    process.env.LAUNCHQL_TEST_MODULE = 'my-third';
    process.env.LAUNCHQL_TEST_DATABASE = 'test_deployment_scenarios';

    try {
      const results = await runScriptCommands(script);
      
      expect(results).toHaveLength(6);
      
      results.forEach(({ command, result }) => {
        expect(result.argv._).toContain(command);
        expect(result.argv.recursive).toBe(true);
        expect(result.argv.project).toBe('my-third');
        expect(result.argv.database).toBe('test_deployment_scenarios');
      });

      expect(results.map(r => ({
        command: r.command,
        argv: { ...r.result.argv, cwd: '<CWD>' }
      }))).toMatchSnapshot('deployment-scenario-flow');

    } finally {
      process.env = originalEnv;
    }
  });

  test('parses script commands correctly', () => {
    const script = `
      # This is a comment
      lql deploy --recursive --fast
      lql revert --recursive --toChange my-first:@v1.0.0
      lql verify --recursive
    `;

    const commands = parseScript(script);
    
    expect(commands).toHaveLength(3);
    
    expect(commands[0]).toEqual({
      command: 'deploy',
      args: expect.objectContaining({
        _: ['deploy'],
        recursive: true,
        fast: true,
        yes: true,
        tx: true
      })
    });

    expect(commands[1]).toEqual({
      command: 'revert', 
      args: expect.objectContaining({
        _: ['revert'],
        recursive: true,
        toChange: 'my-first:@v1.0.0',
        yes: true,
        tx: true
      })
    });

    expect(commands[2]).toEqual({
      command: 'verify',
      args: expect.objectContaining({
        _: ['verify'],
        recursive: true,
        yes: true,
        tx: true
      })
    });
  });
});
