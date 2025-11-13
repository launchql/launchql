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

Let's build a simple pet adoption application. We'll create a workspace, add a module, and deploy it to Postgres—all with a few commands.

First, initialize a workspace:

```bash
lql init --workspace
```

This prompts you for a workspace name. Let's call it `pet-app`. LaunchQL creates a directory structure ready for multiple database modules:

```
pet-app/
├── launchql.config.js
├── packages/
└── package.json
```

The workspace is a pnpm monorepo. Each module you create will live in `packages/`, and LaunchQL handles the dependency resolution between them.

Now navigate into your workspace and create your first module:

```bash
cd pet-app
lql init
```

LaunchQL prompts you for a module name and which extensions you need. Let's call it `pets` and select `uuid-ossp` for UUID support:

```
? Enter the module name: pets
? Which extensions? uuid-ossp, plpgsql
```

LaunchQL scaffolds a complete module structure:

```
packages/pets/
├── pets.control
├── launchql.plan
├── deploy/
├── revert/
└── verify/
```

This is where developer productivity starts to shine. You didn't write boilerplate, configure build tools, or set up migration tracking. LaunchQL gave you a working module structure instantly, so you can focus on your schema.

## Building Your Schema

The `.control` file declares your module's metadata and dependencies:

```
# pets.control
comment = 'Pet adoption module'
default_version = '0.0.1'
requires = 'uuid-ossp,plpgsql'
```

Now let's add our first change. Navigate to your module and use `lql add`:

```bash
cd packages/pets
lql add
```

LaunchQL prompts you for the change name:

```
? Change name: create_pets_table
```

That's it! This command creates everything you need:
1. Adds the change to `launchql.plan`
2. Creates `deploy/create_pets_table.sql`
3. Creates `revert/create_pets_table.sql`
4. Creates `verify/create_pets_table.sql`

You can also specify the change name and options directly: `lql add create_pets_table --note "Adds the pets table"` if you prefer.

The plan file now looks like this:

```
%syntax-version=1.0.0
%project=pets
%uri=pets

create_pets_table 2025-11-13T00:00:00Z Author <author@example.com> # Adds the pets table
```

Now edit the generated `deploy/create_pets_table.sql`:

```sql
-- Deploy pets:create_pets_table to pg

BEGIN;

CREATE TABLE pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  species TEXT NOT NULL,
  age INTEGER,
  adopted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMIT;
```

LaunchQL generated the corresponding `revert/create_pets_table.sql`:

```sql
-- Revert pets:create_pets_table from pg

BEGIN;

DROP TABLE pets;

COMMIT;
```

And `verify/create_pets_table.sql`:

```sql
-- Verify pets:create_pets_table on pg

SELECT id, name, species, age, adopted, created_at
FROM pets
WHERE FALSE;
```

The verify script confirms the table exists with the expected columns. This is developer happiness through codegen—LaunchQL scaffolded the structure, you just fill in the schema.

## Deploying Your Module

Now comes the magic. First, create a database:

```bash
createdb petapp_dev
```

Make sure your PostgreSQL environment variables are set (you can export `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD` as needed). Then deploy:

```bash
lql deploy --database petapp_dev
```

LaunchQL asks if you want to proceed, then deploys your migrations in dependency order, tracks what's been applied, and wraps everything in a transaction for safety.

Behind the scenes, LaunchQL resolves the dependency graph and deploys `create_pets_table`. If anything fails, the transaction rolls back and your database stays clean.

You can verify the deployment worked:

```bash
psql -d petapp_dev -c "SELECT * FROM pets;"
```

The table exists, with UUID primary keys and proper constraints. You went from zero to a deployed schema in minutes.

## Composable Modules Across Projects

The real power emerges when you build multiple modules that depend on each other. Let's say you want to add an adoptions module that tracks which pets have been adopted.

Create a second module:

```bash
cd ../..  # Back to workspace root
lql init
```

Name it `adoptions` and add `pets` as a dependency. Update `adoptions.control`:

```
# adoptions.control
comment = 'Pet adoptions module'
default_version = '0.0.1'
requires = 'uuid-ossp,plpgsql,pets'
```

Now add a change:

```bash
cd packages/adoptions
lql add
```

When prompted, enter the change name:

```
? Change name: create_adoptions_table
```

LaunchQL creates the migration files. Now edit `deploy/create_adoptions_table.sql` to add the cross-module dependency:

```sql
-- Deploy adoptions:create_adoptions_table to pg
-- requires: pets:create_pets_table

BEGIN;

CREATE TABLE adoptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id),
  adopter_name TEXT NOT NULL,
  adoption_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMIT;
```

The `-- requires: pets:create_pets_table` line creates a cross-module dependency. When you deploy `adoptions`, LaunchQL automatically ensures `pets` is deployed first.

(You can also specify dependencies with the `--requires` flag when running `lql add` if you prefer: `lql add create_adoptions_table --requires pets:create_pets_table`)

This is the hybrid npm + Postgres module concept in action. You're building reusable database components with explicit dependencies, just like npm packages. But instead of JavaScript modules, you're composing PostgreSQL schemas.

Deploy the adoptions module:

```bash
lql deploy --database petapp_dev
```

LaunchQL detects that `adoptions` depends on `pets`, deploys both in the correct order, and tracks the entire dependency graph. You didn't manually deploy `pets` first or worry about ordering—the tools got out of the way.

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

LaunchQL follows Sqitch's deploy/verify/revert pattern, but with TypeScript performance. When you ran `lql add`, it created all three scripts for you:

- **Deploy**: Apply the change
- **Verify**: Confirm the change worked
- **Revert**: Roll back the change

Run verification to confirm your deployment:

```bash
lql verify
```

This runs all verify scripts to confirm your tables exist with the expected columns. If any verification fails, you'll know immediately.

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
cd pet-app
lql init
```

Add your first change:

```bash
cd packages/pets
lql add
```

When prompted, enter `create_pets_table` as the change name.

Start building. The tools are designed to get out of your way so you can focus on what matters: turning your ideas into working software.

Check out the [full documentation](https://github.com/launchql/launchql) to learn more about tagging versions, installing modules from npm, and advanced deployment strategies.

We're excited to see what you build.
