import { type ConfirmPreviewTable, filterInternalPolicies, type HarnessTool } from '@agentic-kit/harness';
import { z } from 'zod';

import { buildBlueprint } from '../blueprint-construction';
import type { ModulesClient, ProjectContext } from '../context';
import { resolveProjectContext } from '../context';

export type TemplateDetails = {
  success: boolean;
  message: string;
};

export type CreateTemplateDetails = TemplateDetails & {
  displayName?: string;
  blueprintName?: string;
  tables?: ConfirmPreviewTable[];
};

type TemplateField = {
  name: string;
  type: string;
  isRequired: boolean;
  defaultValue: string | null;
};

type TemplateTable = {
  name: string;
  fields: TemplateField[];
  policies: string[];
  relationCount: number;
};

type TemplateInfo = {
  displayName: string;
  description: string | null;
  categories: string[];
  tables: TemplateTable[];
};

export type ListTemplatesDetails = { templates: TemplateInfo[] };

// A stored blueprint field's `type` is an expanded object (`{ name: 'text' }`),
// not the bare string the agent passes to provision_blueprint. Flatten it to the
// type name so the renderer gets a string, never an object (which React can't
// render as a child).
function fieldTypeName(raw: unknown): string {
  if (typeof raw === 'string') return raw;
  if (raw && typeof raw === 'object' && typeof (raw as { name?: unknown }).name === 'string') {
    return (raw as { name: string }).name;
  }
  return '';
}

// A template's definition is a stored blueprint (see BlueprintDefinitionSchema):
// { tables: [{ table_name, fields, policies }], relations: [{ source_table, … }] }.
// Parse it into the same table shape provision_blueprint surfaces so the renderer
// can reuse TableCard. Defensive throughout — it's untyped JSON from the catalog.
function parseTemplateTables(definition: unknown): TemplateTable[] {
  if (!definition || typeof definition !== 'object') return [];
  const def = definition as { tables?: unknown; relations?: unknown };
  const tables = Array.isArray(def.tables) ? def.tables : [];
  const relations = Array.isArray(def.relations) ? def.relations : [];
  return tables.map((raw) => {
    const table = raw as { table_name?: string; fields?: unknown; policies?: unknown };
    const fields = Array.isArray(table.fields) ? table.fields : [];
    const policies = Array.isArray(table.policies) ? table.policies : [];
    return {
      name: table.table_name ?? '',
      fields: fields.map((rawField) => {
        const field = rawField as {
          name?: string;
          type?: unknown;
          is_required?: boolean;
          default?: unknown;
        };
        return {
          name: field.name ?? '',
          type: fieldTypeName(field.type),
          isRequired: field.is_required ?? false,
          defaultValue: typeof field.default === 'string' ? field.default : null,
        };
      }),
      policies: filterInternalPolicies(
        policies.map((policy) => (policy as { $type?: string }).$type ?? '').filter(Boolean),
      ),
      relationCount: relations.filter(
        (relation) => (relation as { source_table?: string }).source_table === table.table_name,
      ).length,
    };
  });
}

function formatTemplatesText(templates: TemplateInfo[]): string {
  if (templates.length === 0) return 'No blueprint templates available.';
  const lines = [`Available blueprint templates (${templates.length}):`];
  for (const template of templates) {
    const cats = template.categories.length ? ` [${template.categories.join(', ')}]` : '';
    lines.push(`  ${template.displayName} — ${template.tables.length} tables${cats}`);
    for (const table of template.tables) {
      lines.push(`    - ${table.name} (${table.fields.length} field${table.fields.length === 1 ? '' : 's'})`);
    }
  }
  return lines.join('\n');
}

// The latest project blueprint (or a named one) — the definition source for
// create_template, and for the confirm preview of the tables it will template.
// A blueprintName is a best-effort hint: if it matches nothing (the agent often
// guesses casing/wording), fall back to the most recent blueprint so the confirm
// still previews real tables and execute templates the same one it previewed.
async function fetchLatestBlueprint(
  context: ProjectContext,
  blueprintName: string | undefined,
) {
  const found = await context.modules.blueprint
    .findMany({
      select: { displayName: true, definition: true },
      where: {
        databaseId: { equalTo: context.databaseId },
        ...(blueprintName ? { displayName: { equalTo: blueprintName } } : {}),
      },
      orderBy: ['CREATED_AT_DESC'],
      first: 1,
    })
    .unwrap();
  return found.blueprints?.nodes?.[0];
}

async function findProjectBlueprint(
  context: ProjectContext,
  blueprintName: string | undefined,
): Promise<{ displayName: string; definition: unknown } | null> {
  let node = await fetchLatestBlueprint(context, blueprintName);
  if (!node && blueprintName) node = await fetchLatestBlueprint(context, undefined);
  return node?.definition ? { displayName: node.displayName ?? '', definition: node.definition } : null;
}

export type CreateTemplatePreview = {
  blueprintName: string;
  tables: ConfirmPreviewTable[];
};

