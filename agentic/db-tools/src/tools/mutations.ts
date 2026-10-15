import { type HarnessTool, toFieldDefault, toFieldType } from '@agentic-kit/harness';
import { z } from 'zod';

import { toolRequests } from '../backend-fetch';
import { resolveProjectContext } from '../context';
import { findUniqueConstraintId, resolveField, resolveSchema, resolveTable } from '../schema-resolve';

export type MutationDetails = {
  success: boolean;
  message: string;
};

function ok(message: string) {
  return {
    content: [{ type: 'text' as const, text: message }],
    details: { success: true, message },
  };
}

function fail(message: string) {
  return {
    content: [{ type: 'text' as const, text: message }],
    details: { success: false, message },
  };
}

// ── delete_table ──────────────────────────────────────────────────────────

const DeleteTableZod = z.object({
  table_name: z.string().describe('Name of the table to delete (snake_case)'),
});

export const deleteTableTool: HarnessTool<typeof DeleteTableZod, MutationDetails> = {
  name: 'delete_table',
  label: 'Delete table',
  description: 'Permanently delete a table and its data from the project database.',
  promptSnippet: 'delete_table: drop an existing table by name. Destructive — gated.',
  parameters: DeleteTableZod,
  async execute(params: z.infer<typeof DeleteTableZod>, ctx) {
    const resolved = await resolveProjectContext(ctx.cwd, toolRequests(ctx));
    if (!resolved.context) return fail(resolved.reason);
    try {
      const schema = await resolveSchema(resolved.context);
      const table = resolveTable(schema, params.table_name);
      await resolved.context.api.table
        .delete({ where: { id: table.id }, select: { id: true } })
        .unwrap();
      return ok(`Deleted table ${params.table_name}`);
    } catch (err) {
      return fail(err instanceof Error ? err.message : 'Failed to delete table');
    }
  },
};

// ── create_field ──────────────────────────────────────────────────────────

const CreateFieldZod = z.object({
  table_name: z.string().describe('Name of the table to add the field to'),
  field_name: z.string().describe('Field name in snake_case'),
  type: z
    .string()
    .describe(
      'PostgreSQL type: text, integer, smallint, numeric, boolean, date, timestamp, timestamptz, time, json, jsonb, inet, email, url, image, upload',
    ),
  is_required: z.boolean().describe('Whether the field is NOT NULL. Defaults to false.').optional(),
  default_value: z
    .union([z.string(), z.null()])
    .describe('SQL default expression, e.g. "now()", "\'draft\'"')
    .optional(),
  is_unique: z
    .boolean()
    .describe('Whether the field has a unique constraint. Defaults to false.')
    .optional(),
});

export const createFieldTool: HarnessTool<typeof CreateFieldZod, MutationDetails> = {
  name: 'create_field',
  label: 'Create field',
  description: 'Add a new field (column) to an existing table in the project database.',
  promptSnippet: 'create_field: add a column to an existing table. Gated.',
  parameters: CreateFieldZod,
  async execute(params: z.infer<typeof CreateFieldZod>, ctx) {
    const resolved = await resolveProjectContext(ctx.cwd, toolRequests(ctx));
    if (!resolved.context) return fail(resolved.reason);
    const { api, databaseId } = resolved.context;
    try {
      const schema = await resolveSchema(resolved.context);
      const table = resolveTable(schema, params.table_name);

      const result = await api.field
        .create({
          data: {
            name: params.field_name,
            type: toFieldType(params.type) as unknown as Record<string, unknown>,
            tableId: table.id,
            databaseId,
            isRequired: params.is_required ?? false,
            defaultValue: toFieldDefault(params.default_value) as unknown as
              | Record<string, unknown>
              | undefined,
          },
          select: { id: true, name: true, type: true },
        })
        .unwrap();

      const createdId = result.createField?.field?.id;

      if (params.is_unique && createdId) {
        try {
          await api.uniqueConstraint
            .create({
              data: {
                tableId: table.id,
                databaseId,
                fieldIds: [createdId],
                name: `${table.name}_${params.field_name}_key`,
                type: 'u',
              },
              select: { id: true },
            })
            .unwrap();
        } catch (err) {
          console.warn('Failed to create unique constraint:', err);
        }
      }

      return ok(`Added field ${params.table_name}.${params.field_name}`);
    } catch (err) {
      return fail(err instanceof Error ? err.message : 'Failed to create field');
    }
  },
};

