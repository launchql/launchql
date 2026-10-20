import type { AnyHarnessTool } from '@agentic-kit/harness';

import { configureHost, type ToolsHost } from './host';
import { addPoliciesTool } from './tools/add-policies';
import { addRecordsTool } from './tools/add-records';
import { addRelationTool } from './tools/add-relation';
import { createApiKeyTool } from './tools/create-api-key';
import { describeSchemaTool } from './tools/describe-schema';
import { manageEntityTypesTool } from './tools/manage-entity-types';
import { createFieldTool, deleteFieldTool, deleteTableTool, updateFieldTool } from './tools/mutations';
import { provisionBlueprintTool } from './tools/provision-blueprint';
import { provisionDatabaseTool } from './tools/provision-database';
import { runCodegenTool } from './tools/run-codegen';
import {
  applyTemplateTool,
  createTemplateTool,
  deleteTemplateTool,
  listTemplatesTool,
  updateTemplateTool,
} from './tools/templates';

/**
 * The Constructive database tools, in registration order.
 *
 * Plain `HarnessTool`s: a harness gets them by mapping them into its own tool
 * shape, which is the adapter's job, so this package stays free of any harness
 * dependency (see `toPiTool` in `@agentic-kit/pi` for that binding).
 */
export const constructiveDbTools: readonly AnyHarnessTool[] = [
  provisionDatabaseTool,
  describeSchemaTool,
  listTemplatesTool,
  provisionBlueprintTool,
  addRelationTool,
  deleteTableTool,
  createFieldTool,
  updateFieldTool,
  deleteFieldTool,
  addPoliciesTool,
  applyTemplateTool,
  createTemplateTool,
  updateTemplateTool,
  deleteTemplateTool,
  addRecordsTool,
  manageEntityTypesTool,
  createApiKeyTool,
  runCodegenTool,
];

/** Configure the host and get the tools in one call. */
export function createConstructiveDbTools(host: ToolsHost): readonly AnyHarnessTool[] {
  configureHost(host);
  return constructiveDbTools;
}

export {
  CONTEXT_ENV_KEYS,
  CONTEXT_ENV_PREFIX,
  type ContextEnvKey,
  type ContextSource,
  deriveSubdomainEndpoint,
  fromEnvFile,
  fromEnvironment,
  type ModulesClient,
  type ProjectContext,
  type ProjectContextFailureCode,
  resolveDataToken,
  resolveProjectContext,
  type ResolveResult,
} from './context';
export {
  type DatabaseProbe,
  probeBoundDatabase,
  probeDatabase,
  type UnreachableCause,
} from './db-probe';
export { constructiveGateDeps, type ConstructiveGateResolvers } from './gate';
export {
  type BackendErrorKind,
  classifyBackendErrors,
  type HttpGraphQLResponse,
  postGraphQL,
  statusAdapter,
} from './graphql-http';
export {
  type ActiveDataToken,
  configureHost,
  type DataAuthBroker,
  DEFAULT_DATA_TOKEN_SKEW_MS,
  getHost,
  type HostAccount,
  type HostBackendConfig,
  type HostProvisionOverlay,
  type PreviewToken,
  type ProjectBinding,
  type SecretDelivery,
  type StepUpRequest,
  type ToolsHost,
} from './host';
export {
  archiveBindingKeys,
  ARCHIVED_BINDING_KEYS,
  type EnvVars,
  mergeEnv,
  provisionEnvVars,
  readEnv,
} from './provision-database/env-file';
export {
  loadProvisionManifest,
  parseProvisionManifest,
  PROVISION_MANIFEST_FILE,
  type ProvisionManifest,
} from './provision-database/manifest';
export {
  allModulePresets,
  DEFAULT_PROVISION_PRESET,
  getModulePreset,
  type ModulePreset,
  type ProvisionModule,
} from './provision-database/presets';
export {
  provisionDatabase,
  type ProvisionDatabaseDetails,
  type ProvisionFailureCode,
  type ProvisionInput,
} from './provision-database/provision';
export {
  moduleKey,
  type ProvisionOverlay,
  resolveProvisionModules,
} from './provision-database/resolve';
export {
  accessOf,
  type ColumnDefault,
  type FkAction,
  type ModelColumn,
  type ModelForeignKey,
  type ModelPolicy,
  type ModelTable,
  type ObjectCategory,
  readSchemaModel,
  type SchemaModel,
  SchemaReadError,
  type TableAccess,
} from './schema-model';
export { toolSchema } from './tool-schema';
export { type AddRecordsDetails } from './tools/add-records';
export { type CreateApiKeyDetails } from './tools/create-api-key';
export { type RunCodegenDetails, type RunCodegenTimings } from './tools/run-codegen';
export { createTemplatePreviewTables } from './tools/templates';

export default constructiveDbTools;