// The create_template confirm preview — the source blueprint's name and its
// tables, parsed into the shape the renderer's TableCard reuses. Best-effort: any
// failure yields no tables rather than blocking the confirm.
export async function createTemplatePreviewTables(
  context: ProjectContext,
  blueprintName: string | undefined,
): Promise<CreateTemplatePreview> {
  try {
    const blueprint = await findProjectBlueprint(context, blueprintName);
    if (!blueprint) return { blueprintName: '', tables: [] };
    return {
      blueprintName: blueprint.displayName,
      tables: parseTemplateTables(blueprint.definition),
    };
  } catch (err) {
    console.warn('[db-tools] create_template preview lookup failed:', err);
    return { blueprintName: '', tables: [] };
  }
}

async function resolveTemplateId(client: ModulesClient, displayName: string): Promise<string> {
  const result = await client.blueprintTemplate
    .findMany({
      select: { id: true, displayName: true },
      where: { displayName: { equalTo: displayName } },
      first: 1,
    })
    .unwrap();

  const template = result.blueprintTemplates?.nodes?.[0];
  if (!template?.id) throw new Error(`Template "${displayName}" not found`);
  return template.id;
}

function done(success: boolean, message: string) {
  return { content: [{ type: 'text' as const, text: message }], details: { success, message } };
}

// ── list_templates ────────────────────────────────────────────────────────

const ListTemplatesZod = z.object({});

export const listTemplatesTool: HarnessTool<typeof ListTemplatesZod, ListTemplatesDetails> = {
  name: 'list_templates',
  label: 'List templates',
  description:
    'List the blueprint templates available to provision into the project database (display name, description, categories, table count). Read-only — these are a global catalog, not the project schema.',
  promptSnippet:
    'list_templates: list the available blueprint templates to apply. Read-only — call before apply_template.',
  parameters: ListTemplatesZod,
  async execute(_params: z.infer<typeof ListTemplatesZod>, ctx) {
    const resolved = await resolveProjectContext(ctx.cwd);
    if (!resolved.context) {
      return { content: [{ type: 'text', text: resolved.reason }], details: { templates: [] } };
    }

    const result = await resolved.context.modules.blueprintTemplate
      .findMany({
        select: {
          displayName: true,
          description: true,
          categories: true,
          definition: true,
        },
        orderBy: ['NAME_ASC'],
      })
      .execute();

    if (!result.ok) {
      const message = result.errors.map((e) => e.message).join('; ');
      return {
        content: [{ type: 'text', text: `Failed to read templates: ${message}` }],
        details: { templates: [] },
      };
    }

    const templates: TemplateInfo[] = (result.data.blueprintTemplates?.nodes ?? []).map(
      (template) => ({
        displayName: template.displayName ?? '',
        description: template.description ?? null,
        categories: Array.isArray(template.categories) ? template.categories : [],
        tables: parseTemplateTables(template.definition),
      }),
    );

    return {
      content: [{ type: 'text', text: formatTemplatesText(templates) }],
      details: { templates },
    };
  },
};

// ── create_template ───────────────────────────────────────────────────────

const CreateTemplateZod = z.object({
  displayName: z.string().describe('Display name for the new blueprint template'),
  blueprintName: z
    .string()
    .describe(
      'Display name of an existing project blueprint to save as the template. Defaults to the most recently provisioned blueprint.',
    )
    .optional(),
  description: z.string().describe('Description shown in the template catalog').optional(),
  categories: z
    .array(z.string())
    .describe('Categories for catalog grouping and discovery')
    .optional(),
});

export const createTemplateTool: HarnessTool<typeof CreateTemplateZod, CreateTemplateDetails> = {
  name: 'create_template',
  label: 'Create template',
  description:
    'Save an existing project blueprint into the global template catalog as a reusable blueprint template. Defaults to the most recently provisioned blueprint; pass blueprintName to pick a specific one by display name. Gated.',
  promptSnippet:
    'create_template: save a project blueprint to the reusable template catalog. Gated.',
  parameters: CreateTemplateZod,
  async execute(params: z.infer<typeof CreateTemplateZod>, ctx) {
    const resolved = await resolveProjectContext(ctx.cwd);
    if (!resolved.context) return done(false, resolved.reason);
    const { modules, ownerId } = resolved.context;
    if (!ownerId) return done(false, 'Not authenticated (missing OWNER_ID in .env).');

    try {
      const blueprint = await findProjectBlueprint(resolved.context, params.blueprintName);
      if (!blueprint) {
        const which = params.blueprintName ? `"${params.blueprintName}"` : 'any blueprint';
        return done(false, `No project blueprint found (${which}). Provision a blueprint first.`);
      }

      const base = params.displayName.toLowerCase().replace(/\s+/g, '_');
      await modules.blueprintTemplate
        .create({
          data: {
            ownerId,
            name: `${base}_${Date.now()}`,
            displayName: params.displayName,
            description: params.description,
            categories: params.categories,
            definition: blueprint.definition as Record<string, unknown>,
          },
          select: { id: true, displayName: true },
        })
        .unwrap();

      const message = `Created template "${params.displayName}"`;
      return {
        content: [{ type: 'text' as const, text: message }],
        details: {
          success: true,
          message,
          displayName: params.displayName,
          blueprintName: blueprint.displayName,
          tables: parseTemplateTables(blueprint.definition),
        },
      };
    } catch (err) {
      return done(false, err instanceof Error ? err.message : 'Failed to create template');
    }
  },
};