// ── update_field ──────────────────────────────────────────────────────────

const UpdateFieldZod = z.object({
  table_name: z.string().describe('Name of the table containing the field'),
  field_name: z.string().describe('Current field name'),
  new_name: z.string().describe('New field name in snake_case (if renaming)').optional(),
  new_type: z.string().describe('New PostgreSQL type (if changing type)').optional(),
  is_required: z.boolean().describe('Set NOT NULL constraint').optional(),
  default_value: z
    .union([z.string(), z.null()])
    .describe('New SQL default expression, or null to remove')
    .optional(),
  is_unique: z.boolean().describe('Set or remove unique constraint').optional(),
});

export const updateFieldTool: HarnessTool<typeof UpdateFieldZod, MutationDetails> = {
  name: 'update_field',
  label: 'Update field',
  description: 'Modify an existing field: rename, change type, toggle required/unique, or set default.',
  promptSnippet: 'update_field: rename/retype/toggle an existing column. Gated.',
  parameters: UpdateFieldZod,
  async execute(params: z.infer<typeof UpdateFieldZod>, ctx) {
    const resolved = await resolveProjectContext(ctx.cwd, toolRequests(ctx));
    if (!resolved.context) return fail(resolved.reason);
    const { api, databaseId } = resolved.context;
    try {
      const schema = await resolveSchema(resolved.context);
      const table = resolveTable(schema, params.table_name);
      const field = resolveField(table, params.field_name);

      const patch: Record<string, unknown> = {};
      if (params.new_name) patch.name = params.new_name;
      if (params.new_type) patch.type = toFieldType(params.new_type) as unknown as Record<string, unknown>;
      if (params.is_required !== undefined) patch.isRequired = params.is_required;
      if (params.default_value !== undefined) {
        patch.defaultValue =
          params.default_value === null ? null : (toFieldDefault(params.default_value) ?? null);
      }

      if (Object.keys(patch).length > 0) {
        await api.field
          .update({
            where: { id: field.id },
            data: patch,
            select: { id: true, name: true, type: true },
          })
          .unwrap();
      }

      if (params.is_unique !== undefined) {
        const existingUniqueId = findUniqueConstraintId(table, field.id);
        if (params.is_unique && !existingUniqueId) {
          try {
            await api.uniqueConstraint
              .create({
                data: {
                  tableId: table.id,
                  databaseId,
                  fieldIds: [field.id],
                  name: `${table.name}_${params.new_name ?? field.name}_key`,
                  type: 'u',
                },
                select: { id: true },
              })
              .unwrap();
          } catch (err) {
            console.warn('Failed to create unique constraint:', err);
          }
        } else if (!params.is_unique && existingUniqueId) {
          try {
            await api.uniqueConstraint
              .delete({ where: { id: existingUniqueId }, select: { id: true } })
              .unwrap();
          } catch (err) {
            console.warn('Failed to delete unique constraint:', err);
          }
        }
      }

      return ok(`Updated field ${params.table_name}.${params.field_name}`);
    } catch (err) {
      return fail(err instanceof Error ? err.message : 'Failed to update field');
    }
  },
};

// ── delete_field ──────────────────────────────────────────────────────────

const DeleteFieldZod = z.object({
  table_name: z.string().describe('Name of the table containing the field'),
  field_name: z.string().describe('Name of the field to delete'),
});

export const deleteFieldTool: HarnessTool<typeof DeleteFieldZod, MutationDetails> = {
  name: 'delete_field',
  label: 'Delete field',
  description: 'Permanently delete a field (column) from an existing table.',
  promptSnippet: 'delete_field: drop a column from a table by name. Destructive — gated.',
  parameters: DeleteFieldZod,
  async execute(params: z.infer<typeof DeleteFieldZod>, ctx) {
    const resolved = await resolveProjectContext(ctx.cwd, toolRequests(ctx));
    if (!resolved.context) return fail(resolved.reason);
    try {
      const schema = await resolveSchema(resolved.context);
      const table = resolveTable(schema, params.table_name);
      const field = resolveField(table, params.field_name);
      await resolved.context.api.field
        .delete({ where: { id: field.id }, select: { id: true } })
        .unwrap();
      return ok(`Deleted field ${params.table_name}.${params.field_name}`);
    } catch (err) {
      return fail(err instanceof Error ? err.message : 'Failed to delete field');
    }
  },
};
