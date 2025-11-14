# LaunchQL Course Plan

This document outlines a comprehensive course structure for teaching LaunchQL. Each course is designed with bite-sized lessons that focus on a single concept, command, or feature. Courses can be grouped into blog post announcements to help learners navigate their journey.

## Course Organization

Courses are organized by feature area, allowing learners to jump directly to what they need. A "Getting Started" track sequences lessons across courses for a beginner→advanced flow.

---

## Course 1: Modular PostgreSQL Development with Database Packages

**Target Audience:** Developers new to LaunchQL who want to understand workspace and module concepts.

**Prerequisites:** Docker, PostgreSQL basics, Node.js/pnpm installed.

**Code References:**
- `packages/cli/src/commands/init/` - Workspace and module initialization
- `packages/core/src/core/class/launchql.ts` - LaunchQLPackage class
- `packages/cli/__tests__/init.test.ts` - Init command tests

### Lessons

#### Lesson 1 — LaunchQL Workspaces: A New Way to Organize PostgreSQL Projects
*Understanding LaunchQL workspaces and modular PostgreSQL development*

- Understanding the workspace concept
- Benefits of modular PostgreSQL development
- Workspace vs module distinction

#### Lesson 2 — How to Initialize a Workspace for Modular PostgreSQL Development
*Setting up your development environment*

- Installing Docker and PostgreSQL
- Running `docker-compose up -d`
- Bootstrapping roles: `psql < bootstrap-roles.sql`
- Installing extensions: `docker exec postgres /sql-bin/install.sh`
- Setting up pg-env configuration (PGHOST, PGUSER, PGDATABASE)
- Command: `lql init --workspace`
- Understanding workspace structure
- The `launchql.json` configuration file
- Package patterns in workspace config
- CLI reference: `packages/cli/src/commands/init/workspace.ts`

#### Lesson 3 — Creating Your First PostgreSQL Database Module
*Initializing a LaunchQL module with deploy, revert, and verify scripts*

- Command: `lql init` (module mode)
- Understanding module structure: deploy/, revert/, verify/
- The `launchql.plan` file format
- The `.control` file and module metadata
- CLI reference: `packages/cli/src/commands/init/module.ts`

#### Lesson 4 — How Database Package Dependencies Work in PostgreSQL
*Understanding and managing module dependencies*

- Native PostgreSQL extensions (plpgsql, pgcrypto, postgis)
- LaunchQL module dependencies
- The `.control` file `requires` field
- Dependency resolution order
- How LaunchQL discovers modules in a workspace
- The `getModuleMap()` method
- Handling naming collisions (shortest path wins)
- API reference: `LaunchQLPackage.getModuleMap()` in `packages/core/src/core/class/launchql.ts`

#### Lesson 5 — Testing PostgreSQL Database Modules Locally
*Running and verifying database changes in your local environment*

- Using custom templates with `--repo owner/repo` for GitHub templates
- Using `--template-path` for local templates
- Using `--from-branch` to specify template branch
- When and why to customize templates
- Local testing strategies
- Verifying module structure

#### Lesson 6 — Running PostgreSQL Module Tests in GitHub Actions
*Automating module tests in CI/CD pipelines*

- Setting up GitHub Actions for LaunchQL
- Provisioning PostgreSQL in CI
- Running module tests automatically
- Handling test database cleanup

#### Lesson 7 — Scaling Applications with Modular PostgreSQL Packages
*Best practices for growing your database architecture*

- Module organization strategies
- Dependency management at scale
- Publishing and sharing modules
- Command: `lql package`
- Understanding the `dist/` directory
- API reference: `publishToDist()` in `packages/core/src/core/class/launchql.ts`

---

## Course 2: Working with Database Changes

**Target Audience:** Developers who need to add and manage database schema changes.

**Prerequisites:** Completed "Modular PostgreSQL Development with Database Packages" or equivalent knowledge.

**Code References:**
- `packages/cli/src/commands/add.ts` - Add command
- `packages/cli/src/commands/plan.ts` - Plan command
- `packages/core/src/files/plan/` - Plan file parsing and generation
- `packages/cli/__tests__/add.test.ts` - Add command tests

### Lessons

#### Lesson 1 — How to Add Your First Database Change to a LaunchQL Module
*Adding database changes with deploy, revert, and verify scripts*

- Command: `lql add schema_myapp`
- Understanding the three SQL files: deploy, revert, verify
- How changes are added to `launchql.plan`
- CLI reference: `packages/cli/src/commands/add.ts`

#### Lesson 2 — Organizing Database Changes with Nested Paths
*Creating hierarchical change structures for better organization*

