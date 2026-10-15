import { toolSchema } from '@agentic-kit/db-tools';
import type { AnyHarnessTool, HarnessTool, HarnessToolResult } from '@agentic-kit/harness';
import type { ToolDefinition } from '@earendil-works/pi-coding-agent';
import type { z } from 'zod';

/**
 * Bind a neutral `HarnessTool` to pi's `ToolDefinition`.
 *
 * This is the whole of what pi wants that a tool does not state: parameters as
 * a typebox schema rather than zod, and an execute arity carrying pi's tool
 * call id, update callback and `ExtensionContext`. Everything a Constructive
 * tool actually reads out of that context is `cwd`, the abort signal, and a
 * progress callback (sent as a text-only partial result through `onUpdate`),
 * so that is all this forwards — the rest stops here, which is the point of
 * the seam: another harness writes its own binding and the tools do not change.
 */
export function toPiTool<TParams extends z.ZodType, TDetails>(
  tool: HarnessTool<TParams, TDetails>
): ToolDefinition<any, TDetails> {
  return {
    name: tool.name,
    label: tool.label,
    description: tool.description,
    ...(tool.promptSnippet === undefined ? {} : { promptSnippet: tool.promptSnippet }),
    ...(tool.promptGuidelines === undefined ? {} : { promptGuidelines: tool.promptGuidelines }),
    parameters: toolSchema(tool.parameters),
    async execute(_toolCallId, params, signal, onUpdate, ctx) {
      const result: HarnessToolResult<TDetails> = await tool.execute(params as z.output<TParams>, {
        cwd: ctx.cwd,
        signal,
        ...(onUpdate
          ? {
            onProgress: (text: string) =>
              onUpdate({ content: [{ type: 'text', text }], details: undefined as TDetails }),
          }
          : {}),
      });
      return result;
    },
  };
}

/** Bind a whole tool set, in registration order. */
export function toPiTools(tools: readonly AnyHarnessTool[]): ToolDefinition<any, any>[] {
  return tools.map((tool) => toPiTool(tool));
}
