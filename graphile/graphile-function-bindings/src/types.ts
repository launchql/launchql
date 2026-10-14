/**
 * A single ordered payload argument declaration from
 * function_definitions.payload_args ([{name, type}]).
 */
export interface PayloadArg {
  name: string;
  type: string;
}

/**
 * Minimal JSON Schema subset used for GraphQL input type derivation.
 * Runtime validation is intentionally NOT performed against this schema —
 * it is only used to shape the generated input types.
 */
export interface JsonSchemaNode {
  type?: string | string[];
  properties?: Record<string, JsonSchemaNode>;
  required?: string[];
  enum?: unknown[];
  items?: JsonSchemaNode;
  description?: string;
}

/**
 * A graphql-enabled function_api_bindings row joined to its
 * function_definitions row, loaded at gather time.
 */
export interface FunctionBindingRow {
  bindingId: string;
  alias: string;
  config: Record<string, unknown> | null;
  functionDefinitionId: string;
  taskIdentifier: string;
  description: string | null;
  payloadArgs: PayloadArg[] | null;
}

/**
 * Physical names of one function-module scope's compute tables, resolved
 * from the constructive metaschema (metaschema_modules_public.function_module
 * / function_invocation_module) by the express-context compute module loader.
 * The plugin never guesses or hard-codes physical names.
 */
export interface ComputeModuleNames {
  /** Schema containing the bindings and definitions tables. */
  computeSchema: string;
  /** Bindings table name. */
  bindingsTable: string;
  /** Definitions table name. */
  definitionsTable: string;
  /** Schema containing the invocations table. */
  invocationsSchema: string;
  /** Invocations table name. */
  invocationsTable: string;
  /**
   * Scope-key column of the invocations table (metaschema `entity_field`):
   * `database_id` for the database scope, `null` for global scopes. Set on
   * the invocation insert instead of switching on scope name.
   */
  invocationsEntityField: string | null;
}

export interface FunctionBindingsPluginOptions {
  /** Only bindings for this api are exposed as mutations. */
  apiId: string;
  /**
   * One entry per provisioned function-module scope. Bindings from every
   * module are exposed; RLS on the underlying tables governs access.
   */
  modules: ComputeModuleNames[];
}
