---
imageSrc: '/public/posts/11-11-2025-launchql-workspaces/launchql.jpg'
publishedDate: '2025-11-11'
authorGithubId: pyramation
title: 'LaunchQL Workspaces - Modular Postgres in TypeScript'
description: 'Build composable database modules that work across projects. LaunchQL brings npm-style modularity to PostgreSQL with TypeScript-powered migrations.'
---

The best tools collapse the distance between inspiration and implementation. When you have an idea for a database-backed feature, you shouldn't spend hours setting up migration infrastructure, wrestling with dependency chains, or wondering if your schema changes will break something. You should be able to scaffold a module, define your schema, and deploy it—all in minutes.

LaunchQL workspaces make this possible by treating database schemas as composable modules. Each module is a self-contained package with its own migrations, dependencies, and version tags. You can build reusable database components that work across multiple projects, just like npm packages. The difference is that these modules deploy to PostgreSQL, with full dependency resolution and transactional safety built in.

## From Zero to Idea

Let's build a simple application with user authentication and posts. We'll create a workspace, add a module, and deploy it to Postgres—all with a few commands.

First, initialize a workspace:

```bash
lql init --workspace
```

This prompts you for a workspace name. Let's call it `my-app`. LaunchQL creates a directory structure ready for multiple database modules:

```
my-app/
├── launchql.config.js
├── packages/
└── package.json
```

The workspace is a pnpm monorepo. Each module you create will live in `packages/`, and LaunchQL handles the dependency resolution between them.

Now navigate into your workspace and create your first module:

```bash
cd my-app
lql init
```

LaunchQL prompts you for a module name and which extensions you need. Let's call it `auth-module` and select `uuid-ossp` for UUID support:

```
? Enter the module name: auth-module
? Which extensions? uuid-ossp, plpgsql, pgcrypto
```

LaunchQL scaffolds a complete module structure:

```
packages/auth-module/
├── auth-module.control
├── launchql.plan
├── deploy/
├── revert/
└── verify/
```

This is where developer productivity starts to shine. You didn't write boilerplate, configure build tools, or set up migration tracking. LaunchQL gave you a working module structure instantly, so you can focus on your schema.

## Building Your Schema

The `.control` file declares your module's metadata and dependencies:

```
# auth-module.control
comment = 'Authentication module'
default_version = '0.0.1'
requires = 'uuid-ossp,plpgsql,pgcrypto'
```

The `launchql.plan` file lists your migrations in order:

```
%syntax-version=1.0.0
%project=auth-module
%uri=auth-module

create_schema 2025-11-11T00:00:00Z Author <author@example.com> # Create auth schema
create_users_table 2025-11-11T00:01:00Z Author <author@example.com> # Users table
```

Now let's write the actual migrations. Create `deploy/create_schema.sql`:

```sql
-- Deploy auth-module:create_schema to pg

BEGIN;

CREATE SCHEMA auth;

COMMIT;
```

And `deploy/create_users_table.sql`:

```sql
-- Deploy auth-module:create_users_table to pg
-- requires: auth-module:create_schema

BEGIN;

CREATE TABLE auth.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMIT;
```

Notice the `-- requires:` comment. This declares that `create_users_table` depends on `create_schema`. LaunchQL uses these dependencies to determine the correct deployment order.

Each deploy script needs a corresponding revert script. Create `revert/create_users_table.sql`:

```sql
-- Revert auth-module:create_users_table from pg

BEGIN;

DROP TABLE auth.users;

COMMIT;
```

And `revert/create_schema.sql`:

```sql
-- Revert auth-module:create_schema from pg

BEGIN;

DROP SCHEMA auth;

COMMIT;
```

## Deploying Your Module

Now comes the magic. First, create a database and navigate to your module:

```bash
cd packages/auth-module
createdb myapp_dev
```

Make sure your PostgreSQL environment variables are set (you can export `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD` as needed). Then deploy:

```bash
lql deploy --database myapp_dev
```

LaunchQL asks if you want to proceed, then deploys your migrations in dependency order, tracks what's been applied, and wraps everything in a transaction for safety.

Behind the scenes, LaunchQL resolves the dependency graph, deploys `create_schema` first, then `create_users_table`. If anything fails, the transaction rolls back and your database stays clean.

You can verify the deployment worked:

```bash
psql -d myapp_dev -c "SELECT * FROM auth.users;"
```

The table exists, with UUID primary keys and proper constraints. You went from zero to a deployed schema in minutes.

## Composable Modules Across Projects

The real power emerges when you build multiple modules that depend on each other. Let's say you want to add a posts module that references users from the auth module.

Create a second module:

```bash
lql init
```

Name it `posts-module` and add `auth-module` as a dependency. Update `posts-module.control`:

