import { EventEmitter } from 'events';
import updateCommand from '../commands/update';

jest.mock('child_process', () => ({
  spawn: jest.fn()
}));

jest.mock('../utils/npm-version', () => ({
  fetchLatestVersion: jest.fn().mockResolvedValue('9.9.9')
}));

jest.mock('../utils/cli-error', () => ({
  cliExitWithError: jest.fn(async (message: any) => {
    throw new Error(String(message));
  })
}));

const spawnMock = require('child_process').spawn as jest.Mock;

const createSpawnSuccess = () => {
  const emitter = new EventEmitter() as any;
  process.nextTick(() => emitter.emit('exit', 0));
  emitter.on = emitter.addListener;
  return emitter;
};

const createSpawnFailure = () => {
  const emitter = new EventEmitter() as any;
  process.nextTick(() => emitter.emit('exit', 1));
  emitter.on = emitter.addListener;
  return emitter;
};

describe('update command', () => {
  beforeEach(() => {
    spawnMock.mockReset();
  });

  it('runs npm install with default package', async () => {
    spawnMock.mockReturnValue(createSpawnSuccess());

    await updateCommand({}, {} as any, {} as any);

    expect(spawnMock).toHaveBeenCalled();
    const args = spawnMock.mock.calls[0][1];
    expect(args).toContain('install');
  });

  it('fails gracefully when npm install fails', async () => {
    spawnMock.mockReturnValue(createSpawnFailure());

    await expect(
      updateCommand({}, {} as any, {} as any)
    ).rejects.toThrow();
  });
});