- Command: `lql add tables/users`
- Organizing changes hierarchically
- Best practices for change naming
- Example: `schema/app/tables/users`

#### Lesson 3 — Managing Change Dependencies in PostgreSQL Migrations
*Defining and resolving dependencies between database changes*

- Command: `lql add contacts --requires users`
- Understanding dependency resolution
- Using multiple `--requires` flags
- Dependency syntax in SQL: `-- requires: users`

#### Lesson 4 — Documenting Database Changes with Notes and Comments
*Adding context and documentation to your migrations*

- Command: `lql add brands --note "Adds the brands table"`
- When and why to document changes
- Best practices for change descriptions

#### Lesson 5 — Writing Effective Deploy Scripts for PostgreSQL
*Creating forward migration SQL with best practices*

- Creating forward migration SQL
- Using transactions appropriately
- Idempotency considerations
- Common patterns: CREATE SCHEMA, CREATE TABLE, CREATE FUNCTION

#### Lesson 6 — Writing Revert Scripts for Safe Rollbacks
*Ensuring clean reversibility of database changes*

- Creating rollback SQL
- Ensuring clean reversibility
- Common patterns: DROP TABLE, DROP SCHEMA
- Testing revert scripts locally

#### Lesson 7 — Writing Verify Scripts to Validate Database State
*Creating verification SQL to ensure deployment success*

- Creating verification SQL
- What to verify: existence, structure, data integrity
- Using assertions and checks
- When verify scripts fail vs succeed

#### Lesson 8 — Understanding the LaunchQL Plan File Format
*Mastering plan file syntax and dependency declarations*

- Plan file syntax: `change: name [dep1 dep2] # comment`
- Tag syntax: `@tagname`
- How plan order affects deployment
- API reference: `parsePlanFile()` in `packages/core/src/files/plan/parser.ts`

#### Lesson 9 — Generating and Validating Deployment Plans
*Creating dependency graphs and detecting circular dependencies*

- Command: `lql plan`
- Understanding dependency graphs
- Detecting circular dependencies
- Plan validation utilities
- CLI reference: `packages/cli/src/commands/plan.ts`

---

## Course 3: Database Deployments and Migrations

**Target Audience:** Developers deploying database changes to local, staging, or production environments.

**Prerequisites:** Completed "Working with Database Changes" or equivalent knowledge.

**Code References:**
- `packages/cli/src/commands/deploy.ts` - Deploy command
- `packages/cli/src/commands/revert.ts` - Revert command
- `packages/cli/src/commands/verify.ts` - Verify command
- `packages/core/src/migrate/client.ts` - LaunchQLMigrate class
- `packages/cli/__tests__/deploy.test.ts` - Deploy command tests

### Lessons

#### Lesson 1 — Setting Up Your Target Database for LaunchQL Deployments
*Preparing PostgreSQL databases for migration deployment*

- Ensuring PostgreSQL is running
- Creating target database with `createdb`
- Using `--createdb` flag with deploy
- Environment variables for database connection

#### Lesson 2 — How to Deploy Database Changes with LaunchQL
*Running your first deployment and understanding the migration process*

- Command: `lql deploy --database mydb --package my-first --yes`
- Understanding what happens during deployment
- The `launchql_migrate` schema
- Tracking deployed changes
- CLI reference: `packages/cli/src/commands/deploy.ts`

#### Lesson 3 — Deploying to a Specific Change or Checkpoint
*Partial deployments and deployment targeting*

- Command: `lql deploy --to schema_myapp`
- Partial deployments
- Understanding deployment targets
- Target format: `package:change`
- API reference: `parseTarget()` in `packages/core/src/utils/target-utils.ts`

#### Lesson 4 — Using Tags for Database Version Control
*Tagging changes and deploying to specific versions*

- Command: `lql tag v1.0.0`
- Adding tags to specific changes: `lql tag v1.0.0 --changeName users`
- Deploying to a tag: `lql deploy --to @v1.0.0`
- Tag naming conventions and validation
- CLI reference: `packages/cli/src/commands/tag.ts`
- Tests: `packages/cli/__tests__/tags.test.ts`

#### Lesson 5 — Recursive vs Package-Only Deployment Strategies
*Understanding when to deploy dependencies vs single packages*

- Understanding `--recursive` flag (default: true)
- Using `--no-recursive` for single package deployment
- When to use each approach
- Cross-module dependency resolution
- Test reference: `packages/cli/__tests__/deploy.test.ts` (--no-recursive case)

#### Lesson 6 — Transaction Control in Database Deployments
*Managing transactional vs non-transactional deployments*

