# @agentic-kit/harness

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/constructive-io/constructive/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/constructive-io/constructive/actions/workflows/run-tests.yaml">
    <img height="20" src="https://github.com/constructive-io/constructive/actions/workflows/run-tests.yaml/badge.svg" />
  </a>
   <a href="https://github.com/constructive-io/constructive/blob/main/LICENSE"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/@agentic-kit/harness"><img height="20" src="https://img.shields.io/github/package-json/v/constructive-io/constructive?filename=agentic%2Fharness%2Fpackage.json"/></a>
</p>

Give your coding agent a backend. `@agentic-kit/harness` is the host-neutral core of the **Constructive harness** — skills releases, confirm gating, and blueprint logic that turn a generic coding agent into a secure, full-stack app builder.

```bash
npm install @agentic-kit/harness
```

Code only: **no skills are bundled**. Skills are pulled at runtime from [`constructive-skills`](https://github.com/constructive-io/constructive-skills) (plus your overlays), so guidance stays fresh without a host release.

## Features

- **Skill releases** — fetch a pinned release (npm version/range/dist-tag, or a git tag/semver/SHA/branch straight from GitHub), verified and cached under `~/.constructive/data/skills/<version>/`; offline falls back to the newest local release.
- **Ordered overlays** — layer skill sources (hardened base → team overlays → private known-gaps), last write wins by skill name, with include/exclude filters and transitive `requires:` expansion.
- **Confirm gating** — a host-neutral gate for mutating db tools: per-run decline memory (equivalent-args retries are auto-blocked), short-circuits for runnable projects, and structured previews your UI renders.
- **Run gate** — a policy (`allow` / `deny` / `ask`) plus an approval rendezvous, so a cloud run's `rm -rf` can be answered from a browser tab. The gate settles the decision and records it; an adapter only maps its harness's tool-call event onto it.
- **Neutral tool contract** — `HarnessTool`: a name, a label, a description, zod parameters, and `execute(params, { cwd, signal, onProgress })`. A tool states what it is and does; converting it to a vendor's tool shape is the adapter's job, so the same tools bind to a second harness untouched.
- **Harness adapter contract** — `HarnessAdapter` / `HarnessRun`: a harness is identified by an `id`, the `transcriptFormat` its entries are recorded under, and `startRun`. Nothing in the platform names a vendor.
- **Blueprint logic** — `expandBlueprintDefaults()`, the zod `BlueprintZod`/JSON-Schema `BlueprintSchema`, field type/default parsing, and policy-provisioning tables.
- **Appstash state** — everything lives in the [`appstash`](https://www.npmjs.com/package/appstash) `~/.constructive/{config,cache,data,logs}` layout; project directories are untouched.

## Quick start

```ts
import {
  DirectorySkillSource,
  fetchSkillsFromGit,
  harnessDirs,
  materializeSkills,
  resolveSkills,
} from '@agentic-kit/harness';

const dirs = harnessDirs();

const release = await fetchSkillsFromGit({
  repo: 'constructive-io/constructive-skills',
  pin: '^1.0.0',
  skillsRoot: dirs.skillsRoot,
});

const skills = await resolveSkills(
  {
    sources: [{ name: 'constructive-skills' }, { name: 'my-overlay' }],
    compatibleSkillsRange: '^1.0.0',
  },
  [
    new DirectorySkillSource('constructive-skills', release.skillsDir),
    new DirectorySkillSource('my-overlay', '/path/to/private/overlay'),
  ]
);

materializeSkills(dirs.materializedDir, skills, {
  templateVars: { HARNESS_TEMPLATES_DIR: '/path/to/templates' },
});
```

## API surface

- **Contracts** — `HarnessContext` / `HarnessCredentials` / `GateRequest`: hosts inject cwd, endpoints, credentials, and a confirm gate; the core owns everything host-neutral.
- **Dirs** — `harnessDirs()`: downloaded releases under `data/skills/<version>`, merged tree under `cache/skills-materialized`, update-check metadata in `cache/`.
- **Fetching** — `fetchSkillsRelease()` (npm), `fetchSkillsFromGit()` (GitHub tags/SHAs/branches via codeload tarballs), `latestLocalRelease()` (offline).
- **Freshness** — `checkForSkillsUpdate()` / `checkForSkillsUpdateFromGit()`: TTL-cached update checks that never throw, respect `compatibleSkillsRange`, and flag `harnessUpgradeRequired` when newer skills need newer tool code.
- **Resolution** — `SkillsManifest`, `DirectorySkillSource` (agentskills.io layout: `<skill>/SKILL.md` + references/scripts), `resolveSkills()`, `materializeSkills()` with `{{VAR}}` substitution.
- **Gating** — `createConfirmGate()`, `buildConfirmPrompt()`, `MUTATING_DB_TOOLS`, `ConfirmPreview`; adapters map host events onto `GateToolCallEvent`/`GateResult` 1:1.
- **Run gate** — `createRunGate()`, `RunGatePolicy` / `RunGateRule` / `RunGateVerdict`, `ApprovalChannel` with `pollingApprovalChannel()` / `staticApprovalChannel()`, and `RunGateDecisionRecord` for the audit trail.
- **Tools** — `HarnessTool`, `AnyHarnessTool`, `HarnessToolContext`, `HarnessToolResult`, `HarnessToolContent`, `defineHarnessTool()` (identity, for param inference).
- **Adapters** — `HarnessAdapter`, `HarnessRun`; [`@agentic-kit/pi`](https://www.npmjs.com/package/@agentic-kit/pi) is the first implementation, and its `toPiTool()` is the only place a tool meets a harness SDK.
- **Blueprints** — `expandBlueprintDefaults()`, `BlueprintZod`/`BlueprintSchema`, field types/defaults, policy provisioning.

## Hosts

The same harness powers multiple hosts:

```
@agentic-kit/protocol → agentic-kit → @agentic-kit/agent   (LLM/runtime substrate)
                                            ↓
                                  @agentic-kit/harness      (this package)
                                            ↓
     Constructive Desktop (Electron) | @agentic-kit/cli (`agent`) | your host
```

## Roadmap

- Lift the Constructive db tools out of `@agentic-kit/pi` into their own harness-neutral package, now that nothing in them names a harness.
- Shared host adapter package and `.claude`/MCP export surfaces.

## Related

- [`@agentic-kit/cli`](https://www.npmjs.com/package/@agentic-kit/cli) — `agent`, a local, secure-by-default coding agent built on this harness.
- [`agentic-kit`](https://www.npmjs.com/package/agentic-kit) — the umbrella package (chat + agent + harness).
- Planning: [constructive-planning#1273](https://github.com/constructive-io/constructive-planning/issues/1273), [#1274](https://github.com/constructive-io/constructive-planning/issues/1274), [#1277](https://github.com/constructive-io/constructive-planning/issues/1277).
