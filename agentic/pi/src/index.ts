import {
  configureHost,
  constructiveDbTools,
  createTemplatePreviewTables,
  resolveDataToken,
  resolveProjectContext,
  type ToolsHost,
} from '@agentic-kit/db-tools';
import type { ExtensionFactory } from '@earendil-works/pi-coding-agent';

import { createConfirmGate } from './confirm-gate';
import { toPiTool } from './pi-tool';

/**
 * The Constructive db tools bound to pi.
 *
 * The tools themselves live in `@agentic-kit/db-tools` and know nothing about
 * pi; this is the binding — `toPiTool` per tool, plus the confirm gate on pi's
 * `tool_call` event. A sibling adapter writes its own equivalent of this file
 * and registers the same `constructiveDbTools`.
 */
export const dbTools: ExtensionFactory = (pi) => {
  for (const tool of constructiveDbTools) {
    pi.registerTool(toPiTool(tool));
  }

  const gate = createConfirmGate({
    resolveProjectContext,
    resolveDataToken,
    createTemplatePreviewTables,
  });
  pi.on('agent_start', gate.onAgentStart);
  pi.on('tool_call', gate.onToolCall);
};

/** Configure the host and get the extension in one call. */
export function createDbTools(host: ToolsHost): ExtensionFactory {
  configureHost(host);
  return dbTools;
}

export {
  type ConfirmGate,
  type ConfirmGateDeps,
  type ConfirmGateOptions,
  createConfirmGate,
} from './confirm-gate';
export {
  type ComposedLanes,
  type ComposedRun,
  composeRun,
  type ComposeRunOptions,
  type GateLane,
  type MeteringLane,
  type PermissionsLane,
  type RunLogLane,
} from './embed/lanes';
export {
  type CreateResourceLoader,
  type EmbeddedRun,
  type PiModule,
  type ResourceLoaderRequest,
  startRun,
  type StartRunOptions,
} from './embed/session';
export {
  createGateExtension,
  type GateExtension,
  type GateExtensionOptions,
} from './extensions/gate';
export {
  createMeteredModelExtension,
  type MeteredModelExtension,
  type MeteredModelExtensionOptions,
  piProviderConfig,
} from './extensions/metered-model';
export {
  createPermissionsExtension,
  PERMISSION_GRANT_ENTRY,
  PERMISSION_INTERNAL_ERROR,
  PERMISSION_OUTPUT_WITHHELD,
  type PermissionDecisionRecord,
  type PermissionsExtension,
  type PermissionsExtensionOptions,
} from './extensions/permissions';
export {
  createRunLogExtension,
  MIRROR_EVENTS,
  type MirrorEvent,
  type RunLogExtension,
  type RunLogExtensionOptions,
} from './extensions/run-log';
export {
  createUsageReportExtension,
  type UsageReportExtension,
  type UsageReportExtensionOptions,
} from './extensions/usage-report';
export { PI_HARNESS_ID, piHarness, type PiHarnessRun } from './harness';
export { toPiTool, toPiTools } from './pi-tool';
/**
 * The db tools' own surface, re-exported so a pi host keeps one import. The
 * package to depend on directly is `@agentic-kit/db-tools`.
 */
export {
  type ActiveDataToken,
  configureHost,
  constructiveDbTools,
  CONTEXT_ENV_KEYS,
  CONTEXT_ENV_PREFIX,
  type ContextEnvKey,
  type ContextSource,
  createTemplatePreviewTables,
  type DataAuthBroker,
  DEFAULT_PROVISION_PRESET,
  deriveSubdomainEndpoint,
  fromEnvFile,
  fromEnvironment,
  getHost,
  type HostAccount,
  type HostBackendConfig,
  type HostProvisionOverlay,
  loadProvisionManifest,
  moduleKey,
  type ModulePreset,
  type ModulesClient,
  parseProvisionManifest,
  type PreviewToken,
  type ProjectContext,
  type ProjectContextFailureCode,
  PROVISION_MANIFEST_FILE,
  type ProvisionManifest,
  type ProvisionModule,
  type ProvisionOverlay,
  resolveDataToken,
  resolveProjectContext,
  resolveProvisionModules,
  type SecretDelivery,
  type StepUpRequest,
  toolSchema,
  type ToolsHost,
} from '@agentic-kit/db-tools';
export { allModulePresets, getModulePreset } from '@agentic-kit/db-tools';

export default dbTools;