- Understanding `--tx` flag (default: true)
- Transactional vs non-transactional deployment
- When to disable transactions
- Rollback behavior on errors
- API reference: `LaunchQLMigrate.deploy()` with `useTransaction` option

#### Lesson 7 — Fast Deployment Mode for Production Environments
*Optimizing deployment speed with bundled SQL scripts*

- Understanding `--fast` flag
- Bundling SQL into single script
- Trade-offs: speed vs granular tracking
- When to use fast mode
- API reference: `packageModule()` in `packages/core/src/packaging/package.ts`

#### Lesson 8 — Previewing Deployments with Log-Only Mode
*Dry runs and deployment validation without execution*

- Command: `lql deploy --logOnly`
- Previewing deployments without execution
- Recording metadata without running SQL
- Validating deployment plans safely
- API reference: `deploy()` with `logOnly` parameter

#### Lesson 9 — Plan-Based vs SQL-Scanning Dependency Resolution
*Choosing the right dependency resolution strategy*

- Understanding `--usePlan` flag
- Plan-based vs SQL-scanning dependency resolution
- Performance implications
- API reference: `resolveDependencies()` in `packages/core/src/resolution/deps.ts`

#### Lesson 10 — How to Revert Database Changes Safely
*Rolling back deployments to previous states*

- Command: `lql revert --database mydb --package my-first`
- Reverting to a specific change: `lql revert --to users`
- Reverting to a tag: `lql revert --to @v1.0.0`
- Interactive change selection: `lql revert --to`
- CLI reference: `packages/cli/src/commands/revert.ts`

#### Lesson 11 — Verifying Database Deployment State
*Validating that deployments match expected state*

- Command: `lql verify --database mydb --package my-first`
- Verifying up to a specific change
- Understanding verification failures
- When to run verify (post-deployment, troubleshooting)
- CLI reference: `packages/cli/src/commands/verify.ts`
- API reference: `LaunchQLMigrate.verify()` in `packages/core/src/migrate/client.ts`

---

## Course 4: Migration Tracking and Status

**Target Audience:** Developers who need to inspect migration state and history.

**Prerequisites:** Completed "Database Deployments and Migrations" or equivalent knowledge.

**Code References:**
- `packages/cli/src/commands/migrate/` - Migrate subcommands
- `packages/core/src/migrate/client.ts` - LaunchQLMigrate methods
- `packages/core/src/migrate/sql/` - Migration schema SQL

### Lessons

#### Lesson 1 — Initializing Migration Tracking in PostgreSQL
*Setting up the launchql_migrate schema for deployment tracking*

- Command: `lql migrate init`
- Understanding the `launchql_migrate` schema
- Tables: packages, changes, dependencies, events
- Stored procedures: deploy(), revert(), verify(), status()
- CLI reference: `packages/cli/src/commands/migrate/init.ts`

#### Lesson 2 — Checking Migration Status for Your Database
*Viewing deployment status and recent changes*

- Command: `lql migrate status`
- Understanding status output: package, total deployed, last change
- Viewing recent changes
- Viewing pending changes
- CLI reference: `packages/cli/src/commands/migrate/status.ts`
- API reference: `LaunchQLMigrate.status()` in `packages/core/src/migrate/client.ts`

#### Lesson 3 — Listing All Database Changes and Their Status
*Viewing deployed vs pending changes across packages*

- Command: `lql migrate list`
- Viewing deployed vs pending changes
- Understanding change status indicators (✅ vs ⏳)
- Using `--all` flag for complete listing
- CLI reference: `packages/cli/src/commands/migrate/list.ts`

#### Lesson 4 — Visualizing Change Dependencies and Graphs
*Understanding dependency relationships between changes*

- Command: `lql migrate deps`
- Understanding dependency graphs
- Identifying cross-package dependencies
- Detecting circular dependencies
- CLI reference: `packages/cli/src/commands/migrate/deps.ts`

#### Lesson 5 — Querying Deployment History Programmatically
*Using LaunchQLMigrate API methods for custom tooling*

- Using `LaunchQLMigrate.getDeployedChanges()`
- Using `LaunchQLMigrate.getPendingChanges()`
- Using `LaunchQLMigrate.getRecentChanges()`
- Using `LaunchQLMigrate.isDeployed()`
- API reference: `packages/core/src/migrate/client.ts`

#### Lesson 6 — Understanding Migration Events and Audit Logs
*Tracking deployment events that survive rollbacks*

- The `launchql_migrate.events` table
- Event types: deploy, revert, verify
- Event persistence (survives rollbacks)
- Debugging failed deployments with event logs

#### Lesson 7 — Script Hash Verification for Security
*Detecting unauthorized modifications to deployed scripts*

