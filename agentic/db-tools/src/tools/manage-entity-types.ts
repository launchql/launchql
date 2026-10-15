import type { HarnessTool } from '@agentic-kit/harness';
import { z } from 'zod';

import { toolRequests } from '../backend-fetch';
import { resolveProjectContext } from '../context';

const ManageEntityTypesZod = z.object({
  action: z
    .enum(['list', 'create', 'delete'])
    .describe(
      'list: show the entity types provisioned in this database. create: provision a new entity type (creates its entity table + membership wiring). delete: remove the provision registration. Registrations are immutable once provisioned — there is no update; to change one, delete it and create a new one.',
    ),
  name: z.string().describe('Entity type name. Required for create.').optional(),
  entity_type_id: z
    .string()
    .describe('Entity type provision id. Required for delete — get it from action "list".')
    .optional(),
  description: z
    .string()
    .describe('Human-readable description of the entity type. Create only.')
    .optional(),
  prefix: z
    .string()
    .describe(
      'Table-name prefix for the provisioned tables (e.g. "org" → org table, org_memberships). Create only; defaults to the snake_case of name.',
    )
    .optional(),
  parent_entity: z
    .string()
    .describe(
      'Parent entity table name, for hierarchical types (e.g. a "team" under an "org"). Create only; the backend defaults it to the root entity (org).',
    )
    .optional(),
  is_visible: z
    .boolean()
    .describe('Whether the type shows up in end-user entity listings. Create only.')
    .optional(),
  has_invites: z
    .boolean()
    .describe('Provision an invites module ({prefix}_invites + claimed invites). Create only.')
    .optional(),
  has_profiles: z
    .boolean()
    .describe('Provision a profiles table for members of this type. Create only.')
    .optional(),
  has_limits: z
    .boolean()
    .describe('Provision usage-limits tracking for this type. Create only.')
    .optional(),
  has_levels: z
    .boolean()
    .describe('Provision levels/achievements support for this type. Create only.')
    .optional(),
  has_storage: z
    .boolean()
    .describe('Provision a storage module (files + buckets tables) for this type. Create only.')
    .optional(),
});

export type EntityTypeSummary = {
  id: string;
  name: string | null;
  description: string | null;
  prefix: string | null;
  parentEntity: string | null;
  isVisible: boolean | null;
  entityTableName: string | null;
  installedModules: string[] | null;
};

export type ManageEntityTypesDetails = {
  success: boolean;
  message: string;
  entityTypes?: EntityTypeSummary[];
};

const SUMMARY_SELECT = {
  id: true,
  name: true,
  description: true,
  prefix: true,
  parentEntity: true,
  isVisible: true,
  outEntityTableName: true,
  outInstalledModules: true,
} as const;

type SummaryRow = {
  id: string;
  name: string | null;
  description: string | null;
  prefix: string | null;
  parentEntity: string | null;
  isVisible: boolean | null;
  outEntityTableName: string | null;
  outInstalledModules: string[] | null;
};

function toSummary(row: SummaryRow): EntityTypeSummary {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    prefix: row.prefix,
    parentEntity: row.parentEntity,
    isVisible: row.isVisible,
    entityTableName: row.outEntityTableName,
    installedModules: row.outInstalledModules,
  };
}

function formatSummary(s: EntityTypeSummary): string {
  const parts = [
    `- ${s.name ?? '?'} (id: ${s.id})`,
    `  table: ${s.entityTableName ?? '?'}, prefix: ${s.prefix ?? '?'}`,
  ];
  if (s.parentEntity) parts.push(`  parent: ${s.parentEntity}`);
  if (s.description) parts.push(`  description: ${s.description}`);
  if (s.installedModules?.length) parts.push(`  modules: ${s.installedModules.join(', ')}`);
  return parts.join('\n');
}

