import { PgpmInit } from '@pgpmjs/core';
import { getConnEnvOptions } from '@pgpmjs/env';
import { CLIOptions, Inquirerer } from 'inquirerer';

import add from '../src/commands/admin-users/add';

jest.mock('@pgpmjs/core', () => ({ PgpmInit: jest.fn() }));
jest.mock('@pgpmjs/env', () => ({ getConnEnvOptions: jest.fn() }));

const bootstrapDbRoles = jest.fn();
const close = jest.fn();
const roles = { anonymous: 'anonymous', authenticated: 'authenticated' };
const prompter = { prompt: jest.fn(async (argv) => argv) } as unknown as Inquirerer;

beforeEach(() => {
  jest.clearAllMocks();
  bootstrapDbRoles.mockResolvedValue(undefined);
  (PgpmInit as jest.Mock).mockImplementation(() => ({ bootstrapDbRoles, close }));
  (getConnEnvOptions as jest.Mock).mockReturnValue({ roles, useLocksForRoles: true });
});

it.each([false, true])('passes explicit RLS bypass (%s) through pgpm provisioning', async (bypassrls) => {
  await add({ username: 'example', password: 'test-only', yes: true, bypassrls }, prompter, {} as CLIOptions);
  expect(bootstrapDbRoles).toHaveBeenCalledWith('example', 'test-only', roles, {
    bypassRls: bypassrls, useLocksForRoles: true
  });
  expect(close).toHaveBeenCalledTimes(1);
});

it('does not enable RLS bypass by default', async () => {
  await add({ username: 'example', password: 'test-only', yes: true }, prompter, {} as CLIOptions);
  expect(bootstrapDbRoles.mock.calls[0][3].bypassRls).toBe(false);
});

it('does not silently ignore bypass for test users', async () => {
  await expect(add({ test: true, bypassrls: true }, prompter, {} as CLIOptions)).rejects.toThrow('--test');
  expect(bootstrapDbRoles).not.toHaveBeenCalled();
});

it('surfaces provisioning failures and closes the connection', async () => {
  bootstrapDbRoles.mockRejectedValue(new Error('permission denied'));
  await expect(add({ username: 'example', password: 'test-only', yes: true }, prompter, {} as CLIOptions))
    .rejects.toThrow('permission denied');
  expect(close).toHaveBeenCalledTimes(1);
});