- Understanding script hashes (SHA256)
- Content-based vs AST-based hashing
- Detecting unauthorized script modifications
- Using `DEPLOYMENT_HASH_METHOD` environment variable
- API reference: `calculateScriptHash()` in `packages/core/src/migrate/client.ts`

---

## Course 5: Module Dependencies and Extensions

**Target Audience:** Developers building modular database applications with shared dependencies.

**Prerequisites:** Completed "Modular PostgreSQL Development with Database Packages" or equivalent knowledge.

**Code References:**
- `packages/cli/src/commands/extension.ts` - Extension command
- `packages/cli/src/commands/install.ts` - Install command
- `packages/core/src/files/extension/` - Extension file handling
- `packages/cli/__tests__/extensions.test.ts` - Extension tests

### Lessons

#### Lesson 1 — Understanding PostgreSQL Extensions and LaunchQL Modules
*Native extensions vs LaunchQL module dependencies*

- Native PostgreSQL extensions (plpgsql, pgcrypto, postgis)
- LaunchQL module dependencies
- The `.control` file `requires` field
- Dependency resolution order

#### Lesson 2 — Adding Extensions to Your LaunchQL Module
*Managing module dependencies with the extension command*

- Command: `lql extension`
- Interactive extension selection
- Updating the `.control` file
- API reference: `setModuleDependencies()` in `packages/core/src/core/class/launchql.ts`

#### Lesson 3 — Installing Module Dependencies from Your Workspace
*Installing LaunchQL modules from local workspace*

- Command: `lql install <package>`
- Understanding workspace module discovery
- Installing from local workspace
- API reference: `installModules()` in `packages/core/src/core/class/launchql.ts`

#### Lesson 4 — Resolving Extension Dependency Trees
*Understanding transitive dependencies and circular detection*

- Understanding dependency trees
- Transitive dependencies
- Circular dependency detection
- API reference: `resolveExtensionDependencies()` in `packages/core/src/resolution/deps.ts`

#### Lesson 5 — Working with Cross-Module Dependencies
*Referencing changes from other modules in your workspace*

- Referencing changes from other modules
- Dependency syntax: `other-module:change-name`
- Ensuring proper deployment order
- Test reference: `packages/core/__tests__/resolution/sql-script-resolution-cross-dependencies.test.ts`

#### Lesson 6 — Publishing Modules to Distribution
*Packaging modules for sharing and deployment*

- Command: `lql package`
- Understanding the `dist/` directory
- Bundled SQL files and Makefiles
- API reference: `publishToDist()` in `packages/core/src/core/class/launchql.ts`

---

## Course 6: GraphQL API Development with LaunchQL

**Target Audience:** Developers building GraphQL APIs backed by PostgreSQL.

**Prerequisites:** PostgreSQL schema deployed, basic GraphQL knowledge.

**Code References:**
- `packages/cli/src/commands/server.ts` - Server command
- `packages/cli/src/commands/explorer.ts` - Explorer command
- `packages/server/` - LaunchQL server implementation
- `packages/graphile-settings/` - PostGraphile configuration

### Lessons

#### Lesson 1 — Starting Your First GraphQL Server with LaunchQL
*Launching a PostGraphile-powered GraphQL API*

- Command: `lql server`
- Selecting target database
- Understanding default configuration
- Server port and basic options
- CLI reference: `packages/cli/src/commands/server.ts`

#### Lesson 2 — Configuring GraphQL Server Options
*Customizing PostGraphile settings for your API*

- Using `--port` for custom port
- Using `--simpleInflection` for naming conventions
- Using `--oppositeBaseNames` for relationship naming
- Using `--postgis` for PostGIS support
- Using `--metaApi` for dynamic API configuration

#### Lesson 3 — Exploring Your GraphQL API with GraphiQL
*Using the interactive GraphiQL interface*

- Command: `lql explorer`
- Understanding the GraphiQL interface
- Setting CORS origin with `--origin`
- Interactive query building
- CLI reference: `packages/cli/src/commands/explorer.ts`

#### Lesson 4 — Understanding PostGraphile Plugins
*Extending your GraphQL API with powerful plugins*

- Connection filter plugin
- PostGIS plugin
- Fulltext filter plugin
- Many-to-many plugin
- i18n plugin
- Meta-schema plugin
- Configuration reference: `packages/graphile-settings/`

#### Lesson 5 — Implementing Row-Level Security (RLS) in Your GraphQL API
*Securing your API with PostgreSQL RLS policies*

- Understanding RLS policies in PostgreSQL
- How PostGraphile respects RLS
- Setting authentication context
- Role-based access control
- Middleware reference: `packages/server/src/middleware/auth.ts`

