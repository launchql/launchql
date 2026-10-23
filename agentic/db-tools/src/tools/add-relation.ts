import { expandBlueprintDefaults, type HarnessTool } from '@agentic-kit/harness';

import { buildBlueprint } from '../blueprint-construction';
import { resolveProjectContext } from '../context';
import { resolveSchema, resolveTable } from '../schema-resolve';
import { type AddRelationParams as Params, AddRelationZod, buildRelation } from './add-relation-schema';

export type AddRelationDetails = {
  success: boolean;
  message: string;
  sourceTable?: string;
  targetTable?: string;
  fieldName?: string;
};

type ToolResult = { content: { type: 'text'; text: string }[]; details: AddRelationDetails };

function fail(message: string): ToolResult {
  return { content: [{ type: 'text', text: message }], details: { success: false, message } };
}

export const addRelationTool: HarnessTool<typeof AddRelationZod, AddRelationDetails> = {
  name: 'add_relation',
  label: 'Add relation',
  description:
    'Add a relation between two EXISTING tables without recreating them: belongs_to adds a foreign-key column on the source table; many_to_many creates a junction table. Use this for relations discovered after the tables were provisioned. For brand-new related tables, prefer a single provision_blueprint call.',
  promptSnippet:
    'add_relation: link two existing tables (belongs_to FK column, or many_to_many junction). Gated.',
  parameters: AddRelationZod,
  async execute(params: Params, ctx): Promise<ToolResult> {
    const type = params.relation_type ?? 'belongs_to';
    if (type === 'belongs_to' && !params.field_name) {
      return fail('field_name is required for a belongs_to relation (the FK column name on the source table).');
    }
    if (type === 'many_to_many' && !params.junction_table_name) {
      return fail('junction_table_name is required for a many_to_many relation.');
    }

    const resolved = await resolveProjectContext(ctx.cwd);
    if (!resolved.context) return fail(resolved.reason);
    const { modules, databaseId, schemaId, ownerId } = resolved.context;
    if (!ownerId) return fail('Not authenticated (missing OWNER_ID in .env).');

    // Validate both tables exist before constructing — a clearer error than the
    // backend's, and avoids a no-op blueprint.
    let schema;
    try {
      schema = await resolveSchema(resolved.context);
      resolveTable(schema, params.source_table);
      resolveTable(schema, params.target_table);
    } catch (err) {
      return fail(err instanceof Error ? err.message : 'Failed to resolve schema.');
    }

    const definition = expandBlueprintDefaults({ tables: [], relations: buildRelation(params) });
    const uniqueName = `add_relation_${Date.now()}`;

    try {
      const created = await modules.blueprint
        .create({
          data: {
            ownerId,
            databaseId,
            name: uniqueName,
            displayName: `${params.source_table} → ${params.target_table}`,
            description: `Add ${type} relation`,
            definition,
          },
          select: { id: true },
        })
        .unwrap();

      const blueprintId = created.createBlueprint?.blueprint?.id;
      if (!blueprintId) throw new Error('Failed to create relation blueprint');

      await buildBlueprint(modules, { blueprintId, schemaId }, { signal: ctx.signal });
    } catch (err) {
      return fail(`Failed to add relation: ${err instanceof Error ? err.message : String(err)}`);
    }

    const message =
      type === 'many_to_many'
        ? `Created junction table "${params.junction_table_name}" linking ${params.source_table} ↔ ${params.target_table}.`
        : `Added FK "${params.field_name}" on ${params.source_table} → ${params.target_table}.`;
    return {
      content: [{ type: 'text', text: message }],
      details: {
        success: true,
        message,
        sourceTable: params.source_table,
        targetTable: params.target_table,
        fieldName: params.field_name,
      },
    };
  },
};
