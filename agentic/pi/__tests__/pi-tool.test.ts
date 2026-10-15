import { constructiveDbTools } from '@agentic-kit/db-tools';
import { defineHarnessTool } from '@agentic-kit/harness';
import type { ExtensionAPI, ToolDefinition } from '@earendil-works/pi-coding-agent';
import { z } from 'zod';

import { createDbTools, dbTools, toPiTool } from '../src';

const echoTool = defineHarnessTool({
  name: 'echo',
  label: 'Echo',
  description: 'Echo a message back.',
  promptSnippet: 'echo: say it back.',
  parameters: z.object({ message: z.string().describe('What to echo.') }),
  async execute(params, ctx) {
    return {
      content: [{ type: 'text', text: `${params.message} @ ${ctx.cwd}` }],
      details: { echoed: params.message },
    };
  },
});

describe('toPiTool', () => {
  it('carries the descriptive surface across unchanged', () => {
    const piTool = toPiTool(echoTool);

    expect(piTool.name).toBe('echo');
    expect(piTool.label).toBe('Echo');
    expect(piTool.description).toBe('Echo a message back.');
    expect(piTool.promptSnippet).toBe('echo: say it back.');
  });

  it('converts zod parameters into the JSON-Schema shape pi wants', () => {
    const { parameters } = toPiTool(echoTool) as unknown as {
      parameters: {
        type: string;
        properties: Record<string, { type: string; description: string }>;
        required: string[];
      };
    };

    expect(parameters.type).toBe('object');
    expect(parameters.properties.message).toEqual({
      type: 'string',
      description: 'What to echo.',
    });
    expect(parameters.required).toEqual(['message']);
    expect(parameters).not.toHaveProperty('$schema');
  });

  it('omits optional fields the tool did not declare, rather than passing undefined', () => {
    const piTool = toPiTool({ ...echoTool, promptSnippet: undefined });

    expect('promptSnippet' in piTool).toBe(false);
    expect('promptGuidelines' in piTool).toBe(false);
  });

  it('forwards cwd and the abort signal, and nothing else pi passes', async () => {
    const seen: unknown[] = [];
    const tool = defineHarnessTool({
      ...echoTool,
      async execute(params, ctx) {
        seen.push(ctx);
        return { content: [{ type: 'text' as const, text: params.message }], details: null };
      },
    });
    const controller = new AbortController();

    const result = await toPiTool(tool).execute(
      'call-1',
      { message: 'hi' },
      controller.signal,
      undefined,
      { cwd: '/tmp/project', model: 'anything-else' } as never,
    );

    expect(seen).toEqual([{ cwd: '/tmp/project', signal: controller.signal }]);
    expect(result).toEqual({ content: [{ type: 'text', text: 'hi' }], details: null });
  });

  it('sends progress text through pi\'s update callback', async () => {
    const tool = defineHarnessTool({
      ...echoTool,
      async execute(params, ctx) {
        ctx.onProgress?.('Retrying 1/3');
        return { content: [{ type: 'text' as const, text: params.message }], details: null };
      },
    });
    const onUpdate = jest.fn();

    await toPiTool(tool).execute('call-1', { message: 'hi' }, undefined, onUpdate, {
      cwd: '/tmp/project',
    } as never);

    expect(onUpdate).toHaveBeenCalledWith({
      content: [{ type: 'text', text: 'Retrying 1/3' }],
      details: undefined,
    });
  });
});

describe('dbTools', () => {
  it('registers every Constructive tool with pi, in order', () => {
    const registered: ToolDefinition<any, any>[] = [];
    dbTools({
      registerTool: (tool: ToolDefinition<any, any>) => registered.push(tool),
      on: (): undefined => undefined,
    } as unknown as ExtensionAPI);

    expect(registered.map((tool) => tool.name)).toEqual(
      constructiveDbTools.map((tool) => tool.name),
    );
    expect(registered).toHaveLength(18);
    for (const tool of registered) {
      expect(typeof tool.execute).toBe('function');
      expect(tool.parameters).toMatchObject({ type: 'object' });
    }
  });

  it('createDbTools configures the host and returns the extension', () => {
    const host = { account: (): null => null, backendConfig: (): null => null };

    expect(createDbTools(host)).toBe(dbTools);
  });
});