#### Lesson 6 — Building Multi-Tenant APIs with Meta Schema
*Dynamic API configuration for multi-tenant applications*

- Enabling Meta API mode
- Storing API configurations in PostgreSQL
- Multi-tenant API routing
- Domain/subdomain-based APIs
- API reference: `packages/server/src/middleware/api.ts`

#### Lesson 7 — Streaming File Uploads to S3 from GraphQL
*Handling file uploads with S3 integration*

- Understanding the upload pipeline
- Content-type detection with `mime-bytes`
- ETag calculation for S3 compatibility
- UUID generation from content
- Package reference: `packages/s3-streamer/`

---

## Course 7: Code Generation and Introspection

**Target Audience:** Developers who want to generate TypeScript types and GraphQL queries from their database schema.

**Prerequisites:** Deployed PostgreSQL schema, TypeScript project setup.

**Code References:**
- `packages/introspectron/` - Schema introspection
- `packages/launchql-gen/` - GraphQL query generation
- `packages/pg-codegen/` - TypeScript type generation
- Test files in respective `__tests__/` directories

### Lessons

#### Lesson 1 — Understanding PostgreSQL Schema Introspection
*What is introspectron and how it analyzes your database*

- What is introspectron?
- Connecting to PostgreSQL for schema analysis
- Generating SDK from schema
- Package reference: `packages/introspectron/`

#### Lesson 2 — Introspecting Your Database Schema
*Running introspection to extract schema metadata*

- Running introspection against a database
- Understanding introspection output
- Schema metadata and relationships
- Test reference: `packages/introspectron/__tests__/introspect.test.ts`

#### Lesson 3 — Auto-Generating GraphQL Queries from Your Schema
*Creating type-safe GraphQL queries automatically*

- Using `@launchql/launchql-gen`
- Auto-generating queries and mutations
- Using `gql-ast` for AST manipulation
- Package reference: `packages/launchql-gen/`

#### Lesson 4 — Generating TypeScript Types from PostgreSQL Schemas
*Creating TypeScript interfaces from database tables*

- Using `@launchql/pg-codegen`
- Generating types from PostgreSQL schemas
- Using `@babel/generator` for code generation
- Package reference: `packages/pg-codegen/`

#### Lesson 5 — Integrating Code Generation into Your Development Workflow
*Automating codegen in your build process*

- When to regenerate types
- Automating codegen in build scripts
- Version control considerations
- Keeping generated code in sync with schema

#### Lesson 6 — Working with Generated GraphQL Queries in TypeScript
*Using generated queries in client applications*

- Using generated queries in client applications
- Type safety with TypeScript
- Customizing generated queries
- Best practices for query organization

---

## Course 8: End-to-End PostgreSQL Testing

**Target Audience:** Developers who need to test PostgreSQL database logic, RLS policies, and queries.

**Prerequisites:** Basic testing knowledge (Jest or similar), PostgreSQL schema.

**Code References:**
- `packages/pgsql-test/` - PostgreSQL testing utilities
- `packages/pgsql-test/src/test-client.ts` - PgTestClient
- `packages/pgsql-test/src/manager.ts` - PgTestConnector
- Test examples throughout the codebase

### Lessons

#### Lesson 1 — Why End-to-End Testing Is Essential for PostgreSQL Applications
*Understanding the importance of database testing*

- Testing database logic vs application logic
- Ensuring RLS policies work correctly
- Catching schema migration issues early
- Testing complex queries and transactions

#### Lesson 2 — How to Spin Up Ephemeral PostgreSQL Databases for Testing
*Setting up isolated test databases with Docker*

- Installing `@launchql/pgsql-test`
- Configuring test database connection
- Understanding test database isolation
- Using Docker for test databases

#### Lesson 3 — Writing Reliable PostgreSQL Tests for CRUD and Query Logic
*Creating your first database test with PgTestClient*

- Using `PgTestClient`
- Writing a basic CRUD test
- Understanding test lifecycle
- Package reference: `packages/pgsql-test/src/test-client.ts`

#### Lesson 4 — How to Test Row-Level Security (RLS) in PostgreSQL
*Verifying RLS policies with authentication contexts*

- Setting authentication context with `auth()`
- Simulating different users and roles
- Verifying RLS policy enforcement
- Testing policy edge cases
- API reference: `PgTestClient.auth()` in `packages/pgsql-test/src/test-client.ts`

#### Lesson 5 — Advanced PostgreSQL Testing: Transactions, Roles, and Concurrency
*Testing complex database scenarios with transaction isolation*

- Understanding `beforeEach()` and `afterEach()`
- Automatic rollback with savepoints
- Ensuring test independence
- Testing multi-step transactions
- Testing concurrent operations
- API reference: `PgTestClient.beforeEach()` and `afterEach()`

