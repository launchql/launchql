import {
  type Blueprint,
  BlueprintZod,
  expandBlueprintDefaults,
  filterInternalPolicies,
  type HarnessTool,
} from '@agentic-kit/harness';

import { buildBlueprint } from '../blueprint-construction';
import { resolveProjectContext } from '../context';

type Params = Blueprint;

type ProvisionedField = {
  name: string;
  type: string;
  isRequired: boolean;
  defaultValue: string | null;
};

type ProvisionedTable = {
  name: string;
  fields: ProvisionedField[];
  policies: string[];
  relationCount: number;
};

export type ProvisionBlueprintDetails = {
  created: number;
  total: number;
  tables: ProvisionedTable[];
  error: string | null;
};

function formatText(name: string, details: ProvisionBlueprintDetails): string {
  if (details.error) return `Failed to provision "${name}": ${details.error}`;
  const lines = [`Created ${details.created} table${details.created === 1 ? '' : 's'} from "${name}":`];
  for (const table of details.tables) {
    const parts = [`${table.fields.length} field${table.fields.length === 1 ? '' : 's'}`];
    if (table.relationCount > 0) {
      parts.push(`${table.relationCount} relation${table.relationCount === 1 ? '' : 's'}`);
    }
    if (table.policies.length > 0) {
      parts.push(`policies: ${table.policies.map((policy) => policy.replace(/^Authz/, '')).join(', ')}`);
    }
    lines.push(`  - ${table.name} (${parts.join(', ')})`);
  }
  return lines.join('\n');
}

export const provisionBlueprintTool: HarnessTool<typeof BlueprintZod, ProvisionBlueprintDetails> =
  {
    name: 'provision_blueprint',
    label: 'Provision blueprint',
    description:
      'Create one or more related tables (with fields, RLS policies, and relations) in the project database from a blueprint definition. Always put related tables in a SINGLE call so relations are created together.',
    promptSnippet:
      'provision_blueprint: create new tables from scratch in a single call (fields + policies + relations). Call describe_schema first.',
    parameters: BlueprintZod,
    async execute(params: Params, ctx) {
      const empty: ProvisionBlueprintDetails = { created: 0, total: 0, tables: [], error: null };

      const resolved = await resolveProjectContext(ctx.cwd);
      if (!resolved.context) {
        return { content: [{ type: 'text', text: resolved.reason }], details: empty };
      }

      const { modules, databaseId, schemaId, ownerId } = resolved.context;
      if (!ownerId) {
        return {
          content: [{ type: 'text', text: 'Not authenticated (missing OWNER_ID in .env).' }],
          details: empty,
        };
      }

      const definition = expandBlueprintDefaults(params.definition);
      const uniqueName = `${params.name}_${Date.now()}`;

      try {
        const createResult = await modules.blueprint
          .create({
            data: {
              ownerId,
              databaseId,
              name: uniqueName,
              displayName: params.name,
              description: params.description,
              definition,
            },
            select: { id: true, name: true },
          })
          .unwrap();

        const blueprintId = createResult.createBlueprint?.blueprint?.id;
        if (!blueprintId) throw new Error('Failed to create blueprint');

        await buildBlueprint(modules, { blueprintId, schemaId }, { signal: ctx.signal });

        const relations = params.definition.relations ?? [];
        const details: ProvisionBlueprintDetails = {
          created: params.definition.tables.length,
          total: params.definition.tables.length,
          tables: params.definition.tables.map((t) => ({
            name: t.table_name,
            fields: (t.fields ?? []).map((f) => ({
              name: f.name,
              type: f.type,
              isRequired: f.is_required ?? false,
              defaultValue: f.default ?? null,
            })),
            policies: filterInternalPolicies(t.policies.map((p) => p.$type)),
            relationCount: relations.filter((r) => r.source_table === t.table_name).length,
          })),
          error: null,
        };
        return { content: [{ type: 'text', text: formatText(params.name, details) }], details };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to provision blueprint';
        const details: ProvisionBlueprintDetails = {
          created: 0,
          total: params.definition.tables.length,
          tables: [],
          error: message,
        };
        return { content: [{ type: 'text', text: formatText(params.name, details) }], details };
      }
    },
  };