export function defaultPrefix(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

type Params = z.infer<typeof ManageEntityTypesZod>;

export function validateManageEntityTypes(params: Params): string | null {
  switch (params.action) {
  case 'create':
    if (!params.name?.trim()) return 'create requires "name".';
    if (params.entity_type_id) return 'create does not take "entity_type_id" — it mints a new one.';
    return null;
  case 'delete':
    if (!params.entity_type_id) return 'delete requires "entity_type_id" (use action "list" to find it).';
    return null;
  default:
    return null;
  }
}

export const manageEntityTypesTool: HarnessTool<
  typeof ManageEntityTypesZod,
  ManageEntityTypesDetails
> = {
  name: 'manage_entity_types',
  label: 'Manage entity types',
  description:
    'List, create, or delete entity types in the project database. An entity type (e.g. organization, team, project) provisions its own entity table plus membership wiring, and is the unit that API keys can be scoped to. Registrations are immutable once provisioned — to change one, delete it and create a new one. Deleting removes the registration; the already-provisioned entity table stays in the API schema.',
  promptSnippet:
    'manage_entity_types: list/create/delete entity types (orgs, teams, …) in the project database. list is free; create/delete are gated.',
  parameters: ManageEntityTypesZod,
  async execute(params: Params, ctx) {
    const resolved = await resolveProjectContext(ctx.cwd, toolRequests(ctx));
    if (!resolved.context) {
      return {
        content: [{ type: 'text', text: resolved.reason }],
        details: { success: false, message: resolved.reason },
      };
    }

    const invalid = validateManageEntityTypes(params);
    if (invalid) {
      return {
        content: [{ type: 'text', text: invalid }],
        details: { success: false, message: invalid },
      };
    }

    const { modules, databaseId } = resolved.context;

    try {
      switch (params.action) {
      case 'list': {
        const result = await modules.entityTypeProvision
          .findMany({
            where: { databaseId: { equalTo: databaseId } },
            select: SUMMARY_SELECT,
          })
          .unwrap();
        const entityTypes = result.entityTypeProvisions.nodes.map((row) =>
          toSummary(row as SummaryRow),
        );
        const message =
          entityTypes.length === 0
            ? 'No entity types are provisioned in this database yet.'
            : `${entityTypes.length} entity type${entityTypes.length === 1 ? '' : 's'}:\n${entityTypes.map(formatSummary).join('\n')}`;
        return {
          content: [{ type: 'text', text: message }],
          details: { success: true, message, entityTypes },
        };
      }
      case 'create': {
        const name = params.name!.trim();
        const result = await modules.entityTypeProvision
          .create({
            data: {
              databaseId,
              name,
              prefix: params.prefix?.trim() || defaultPrefix(name),
              ...(params.description !== undefined && { description: params.description }),
              ...(params.parent_entity !== undefined && { parentEntity: params.parent_entity }),
              ...(params.is_visible !== undefined && { isVisible: params.is_visible }),
              ...(params.has_invites !== undefined && { hasInvites: params.has_invites }),
              ...(params.has_profiles !== undefined && { hasProfiles: params.has_profiles }),
              ...(params.has_limits !== undefined && { hasLimits: params.has_limits }),
              ...(params.has_levels !== undefined && { hasLevels: params.has_levels }),
              ...(params.has_storage && {
                storage: [{}] as unknown as Record<string, unknown>,
              }),
            },
            select: SUMMARY_SELECT,
          })
          .unwrap();
        const row = result.createEntityTypeProvision?.entityTypeProvision;
        if (!row) throw new Error('createEntityTypeProvision returned no row.');
        const summary = toSummary(row as SummaryRow);
        const message = `Created entity type "${summary.name}" (id: ${summary.id}) — entity table "${summary.entityTableName}"${summary.installedModules?.length ? `, modules: ${summary.installedModules.join(', ')}` : ''}. Run run_codegen to pull it into the typed SDK.`;
        return {
          content: [{ type: 'text', text: message }],
          details: { success: true, message, entityTypes: [summary] },
        };
      }
      case 'delete': {
        const result = await modules.entityTypeProvision
          .delete({
            where: { id: params.entity_type_id! },
            select: { id: true, name: true, outEntityTableName: true },
          })
          .unwrap();
        const row = result.deleteEntityTypeProvision?.entityTypeProvision;
        const name = row?.name ?? params.entity_type_id;
        const message = `Deleted entity type registration "${name}". Note: the provisioned entity table${row?.outEntityTableName ? ` "${row.outEntityTableName}"` : ''} remains in the API schema with its data.`;
        return {
          content: [{ type: 'text', text: message }],
          details: { success: true, message },
        };
      }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to manage entity types';
      return { content: [{ type: 'text', text: message }], details: { success: false, message } };
    }
  },
};
