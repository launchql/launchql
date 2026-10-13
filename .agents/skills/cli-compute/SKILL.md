---
name: cli-compute
description: CLI tool (csdk) for the compute API — provides CRUD commands for 123 tables and 64 custom operations
---

# cli-compute

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

CLI tool (csdk) for the compute API — provides CRUD commands for 123 tables and 64 custom operations

## Usage

```bash
# Context management
csdk context create <name> --endpoint <url>
csdk context use <name>

# Authentication
csdk auth set-token <token>

# Config variables
csdk config set <key> <value>
csdk config get <key>

# CRUD for any table (e.g. build)
csdk build list
csdk build get --id <value>
csdk build create --<field> <value>

# Non-interactive mode (skip all prompts, use flags only)
csdk --no-tty build list
```

## Examples

### Set up and query

```bash
csdk context create local --endpoint http://localhost:5000/graphql
csdk context use local
csdk auth set-token <token>
csdk build list
```

### Non-interactive mode (for scripts and CI)

```bash
csdk --no-tty build create --<field> <value>
```

## References

See the `references/` directory for detailed per-entity API documentation:

- [context](references/context.md)
- [auth](references/auth.md)
- [config](references/config.md)
- [embedder](references/embedder.md)
- [build](references/build.md)
- [build-step](references/build-step.md)
- [builder-binding](references/builder-binding.md)
- [content-preset](references/content-preset.md)
- [database-function-graph](references/database-function-graph.md)
- [database-function-graph-execution-cancel-request](references/database-function-graph-execution-cancel-request.md)
- [database-function-graph-execution](references/database-function-graph-execution.md)
- [database-function-graph-execution-node-state](references/database-function-graph-execution-node-state.md)
- [database-function-graph-execution-output](references/database-function-graph-execution-output.md)
- [database-graph-commit](references/database-graph-commit.md)
- [database-graph-get-all-tree-nodes-record](references/database-graph-get-all-tree-nodes-record.md)
- [database-graph-object](references/database-graph-object.md)
- [database-graph-ref](references/database-graph-ref.md)
- [database-graph-store](references/database-graph-store.md)
- [db-preset](references/db-preset.md)
- [function-api-binding](references/function-api-binding.md)
- [function-capability-binding](references/function-capability-binding.md)
- [function-definition](references/function-definition.md)
- [function-deployment](references/function-deployment.md)
- [function-deployment-event](references/function-deployment-event.md)
- [function-execution-log](references/function-execution-log.md)
- [function-graph-commit](references/function-graph-commit.md)
- [function-graph](references/function-graph.md)
- [function-graph-execution-cancel-request](references/function-graph-execution-cancel-request.md)
- [function-graph-execution](references/function-graph-execution.md)
- [function-graph-execution-node-state](references/function-graph-execution-node-state.md)
- [function-graph-execution-output](references/function-graph-execution-output.md)
- [function-graph-object](references/function-graph-object.md)
- [function-graph-ref](references/function-graph-ref.md)
- [function-graph-store](references/function-graph-store.md)
- [function-invocation-attempt](references/function-invocation-attempt.md)
- [function-invocation](references/function-invocation.md)
- [function-schedule](references/function-schedule.md)
- [get-all-tree-nodes-record](references/get-all-tree-nodes-record.md)
- [image](references/image.md)
- [image-grant](references/image-grant.md)
- [infra-commit](references/infra-commit.md)
- [infra-get-all-tree-nodes-record](references/infra-get-all-tree-nodes-record.md)
- [infra-object](references/infra-object.md)
- [infra-ref](references/infra-ref.md)
- [infra-store](references/infra-store.md)
- [integration-provider](references/integration-provider.md)
- [namespace](references/namespace.md)
- [namespace-event](references/namespace-event.md)
- [platform-build](references/platform-build.md)
- [platform-build-step](references/platform-build-step.md)
- [platform-builder-binding](references/platform-builder-binding.md)
- [platform-function-api-binding](references/platform-function-api-binding.md)
- [platform-function-capability-binding](references/platform-function-capability-binding.md)
- [platform-function-definition](references/platform-function-definition.md)
- [platform-function-deployment](references/platform-function-deployment.md)
- [platform-function-deployment-event](references/platform-function-deployment-event.md)
- [platform-function-execution-log](references/platform-function-execution-log.md)
- [platform-function-invocation-attempt](references/platform-function-invocation-attempt.md)
- [platform-function-invocation](references/platform-function-invocation.md)
- [platform-function-schedule](references/platform-function-schedule.md)
- [platform-image](references/platform-image.md)
- [platform-image-grant](references/platform-image-grant.md)
- [platform-infra-commit](references/platform-infra-commit.md)
- [platform-infra-get-all-tree-nodes-record](references/platform-infra-get-all-tree-nodes-record.md)
- [platform-infra-object](references/platform-infra-object.md)
- [platform-infra-ref](references/platform-infra-ref.md)
- [platform-infra-store](references/platform-infra-store.md)
- [platform-k-8-s-resource-kind](references/platform-k-8-s-resource-kind.md)
- [platform-k-8-s-spec-rule](references/platform-k-8-s-spec-rule.md)
- [platform-namespace](references/platform-namespace.md)
- [platform-namespace-event](references/platform-namespace-event.md)
- [platform-proposal-comment](references/platform-proposal-comment.md)
- [platform-proposal](references/platform-proposal.md)
- [platform-proposal-file-view](references/platform-proposal-file-view.md)
- [platform-proposal-reaction](references/platform-proposal-reaction.md)
- [platform-proposal-review](references/platform-proposal-review.md)
- [platform-proposals-chunk](references/platform-proposals-chunk.md)
- [platform-registry-binding](references/platform-registry-binding.md)
- [platform-registry](references/platform-registry.md)
- [platform-registry-grant](references/platform-registry-grant.md)
- [platform-repository](references/platform-repository.md)
- [platform-repository-event](references/platform-repository-event.md)
- [platform-repository-required-check](references/platform-repository-required-check.md)
- [platform-repository-workflow](references/platform-repository-workflow.md)
- [platform-resource](references/platform-resource.md)
- [platform-resource-declared-capacity](references/platform-resource-declared-capacity.md)
- [platform-resource-definition](references/platform-resource-definition.md)
- [platform-resource-event](references/platform-resource-event.md)
- [platform-resource-installation](references/platform-resource-installation.md)
- [platform-resource-observed-storage](references/platform-resource-observed-storage.md)
- [platform-resource-status-check](references/platform-resource-status-check.md)
- [platform-resource-usage-log](references/platform-resource-usage-log.md)
- [platform-resource-usage-summary](references/platform-resource-usage-summary.md)
- [platform-resource-utilization](references/platform-resource-utilization.md)
- [platform-resources-health](references/platform-resources-health.md)
- [platform-resources-requirements-state](references/platform-resources-requirements-state.md)
- [platform-resources-resolved-requirement](references/platform-resources-resolved-requirement.md)
- [platform-webhook-endpoint](references/platform-webhook-endpoint.md)
- [platform-webhook-event](references/platform-webhook-event.md)
- [proposal-comment](references/proposal-comment.md)
- [proposal](references/proposal.md)
- [proposal-file-view](references/proposal-file-view.md)
- [proposal-reaction](references/proposal-reaction.md)
- [proposal-review](references/proposal-review.md)
- [proposals-chunk](references/proposals-chunk.md)
- [registry-binding](references/registry-binding.md)
- [registry](references/registry.md)
- [registry-grant](references/registry-grant.md)
- [repository](references/repository.md)
- [repository-event](references/repository-event.md)
- [repository-required-check](references/repository-required-check.md)
- [repository-workflow](references/repository-workflow.md)
- [resource](references/resource.md)
- [resource-declared-capacity](references/resource-declared-capacity.md)
- [resource-definition](references/resource-definition.md)
- [resource-event](references/resource-event.md)
- [resource-installation](references/resource-installation.md)
- [resource-observed-storage](references/resource-observed-storage.md)
- [resource-status-check](references/resource-status-check.md)
- [resource-usage-log](references/resource-usage-log.md)
- [resource-usage-summary](references/resource-usage-summary.md)
- [resource-utilization](references/resource-utilization.md)
- [resources-health](references/resources-health.md)
- [resources-requirements-state](references/resources-requirements-state.md)
- [resources-resolved-requirement](references/resources-resolved-requirement.md)
- [webhook-endpoint](references/webhook-endpoint.md)
- [webhook-event](references/webhook-event.md)
- [database-read-function-graph](references/database-read-function-graph.md)
- [read-function-graph](references/read-function-graph.md)
- [add-edge](references/add-edge.md)
- [add-edge-and-save](references/add-edge-and-save.md)
- [add-node](references/add-node.md)
- [add-node-and-save](references/add-node-and-save.md)
- [approve-node](references/approve-node.md)
- [copy-graph](references/copy-graph.md)
- [database-add-edge](references/database-add-edge.md)
- [database-add-edge-and-save](references/database-add-edge-and-save.md)
- [database-add-node](references/database-add-node.md)
- [database-add-node-and-save](references/database-add-node-and-save.md)
- [database-approve-node](references/database-approve-node.md)
- [database-copy-graph](references/database-copy-graph.md)
- [database-create-function-graph](references/database-create-function-graph.md)
- [database-graph-init-empty-repo](references/database-graph-init-empty-repo.md)
- [database-graph-insert-node-at-path](references/database-graph-insert-node-at-path.md)
- [database-graph-insert-nodes-at-paths](references/database-graph-insert-nodes-at-paths.md)
- [database-graph-set-and-commit](references/database-graph-set-and-commit.md)
- [database-graph-set-data-at-path](references/database-graph-set-data-at-path.md)
- [database-graph-set-many-and-commit](references/database-graph-set-many-and-commit.md)
- [database-import-definitions](references/database-import-definitions.md)
- [database-import-graph-json](references/database-import-graph-json.md)
- [database-save-graph](references/database-save-graph.md)
- [database-start-execution](references/database-start-execution.md)
- [database-validate-function-graph](references/database-validate-function-graph.md)
- [function-execution-logs-append](references/function-execution-logs-append.md)
- [function-invocations-create-page](references/function-invocations-create-page.md)
- [function-invocations-create-sync](references/function-invocations-create-sync.md)
- [import-definitions](references/import-definitions.md)
- [import-graph-json](references/import-graph-json.md)
- [infra-init-empty-repo](references/infra-init-empty-repo.md)
- [infra-insert-node-at-path](references/infra-insert-node-at-path.md)
- [infra-insert-nodes-at-paths](references/infra-insert-nodes-at-paths.md)
- [infra-set-and-commit](references/infra-set-and-commit.md)
- [infra-set-data-at-path](references/infra-set-data-at-path.md)
- [infra-set-many-and-commit](references/infra-set-many-and-commit.md)
- [init-empty-repo](references/init-empty-repo.md)
- [insert-node-at-path](references/insert-node-at-path.md)
- [insert-nodes-at-paths](references/insert-nodes-at-paths.md)
- [platform-function-execution-logs-append](references/platform-function-execution-logs-append.md)
- [platform-function-invocations-create-page](references/platform-function-invocations-create-page.md)
- [platform-function-invocations-create-sync](references/platform-function-invocations-create-sync.md)
- [platform-infra-init-empty-repo](references/platform-infra-init-empty-repo.md)
- [platform-infra-insert-node-at-path](references/platform-infra-insert-node-at-path.md)
- [platform-infra-insert-nodes-at-paths](references/platform-infra-insert-nodes-at-paths.md)
- [platform-infra-set-and-commit](references/platform-infra-set-and-commit.md)
- [platform-infra-set-data-at-path](references/platform-infra-set-data-at-path.md)
- [platform-infra-set-many-and-commit](references/platform-infra-set-many-and-commit.md)
- [platform-resource-installations-install](references/platform-resource-installations-install.md)
- [platform-resource-installations-rollback](references/platform-resource-installations-rollback.md)
- [platform-resource-installations-uninstall](references/platform-resource-installations-uninstall.md)
- [platform-resource-installations-upgrade](references/platform-resource-installations-upgrade.md)
- [provision-bucket](references/provision-bucket.md)
- [resource-installations-install](references/resource-installations-install.md)
- [resource-installations-rollback](references/resource-installations-rollback.md)
- [resource-installations-uninstall](references/resource-installations-uninstall.md)
- [resource-installations-upgrade](references/resource-installations-upgrade.md)
- [save-graph](references/save-graph.md)
- [set-and-commit](references/set-and-commit.md)
- [set-data-at-path](references/set-data-at-path.md)
- [set-many-and-commit](references/set-many-and-commit.md)
- [start-execution](references/start-execution.md)
- [validate-function-graph](references/validate-function-graph.md)