```
# posts-module.control
comment = 'Posts module'
default_version = '0.0.1'
requires = 'uuid-ossp,plpgsql,auth-module'
```

Now create `deploy/create_posts_table.sql`:

```sql
-- Deploy posts-module:create_posts_table to pg
-- requires: auth-module:create_users_table

BEGIN;

CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMIT;
```

The `-- requires: auth-module:create_users_table` line creates a cross-module dependency. When you deploy `posts-module`, LaunchQL automatically ensures `auth-module` is deployed first.

This is the hybrid npm + Postgres module concept in action. You're building reusable database components with explicit dependencies, just like npm packages. But instead of JavaScript modules, you're composing PostgreSQL schemas.

Deploy the posts module:

```bash
cd packages/posts-module
lql deploy --database myapp_dev
```

LaunchQL detects that `posts-module` depends on `auth-module`, deploys both in the correct order, and tracks the entire dependency graph. You didn't manually deploy `auth-module` first or worry about ordering—the tools got out of the way.

## Recursive Deployment: LaunchQL-Native Power

Traditional migration tools like Sqitch deploy one project at a time. LaunchQL's recursive deployment is different—it treats your entire workspace as a cohesive system.

When you run `lql deploy`, LaunchQL:
1. Discovers all modules in your workspace
2. Resolves the complete dependency graph
3. Deploys modules in topological order
4. Tracks what's been applied across all modules

This recursive approach is LaunchQL-native. It means you can have complex multi-module applications where modules depend on each other, and LaunchQL handles the orchestration automatically.

Here's a real example from our test fixtures. We have three modules:

```
# my-first.control
requires = 'citext,plpgsql,pgcrypto'

# my-second.control  
requires = 'citext,plpgsql,pgcrypto,my-first'

# my-third.control
requires = 'citext,plpgsql,pgcrypto,my-second'
```

The dependency chain is `my-first` → `my-second` → `my-third`. Individual migrations can also declare cross-module dependencies:

```sql
-- Deploy my-third:create_schema to pg
-- requires: my-second:create_table

BEGIN;
CREATE SCHEMA mythirdapp;
COMMIT;
```

When you deploy `my-third`, LaunchQL deploys all three modules in order. One command, entire workspace deployed.

## Verify and Revert

LaunchQL follows Sqitch's deploy/verify/revert pattern, but with TypeScript performance. Each migration has three scripts:

- **Deploy**: Apply the change
- **Verify**: Confirm the change worked
- **Revert**: Roll back the change

Create `verify/create_users_table.sql`:

```sql
-- Verify auth-module:create_users_table on pg

SELECT id, email, created_at
FROM auth.users
WHERE FALSE;
```

This query confirms the table exists with the expected columns. If it fails, the verification fails.

Run verification:

```bash
lql verify
```

If you need to roll back a change:

```bash
lql revert
```

LaunchQL runs the revert scripts in reverse dependency order, ensuring your database returns to a clean state.

## Developer Productivity Through Strong Abstractions

LaunchQL's approach embodies several core principles that make developers more productive:

**Tools should get out of the way.** You don't manually track dependencies or worry about deployment order. LaunchQL's recursive deployment handles the orchestration, so you focus on your schema.

**Empower the builder, not the stack.** Your migrations are standard SQL with simple comment-based dependencies. You're not locked into proprietary syntax or complex configuration. The abstractions are strong but portable.

**From zero to idea.** You went from an empty directory to a deployed, multi-module database schema in minutes. The tooling collapsed the distance between your idea and working software.

LaunchQL uses a TypeScript-based migration engine that's significantly faster than legacy Perl-based tools. In our benchmarks, deploying complex schemas with multiple modules takes milliseconds, not seconds. This speed tightens the feedback loop—you make a change, deploy it, and see the results instantly.

## What's Next

You've built a modular Postgres application with composable schemas, automatic dependency resolution, and transactional safety. Your modules are reusable across projects, and your workspace structure scales from simple apps to complex systems.

But how do you test these modules? How do you verify that your RLS policies work, that your constraints are correct, that your functions behave as expected?

That's where [pgsql-test](./post-1) comes in. In the next post, we'll show you how to test your LaunchQL modules with ephemeral databases, role-based context switching, and millisecond-level feedback loops. Testing Postgres will feel as natural as testing your frontend code.

## Getting Started

Install LaunchQL CLI:

```bash
npm install -g @launchql/cli
```

Initialize a workspace:

```bash
lql init --workspace
cd my-app
lql init
```

Start building. The tools are designed to get out of your way so you can focus on what matters: turning your ideas into working software.

Check out the [full documentation](https://github.com/launchql/launchql) to learn more about tagging versions, installing modules from npm, and advanced deployment strategies.

We're excited to see what you build.
