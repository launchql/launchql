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



  test('handles modified deployment scenario for my-third using script approach', () => {
    const script = `
      lql deploy --recursive --project my-third --database test_db
      lql revert --recursive --project my-third --database test_db --toChange my-first:@v1.0.0
      lql deploy --recursive --project my-third --database test_db
      lql revert --recursive --project my-third --database test_db --toChange my-first:@v1.0.0
      lql deploy --recursive --project my-third --database test_db
      lql verify --recursive --project my-third --database test_db
    `;

    const commands = fixture.parseScript(script);
    
    expect(commands).toHaveLength(6);
    
    expect(commands[0]).toEqual({
      command: 'deploy',
      args: expect.objectContaining({
        _: ['deploy'],
        recursive: true,
        project: 'my-third',
        database: 'test_db',
        yes: true,
        tx: true
      })
    });

    expect(commands[1]).toEqual({
      command: 'revert',
      args: expect.objectContaining({
        _: ['revert'],
        recursive: true,
        project: 'my-third',
        database: 'test_db',
        toChange: 'my-first:@v1.0.0',
        yes: true,
        tx: true
      })
    });

    const expectedSequence = ['deploy', 'revert', 'deploy', 'revert', 'deploy', 'verify'];
    expect(commands.map(c => c.command)).toEqual(expectedSequence);

    expect(commands.map(c => ({
      command: c.command,
      args: { ...c.args, cwd: '<CWD>' }
    }))).toMatchSnapshot('deployment-scenario-commands');
  });

  test('parses script commands correctly', () => {
    const script = `
      # This is a comment
      lql deploy --recursive --fast
      lql revert --recursive --toChange my-first:@v1.0.0
      lql verify --recursive
    `;

    const commands = fixture.parseScript(script);
    
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

  test('handles boolean negation with --no- prefix', () => {
    const script = `
      lql deploy --recursive --no-fast --project my-app
      lql verify --no-tx --database test_db
    `;

    const commands = fixture.parseScript(script);
    
    expect(commands).toHaveLength(2);
    
    expect(commands[0]).toEqual({
      command: 'deploy',
      args: expect.objectContaining({
        _: ['deploy'],
        recursive: true,
        fast: false, // --no-fast should set fast to false
        project: 'my-app',
        yes: true,
        tx: true
      })
    });

    expect(commands[1]).toEqual({
      command: 'verify',
      args: expect.objectContaining({
        _: ['verify'],
        recursive: true,
        tx: false, // --no-tx should set tx to false
        database: 'test_db',
        yes: true,
        fast: false
      })
    });
  });
});