// ── apply_template ────────────────────────────────────────────────────────

const ApplyTemplateZod = z.object({
  templateName: z.string().describe('The display name of the blueprint template to apply'),
  nameOverride: z
    .string()
    .describe(
      'Optional name override for the created blueprint (snake_case). Defaults to template name.',
    )
    .optional(),
});

export const applyTemplateTool: HarnessTool<typeof ApplyTemplateZod, TemplateDetails> = {
  name: 'apply_template',
  label: 'Apply template',
  description:
    'Apply an existing blueprint template to the project database, creating its tables. Use the template display name (from list_templates).',
  promptSnippet: 'apply_template: provision a saved blueprint template by display name. Gated.',
  parameters: ApplyTemplateZod,
  async execute(params: z.infer<typeof ApplyTemplateZod>, ctx) {
    const resolved = await resolveProjectContext(ctx.cwd);
    if (!resolved.context) return done(false, resolved.reason);
    const { modules, databaseId, schemaId, ownerId } = resolved.context;
    if (!ownerId) return done(false, 'Not authenticated (missing OWNER_ID in .env).');

    try {
      const templateId = await resolveTemplateId(modules, params.templateName);
      const base = params.nameOverride ?? params.templateName.toLowerCase().replace(/\s+/g, '_');
      const nameOverride = `${base}_${Date.now()}`;

      const copyResult = await modules.mutation
        .copyTemplateToBlueprint(
          { input: { templateId, databaseId, ownerId, nameOverride } },
          { select: { result: true } },
        )
        .unwrap();

      const blueprintId = copyResult.copyTemplateToBlueprint?.result;
      if (!blueprintId) throw new Error('Failed to copy template');

      const { tables } = await buildBlueprint(
        modules,
        { blueprintId, schemaId },
        { signal: ctx.signal },
      );

      const createdCount = Object.keys(tables).length;
      return done(
        true,
        `Applied template "${params.templateName}" — created ${createdCount} table${createdCount === 1 ? '' : 's'}`,
      );
    } catch (err) {
      return done(false, err instanceof Error ? err.message : 'Failed to apply template');
    }
  },
};

// ── update_template ───────────────────────────────────────────────────────

const UpdateTemplateZod = z.object({
  templateName: z.string().describe('The display name of the blueprint template to update'),
  patch: z.object({
    displayName: z.string().describe('New display name').optional(),
    description: z.string().describe('New description').optional(),
    categories: z.array(z.string()).describe('New categories').optional(),
    tags: z.array(z.string()).describe('New tags').optional(),
    visibility: z.enum(['private', 'public']).describe('New visibility').optional(),
  }),
});

export const updateTemplateTool: HarnessTool<typeof UpdateTemplateZod, TemplateDetails> = {
  name: 'update_template',
  label: 'Update template',
  description: 'Update a blueprint template’s metadata (display name, description, categories, tags, visibility).',
  promptSnippet: 'update_template: edit a saved template’s metadata by display name. Gated.',
  parameters: UpdateTemplateZod,
  async execute(params: z.infer<typeof UpdateTemplateZod>, ctx) {
    const resolved = await resolveProjectContext(ctx.cwd);
    if (!resolved.context) return done(false, resolved.reason);
    try {
      const templateId = await resolveTemplateId(resolved.context.modules, params.templateName);
      await resolved.context.modules.blueprintTemplate
        .update({
          where: { id: templateId },
          data: params.patch,
          select: { id: true, displayName: true },
        })
        .unwrap();
      return done(true, `Updated template "${params.templateName}"`);
    } catch (err) {
      return done(false, err instanceof Error ? err.message : 'Failed to update template');
    }
  },
};

// ── delete_template ───────────────────────────────────────────────────────

const DeleteTemplateZod = z.object({
  templateName: z.string().describe('The display name of the blueprint template to delete'),
});

export const deleteTemplateTool: HarnessTool<typeof DeleteTemplateZod, TemplateDetails> = {
  name: 'delete_template',
  label: 'Delete template',
  description: 'Permanently delete a blueprint template by its display name.',
  promptSnippet: 'delete_template: remove a saved template by display name. Destructive — gated.',
  parameters: DeleteTemplateZod,
  async execute(params: z.infer<typeof DeleteTemplateZod>, ctx) {
    const resolved = await resolveProjectContext(ctx.cwd);
    if (!resolved.context) return done(false, resolved.reason);
    try {
      const templateId = await resolveTemplateId(resolved.context.modules, params.templateName);
      await resolved.context.modules.blueprintTemplate
        .delete({ where: { id: templateId }, select: { id: true } })
        .unwrap();
      return done(true, `Deleted template "${params.templateName}"`);
    } catch (err) {
      return done(false, err instanceof Error ? err.message : 'Failed to delete template');
    }
  },
};