#### Lesson 6 — Seeding PostgreSQL Databases for Test Environments (SQL, JSON, CSV, Programmatic)
*Loading test data from multiple sources*

- Using SQL INSERT statements
- Loading data from JSON files
- Loading data from CSV files
- Programmatic data seeding
- Using `publish()` to commit seed data

#### Lesson 7 — Advanced RLS Testing Scenarios: Simulating Many Users and Roles
*Testing multi-user and multi-tenant scenarios*

- Testing user isolation
- Testing role-based access
- Testing multi-tenant scenarios
- Switching between user contexts in tests
- Using `clearContext()` to reset session variables

#### Lesson 8 — Running PostgreSQL Tests Automatically in GitHub Actions
*Setting up CI/CD for database tests*

- Provisioning PostgreSQL in GitHub Actions
- Using Docker containers in CI
- Bootstrapping roles and extensions
- Running test suites automatically
- Workflow reference: `.github/workflows/run-tests.yaml`

#### Lesson 9 — Integrating PostgreSQL Testing into a Modern Developer Workflow
*Best practices for database testing in production applications*

- Managing test database connections with `PgTestConnector`
- Connection pooling in tests
- Cleaning up connections with `closeAll()`
- Teardown best practices
- API reference: `packages/pgsql-test/src/manager.ts`

---

## Course 9: Supabase Database Testing for TypeScript Developers

**Target Audience:** Developers building applications with Supabase who need to test database logic.

**Prerequisites:** Supabase project setup, TypeScript knowledge, basic testing knowledge.

**Code References:**
- `packages/supabase-test/` - Supabase testing utilities
- Built on top of `@launchql/pgsql-test`

### Lessons

#### Lesson 1 — The Core Challenges of Testing Supabase Databases
*Understanding Supabase-specific testing requirements*

- Supabase-specific schemas: auth, storage, functions
- Testing with system tables
- Local vs cloud testing
- Isolation challenges

#### Lesson 2 — How to Test a Supabase Database Locally
*Setting up local Supabase testing environment*

- Using Supabase CLI for local development
- Configuring test database connection
- Understanding Supabase schema structure
- Package reference: `packages/supabase-test/`

#### Lesson 3 — Running Supabase Tests with Isolated PostgreSQL Databases
*Creating ephemeral test databases for Supabase*

- Creating ephemeral test databases
- Applying Supabase migrations
- Ensuring test independence
- Cleanup strategies

#### Lesson 4 — How to Test RLS Policies in Supabase Projects
*Testing Supabase RLS policies with auth integration*

- Supabase RLS policy patterns
- Testing auth.users integration
- Testing JWT claims
- Simulating authenticated users

#### Lesson 5 — Seeding Supabase Projects: auth.users, Storage, and Core System Tables
*Populating Supabase system tables for testing*

- Seeding `auth.users` table
- Seeding storage buckets and objects
- Seeding function configurations
- Best practices for system table seeding

#### Lesson 6 — Testing Core Supabase Schemas: Storage, Functions, and Built‑in Policies
*Verifying Supabase storage and function integration*

- Testing storage policies
- Testing file upload/download
- Testing storage triggers
- Mocking storage operations
- Testing database functions
- Testing triggers and event handlers

#### Lesson 7 — Running Supabase Database Tests in GitHub Actions
*Automating Supabase tests in CI/CD*

- Setting up Supabase in GitHub Actions
- Provisioning Supabase services
- Running automated tests
- Handling Supabase-specific CI requirements

#### Lesson 8 — Fast TypeScript Workflows for Supabase Database Testing
*Optimizing test performance and developer experience*

- Integrating with Jest/Vitest
- Type-safe test helpers
- Reusable test fixtures
- Optimizing test performance

#### Lesson 9 — End-to-End Testing Strategies for Production-Grade Supabase Apps
*Testing complete user flows in Supabase applications*

- Testing complete user flows
- Testing real-time subscriptions
- Testing auth flows
- CI/CD integration

---

## Course 10: CI/CD and Automation

**Target Audience:** Developers setting up continuous integration and deployment for LaunchQL projects.

**Prerequisites:** Git/GitHub knowledge, basic CI/CD concepts, completed deployment course.

**Code References:**
- `.github/workflows/run-tests.yaml` - Main test workflow
- `.github/workflows/docker.yaml` - Docker image builds
- CI test examples throughout packages

### Lessons

#### Lesson 1 — Understanding LaunchQL in CI Environments
*Ephemeral databases and service containers for CI*

- Ephemeral databases for CI
- Service containers (PostgreSQL, MinIO)
- Environment variable management
- Secrets handling

