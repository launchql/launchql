import { buildNodeData, getPolicyFieldDefaults, getPolicyProvisioningConfig, type HarnessTool } from '@agentic-kit/harness';
import { z } from 'zod';

import { toolRequests } from '../backend-fetch';
import { resolveProjectContext } from '../context';
import { addPoliciesToExistingTable } from '../policy/add-policies-to-table';
import type { CrudOperation, CrudPolicyConfigs } from '../policy/provision-helpers';
import { resolveSchema, resolveTable } from '../schema-resolve';

const DEFAULT_ROLE = 'authenticated';

const CrudOperationSchema = z.enum(['create', 'read', 'update', 'delete']);

const PolicyEntrySchema = z.object({
  policy_type: z
    .string()
    .describe(
      'Policy type id. Supported: AuthzAllowAll, AuthzDenyAll, AuthzAppMembership, AuthzDirectOwner, AuthzEntityMembership, AuthzOrgHierarchy, AuthzPublishable (these auto-create columns via their Data* node), AuthzRelatedMemberList, AuthzRelatedEntityMembership. Not supported (use the policies UI): AuthzDirectOwnerAny, AuthzMemberList, AuthzTemporal, AuthzComposite.',
    ),
  operations: z
    .array(CrudOperationSchema)
    .min(1)
    .describe(
      'CRUD operations the policy applies to: any subset of ["create","read","update","delete"].',
    ),
  role_name: z
    .string()
    .describe('PostgreSQL role the policy applies to. Defaults to "authenticated".')
    .optional(),
  is_permissive: z
    .boolean()
    .describe('PERMISSIVE (default true) vs RESTRICTIVE — most policies should be permissive.')
    .optional(),
  data: z
    .record(z.string(), z.unknown())
    .describe(
      'Type-specific shared data. AuthzDirectOwner: { entity_field: "owner_id" }. AuthzAppMembership: { permission?, is_admin?, is_owner? }. Empty object {} for AuthzAllowAll / AuthzDenyAll.',
    )
    .optional(),
  node_data: z
    .record(z.string(), z.unknown())
    .describe('Optional data for the underlying Data* node (has-module policies only).')
    .optional(),
});

const AddPoliciesZod = z.object({
  table_name: z
    .string()
    .describe(
      'Name of the existing table to attach the policies to. Use describe_schema first to verify it exists.',
    ),
  policies: z
    .array(PolicyEntrySchema)
    .min(1)
    .describe('One or more policies to add. Each entry becomes one secure_table_provision call.'),
});

export type AddPoliciesDetails = {
  success: boolean;
  message: string;
};

function buildOperations(roleName: string, isPermissive: boolean): CrudPolicyConfigs {
  const config = { roleName, isPermissive, policyData: {}, isCustomized: false };
  return { create: config, read: config, update: config, delete: config };
}

export const addPoliciesTool: HarnessTool<typeof AddPoliciesZod, AddPoliciesDetails> = {
  name: 'add_policies',
  label: 'Add policies',
  description:
    'Add one or more RLS policies to an existing table. Has-module policies (AuthzDirectOwner, AuthzEntityMembership, AuthzOrgHierarchy, AuthzPublishable) auto-create the columns they need — call directly, do not add columns first.',
  promptSnippet:
    'add_policies: attach RLS policies to an existing table (one call can add many). Gated.',
  parameters: AddPoliciesZod,
  async execute(params: z.infer<typeof AddPoliciesZod>, ctx) {
    const resolved = await resolveProjectContext(ctx.cwd, toolRequests(ctx));
    if (!resolved.context) {
      return {
        content: [{ type: 'text', text: resolved.reason }],
        details: { success: false, message: resolved.reason },
      };
    }

    const { modules, databaseId, schemaId } = resolved.context;

    try {
      const schema = await resolveSchema(resolved.context);
      const table = resolveTable(schema, params.table_name);

      const policies = params.policies.map((entry) => {
        const config = getPolicyProvisioningConfig(entry.policy_type);
        const defaults = getPolicyFieldDefaults(entry.policy_type);
        const mergedData = { ...defaults, ...(entry.data ?? {}) };
        const nodeData = entry.node_data ?? buildNodeData(entry.policy_type, mergedData);
        return {
          policyType: entry.policy_type,
          dataNodeType: config?.dataNodeType,
          nodeData,
          sharedPolicyData: mergedData,
          operations: buildOperations(entry.role_name ?? DEFAULT_ROLE, entry.is_permissive ?? true),
          enabledOperations: entry.operations as CrudOperation[],
        };
      });

      await addPoliciesToExistingTable({
        client: modules,
        databaseId,
        schemaId,
        tableId: table.id,
        policies,
      });

      const count = params.policies.length;
      const message = `Added ${count} ${count === 1 ? 'policy' : 'policies'} to ${params.table_name}`;
      return { content: [{ type: 'text', text: message }], details: { success: true, message } };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add policies';
      return { content: [{ type: 'text', text: message }], details: { success: false, message } };
    }
  },
};
