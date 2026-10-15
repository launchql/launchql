import type { z } from 'zod';

/**
 * A tool a harness can run, described without reference to any harness.
 *
 * The vendor-specific parts of a tool definition are its parameter encoding
 * (pi wants TypeBox, an MCP server wants JSON Schema, dsh wants its own
 * `ToolDefinition`), the arguments its runner threads through `execute`, and
 * its terminal rendering. None of that is a property of the tool itself: what
 * `add_records` *is* is a name, a description the model reads, a parameter
 * shape, and a function from validated params to text plus structured details.
 *
 * So that is all this states. An adapter maps it onto its own runner
 * (`toPiTool` in `@agentic-kit/pi`), which is the only place a tool's
 * shape meets a harness SDK.
 */

/** Text the model reads back from a call. */
export interface HarnessToolText {
  type: 'text';
  text: string;
}

/** An image the model reads back from a call, base64-encoded. */
export interface HarnessToolImage {
  type: 'image';
  data: string;
  mimeType: string;
}

export type HarnessToolContent = HarnessToolImage | HarnessToolText;

/**
 * What a call returns: content for the model, details for logs and UI.
 *
 * `details` is the tool's own structured record of what it did — the run log
 * stores it, a surface renders it, and tests assert on it, none of which should
 * have to parse the text meant for the model.
 */
export interface HarnessToolResult<TDetails = unknown> {
  content: HarnessToolContent[];
  details: TDetails;
  /**
   * Hint that the agent should stop after this batch of calls. Harnesses that
   * have no such notion ignore it.
   */
  terminate?: boolean;
}

/**
 * What a tool may know about the call it is serving.
 *
 * Deliberately thin: everything a Constructive tool needs is the directory the
 * session is rooted at (the project it resolves its context and credentials
 * from) and the signal that says the run was abandoned. A tool that reaches for
 * more than this is reaching into a harness.
 */
export interface HarnessToolContext {
  /** Working directory of the run — the project the tool acts on. */
  readonly cwd: string;
  /** Aborted when the run is cancelled, if the harness offers one. */
  readonly signal?: AbortSignal;
  /** Reports progress text while the call runs (e.g. "Retrying 2/3"), if the harness shows it. */
  readonly onProgress?: (message: string) => void;
}

/**
 * A tool, parameterized by its zod parameter schema.
 *
 * Parameters are zod because that is where the descriptions the model reads
 * live, and every other encoding is derivable from it — an adapter converts,
 * the tool never does.
 */
export interface HarnessTool<TParams extends z.ZodType = z.ZodType, TDetails = unknown> {
  /** Name the model calls, snake_case. */
  name: string;
  /** Human-readable label for a surface. */
  label: string;
  /** Description the model reads to decide whether to call it. */
  description: string;
  /** One-line summary for a system prompt's tool list, when the harness has one. */
  promptSnippet?: string;
  /** Guideline bullets to append to the system prompt while this tool is active. */
  promptGuidelines?: string[];
  parameters: TParams;
  execute(
    params: z.output<TParams>,
    ctx: HarnessToolContext
  ): Promise<HarnessToolResult<TDetails>>;
}

/** A tool of any parameter shape — what a registry or an adapter holds. */
export type AnyHarnessTool = HarnessTool<z.ZodType, any>;

/**
 * Identity, for inference.
 *
 * Assigning a tool to a variable typed as `HarnessTool` widens its params to
 * `z.ZodType` and loses `z.output` in `execute`; passing it through this keeps
 * both, exactly as pi's `defineTool` does for its own definitions.
 */
export function defineHarnessTool<TParams extends z.ZodType, TDetails = unknown>(
  tool: HarnessTool<TParams, TDetails>
): HarnessTool<TParams, TDetails> {
  return tool;
}