#### Lesson 2 — Provisioning PostgreSQL for GitHub Actions
*Setting up PostgreSQL containers in CI pipelines*

- Using Docker containers in GitHub Actions
- Using `pyramation/pgvector:13.3-alpine` image
- Bootstrapping roles in CI
- Installing extensions in CI
- Workflow reference: `.github/workflows/run-tests.yaml`

#### Lesson 3 — Running Database Migrations in CI Pipelines
*Automating deployments in continuous integration*

- Using `lql deploy` in CI scripts
- Handling database creation
- Transaction control in CI
- Verifying deployments

#### Lesson 4 — Running PostgreSQL Tests in CI
*Automating test execution in GitHub Actions*

- Running package test suites
- Parallel vs sequential execution
- Handling test database cleanup
- Collecting test artifacts

#### Lesson 5 — Seeding Test Data in CI Environments
*Automating test data loading for CI tests*

- Automated data seeding scripts
- Using SQL files for seed data
- Using JSON/CSV for seed data
- Seed data version control

#### Lesson 6 — Managing Secrets and Environment Variables in CI
*Secure credential handling for database connections*

- GitHub Secrets for database credentials
- Using `list_secrets` to access secrets
- Environment-specific configuration
- Secure credential handling

#### Lesson 7 — Environment Promotion Patterns for Database Deployments
*Deploying from development to staging to production*

- Development → Staging → Production
- Using tags for version control
- Deployment approval workflows
- Rollback strategies

#### Lesson 8 — Monitoring and Debugging CI Deployments
*Viewing logs and debugging failed deployments*

- Viewing CI job logs
- Debugging failed deployments
- Event log analysis
- Performance monitoring

#### Lesson 9 — Optimizing CI Performance for LaunchQL Projects
*Speeding up CI pipelines with caching and parallelization*

- Caching dependencies
- Parallel test execution
- Fast deployment mode in CI
- Incremental migrations

---

## Course 11: Advanced LaunchQL Topics

**Target Audience:** Experienced LaunchQL users who need advanced features.

**Prerequisites:** Completed core courses, production experience with LaunchQL.

**Code References:**
- `packages/cli/src/commands/analyze.ts` - Analyze command
- `packages/cli/src/commands/rename.ts` - Rename command
- `packages/cli/src/commands/remove.ts` - Remove command
- `packages/core/src/files/types.ts` - Analysis types

### Lessons

#### Lesson 1 — Analyzing Package Health and Quality Metrics
*Detecting common issues in LaunchQL packages*

- Command: `lql analyze`
- Understanding analysis output
- Detecting common issues
- Package quality metrics
- CLI reference: `packages/cli/src/commands/analyze.ts`

#### Lesson 2 — Renaming Changes Safely in LaunchQL
*Updating change names while maintaining deployment history*

- Command: `lql rename`
- Understanding rename implications
- Updating dependencies
- Maintaining deployment history
- CLI reference: `packages/cli/src/commands/rename.ts`

#### Lesson 3 — Removing Changes from Plan Files
*Cleaning up plan files and handling deployed changes*

- Command: `lql remove`
- Understanding removal vs revert
- Cleaning up plan files
- Handling deployed changes
- CLI reference: `packages/cli/src/commands/remove.ts`

#### Lesson 4 — Exporting Module Definitions for Sharing
*Packaging modules for distribution across projects*

- Command: `lql export`
- Understanding export formats
- Sharing modules across projects
- CLI reference: `packages/cli/src/commands/export.ts`

#### Lesson 5 — Working with Forked Deployment Scenarios
*Handling divergent deployment histories*

- Understanding deployment forks
- Handling divergent histories
- Merging deployment branches
- Test reference: `packages/core/__tests__/projects/forked-deployment-scenarios.test.ts`

#### Lesson 6 — Revert Truncation Scenarios and Partial Rollbacks
*Understanding truncation in complex revert scenarios*

- Understanding truncation in reverts
- Partial rollbacks
- Dependency-aware reversion
- Test reference: `packages/core/__tests__/projects/revert-truncation-scenarios.test.ts`

#### Lesson 7 — Migrating from Sqitch to LaunchQL
*Importing existing Sqitch deployments*

- Understanding Sqitch compatibility
- Using `importFromSqitch()`
- Migration strategy
- Validation and testing
- API reference: `LaunchQLMigrate.importFromSqitch()` in `packages/core/src/migrate/client.ts`

#### Lesson 8 — Building Custom Templates for Workspaces and Modules
*Creating reusable templates for your organization*

- Creating custom workspace templates
- Creating custom module templates
- Template variables and rendering
- Sharing templates via GitHub
- Package reference: `packages/templatizer/`

