import type { HarnessTool } from '@agentic-kit/harness';
import { z } from 'zod';

import { run, type RunCommand } from '../app-workspace';
import {
  boundDatabaseId,
  type ProvisionDatabaseDetails,
  provisionFromTool,
} from '../provision-database/provision';

export type { ProvisionDatabaseDetails };

const ProvisionDatabaseZod = z.object({
  database_name: z
    .string()
    .describe(
      'Name for the app database (lowercase, alphanumeric + underscores). Doubles as the deterministic provisioning subdomain (api-<name>/auth-<name>/app-<name>.localhost), so keep it short and URL-safe.',
    ),
  reprovision: z
    .boolean()
    .describe(
      'Mint a fresh database even though the project already carries a binding — use when the bound database no longer exists on this backend (refreshed backend, deleted database), when it belongs to a different account than the one signed in, or when the user asks for a clean rebuild. The old .env keys are archived as comments and the old database is never deleted server-side. The schema must be rebuilt afterwards (provision_blueprint + run_codegen); records do not carry over.',
    )
    .optional(),
});

type Params = z.infer<typeof ProvisionDatabaseZod>;

type ToolResult = { content: { type: 'text'; text: string }[]; details: ProvisionDatabaseDetails };

// `exec` runs the prewarm's child processes (clone, install); tests inject it.
export function createProvisionDatabaseTool(
  exec: RunCommand = run,
): HarnessTool<typeof ProvisionDatabaseZod, ProvisionDatabaseDetails> {
  return {
    name: 'provision_database',
    label: 'Provision database',
    description:
      'Bootstrap a new Constructive database for the project under your account: provision the standard module set and write credentials (DATABASE_ID, ACCESS_TOKEN, etc.) to the project .env. Run this ONCE before any schema/record tools. If the project is already bound to a live database under the signed-in account it skips; if the bound database no longer exists on this backend (refreshed/deleted) or belongs to a different account, pass reprovision: true to mint a fresh one (old keys archived in .env, old database kept; rebuild the schema afterwards). If a call returns while the database is still provisioning, call it again with the same database_name to keep waiting; a different name starts a second database.',
    promptSnippet:
      'provision_database: one-time bootstrap of the project database (owner + modules + .env). Run before describe_schema/provision_blueprint. Skips when the existing binding is live under the signed-in account; reprovision: true replaces a dead or foreign-account binding (archives old keys, never deletes the old db). Gated.',
    parameters: ProvisionDatabaseZod,
    async execute(params: Params, ctx): Promise<ToolResult> {
      // reprovision: true replaces the binding the project has right now; one
      // that changes while this call waits for the project lock is not replaced.
      const replace = params.reprovision === true;
      const details = await provisionFromTool(
        {
          databaseName: params.database_name,
          mode: replace ? 'replace' : 'ensure',
          replaces: replace ? ((await boundDatabaseId(ctx.cwd)) ?? null) : undefined,
        },
        ctx,
        exec,
      );
      return { content: [{ type: 'text', text: details.message }], details };
    },
  };
}

export const provisionDatabaseTool = createProvisionDatabaseTool();
