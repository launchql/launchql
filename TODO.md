TODO

- [ ] check bearer for a flush / special key

- [ ] deployment to fixtures was NOT working!!!! so check that out.

- [ ] verify toChange param!

- [ ] 'packages' hard coded?!?!?!

    if (isRoot) {
      const packagesDir = path.join(this.cwd, 'packages');
      fs.mkdirSync(packagesDir, { recursive: true });
      targetPath = path.join(packagesDir, modName);
    } else {


- [ ] does every proj.deploy() use proj.getModuleName()? ^^^^
- [ ] not just projectName? but also database???? 
packages/pgsql-test/src/seed/sqitch.ts
await proj.deploy(
    getEnvOptions({ 
        pg: ctx.config,
        deployment: {
        fast: false
        }
    }),
    proj.getModuleName(),
    ctx.config.database
    );


- [ ] fix/manage function sqitch(cwd?: string): SeedAdapter 


- [ ] DB_CWD, db.cwd ???? in types/src


- [x] switch package management to pnpm
- [ ] Add tests for pg-ast
- [ ] bring back csv-to-pg
- [ ] bootstrap-roles.sql and any other "bootstrap" can be included in actual code for onboarding

- [ ] validateDeployment - Hash-based change tracking — without deploying, hash the local .sql files against the changes that have been deployed, and ensure that the hashes match.

CI / Workflow
-------------
- [x] Remove Travis CI
- [ ] Fix Docker workflow to include extensions directories

Testing & Stability
-------------------
- [ ] Fix 'getOne(): handles missing selection gracefully' test (currently failing)
- [ ] Add tests for @launchql/react
- [x] Get testing framework working (this will be huge)

Package Cleanup
---------------
- [x] Remove shelljs
- [x] Remove deployFast option
- [ ] Add keywords to package.json files in all packages

CSV-to-PG Improvements
----------------------
- [ ] Use enum strings for operation types
- [ ] Add proper TypeScript types
- [ ] Integrate inquirer for interactive prompts

Module System
-------------
- [ ] Fix mod.setModuleDependencies(['some-native-module', 'pg-utilities']) — currently allows circular references
- [ ] Detect project dependencies from deploy/**/some.sql if not declared via moduleDependencies

Naming & Typing
---------------
- [ ] pg-ast should adopt pg-proto-parser's types (from @pgsql/utils in pgsql-parser monorepo)
      pg-ast is a much better name — use it!

Migration & History
-------------------
- [ ] Get this PR from launchql-gen: https://github.com/launchql/launchql-gen/pull/19
- [ ] Move postgraphile-* plugins over (preserve import history)
- [ ] Import original LaunchQL history (preserve git log)

Misc
----
- [ ] Fix issue where `some-schema` must be renamed to `some_schema` during packaging to work

Good Next Steps
---------------
- [x] Demo script using meta API to create tables
- [x] Get export working
- [x] Get boilerplate (`lql init`) working
- [ ] Get testing framework finalized

Other
---------
https://www.npmjs.com/package/pg-copy-streams-binary

New
---
- [ ] Investigate deployment failure when generating plans without packages and tags
      - Context: stage fixture (unique-names) pre-generated plan with includePackages=false and includeTags=false currently fails deployment (see test in packages/core/__tests__/migration/stage-deployment-with-plan.test.ts)
      - Follow-up: decide whether deploying with no external packages/tags should be supported or explicitly disallowed with clearer error messaging