#### Lesson 9 — Performance Optimization Strategies for Large Deployments
*Optimizing deployment speed and reliability*

- Using AST-based vs content-based hashing
- Caching deployment plans
- Fast deployment mode trade-offs
- Connection pooling best practices

---

## Learning Tracks

### Beginner Track: "Getting Started with LaunchQL"

**Goal:** Learn the fundamentals of LaunchQL workspace and module management.

**Sequence:**
1. Course 1: Modular PostgreSQL Development with Database Packages
2. Course 2: Working with Database Changes (Lessons 1-4)
3. Course 3: Database Deployments and Migrations (Lessons 1-3)
4. Course 5: Module Dependencies and Extensions (Lessons 1-2)

**Estimated Time:** 4-6 hours

---

### Intermediate Track: "Production Deployments"

**Goal:** Master deployment strategies and migration tracking.

**Sequence:**
1. Course 2: Working with Database Changes (Lessons 5-9)
2. Course 3: Database Deployments and Migrations (all lessons)
3. Course 4: Migration Tracking and Status (all lessons)
4. Course 5: Module Dependencies and Extensions (Lessons 3-6)

**Estimated Time:** 8-10 hours

---

### Testing Track: "Database Testing Mastery"

**Goal:** Build comprehensive test suites for PostgreSQL applications.

**Sequence:**
1. Course 8: End-to-End PostgreSQL Testing (all lessons)
2. Course 9: Supabase Database Testing (all lessons)
3. Course 10: CI/CD and Automation (Lessons 1-6)

**Estimated Time:** 10-12 hours

---

### API Development Track: "GraphQL APIs with LaunchQL"

**Goal:** Build and deploy GraphQL APIs backed by PostgreSQL.

**Sequence:**
1. Course 1: Modular PostgreSQL Development with Database Packages
2. Course 3: Database Deployments and Migrations (Lessons 1-3)
3. Course 6: GraphQL API Development with LaunchQL (all lessons)
4. Course 7: Code Generation and Introspection (all lessons)

**Estimated Time:** 8-10 hours

---

### Advanced Track: "LaunchQL Expert"

**Goal:** Master advanced features and optimization techniques.

**Sequence:**
1. Course 4: Migration Tracking and Status (all lessons)
2. Course 10: CI/CD and Automation (all lessons)
3. Course 11: Advanced LaunchQL Topics (all lessons)

**Estimated Time:** 10-12 hours

---

## Blog Post Groupings

### Blog Post 1: "Introducing LaunchQL: Modular PostgreSQL Development"
- Announce Course 1: Modular PostgreSQL Development with Database Packages
- Announce Course 2: Working with Database Changes
- Target: Developers new to LaunchQL

### Blog Post 2: "Mastering Database Deployments with LaunchQL"
- Announce Course 3: Database Deployments and Migrations
- Announce Course 4: Migration Tracking and Status
- Target: Teams deploying to production

### Blog Post 3: "Building GraphQL APIs with LaunchQL"
- Announce Course 6: GraphQL API Development
- Announce Course 7: Code Generation and Introspection
- Target: API developers

### Blog Post 4: "Testing PostgreSQL Applications the Right Way"
- Announce Course 8: End-to-End PostgreSQL Testing
- Announce Course 9: Supabase Database Testing
- Target: Quality-focused developers

### Blog Post 5: "LaunchQL in Production: CI/CD and Advanced Topics"
- Announce Course 10: CI/CD and Automation
- Announce Course 11: Advanced LaunchQL Topics
- Target: DevOps and senior developers

---

## Course Maintenance Notes

### Code References
All lessons include references to specific files in the codebase:
- CLI commands: `packages/cli/src/commands/`
- Core APIs: `packages/core/src/`
- Tests: `packages/*/tests/` or `packages/*/__tests__/`

### Testing Coverage
Lessons are grounded in tested functionality:
- Deploy/revert/verify: `packages/cli/__tests__/deploy.test.ts`
- Tags: `packages/cli/__tests__/tags.test.ts`
- Extensions: `packages/cli/__tests__/extensions.test.ts`
- Init: `packages/cli/__tests__/init.test.ts`
- Dependency resolution: `packages/core/__tests__/resolution/`

### Prerequisites Per Course
Each course lists specific prerequisites to ensure learners have the necessary background. The "Setting Up Your Development Environment" lesson in Course 1 covers the Docker and PostgreSQL setup from the repo notes.

### Lesson Size
Each lesson focuses on a single command, flag, concept, or API method to maintain the "bite-sized" requirement. Lessons are designed to be completed in 15-30 minutes each.
