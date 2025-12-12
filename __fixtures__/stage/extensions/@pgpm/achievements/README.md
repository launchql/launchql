# @pgpm/achievements

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/launchql/launchql/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/launchql/pgpm-modules/actions/workflows/ci.yml">
    <img height="20" src="https://github.com/launchql/pgpm-modules/actions/workflows/ci.yml/badge.svg" />
  </a>
   <a href="https://github.com/launchql/pgpm-modules/blob/main/LICENSE"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/@pgpm/achievements"><img height="20" src="https://img.shields.io/github/package-json/v/launchql/pgpm-modules?filename=packages%2Fmetrics%2Fachievements%2Fpackage.json"/></a>
</p>

Achievement system for tracking user progress and milestones.

## Overview

`@pgpm/achievements` provides a comprehensive achievement and progression system for PostgreSQL applications. This package enables automatic tracking of user actions, milestone completion, and level-based progression through trigger-based automation. It integrates with JWT claims for user context and provides a flexible framework for gamification and user engagement.

## Features

- **Level-Based Progression**: Define achievement levels with specific requirements
- **Automatic Tracking**: Trigger-based achievement counting from any table
- **User Progress Queries**: Check completion status and remaining requirements
- **Row-Level Security**: Built-in RLS policies for user data isolation
- **JWT Integration**: Seamless user context via JWT claims
- **Flexible Requirements**: Support for multiple requirement types per level
- **Real-Time Updates**: Automatic achievement tallying via triggers

## Installation

If you have `pgpm` installed:

```bash
pgpm install @pgpm/achievements
pgpm deploy
```

This is a quick way to get started. The sections below provide more detailed installation options.

### Prerequisites

```bash
# Install pgpm CLI 
npm install -g pgpm

# Start local Postgres (via Docker) and export env vars
pgpm docker start
eval "$(pgpm env)"
```

> **Tip:** Already running Postgres? Skip the Docker step and just export your `PG*` environment variables.

### **Add to an Existing Package**

```bash
# 1. Install the package
pgpm install @pgpm/achievements

# 2. Deploy locally
pgpm deploy 
```

### **Add to a New Project**

```bash
# 1. Create a workspace
pgpm init --workspace

# 2. Create your first module
cd my-workspace
pgpm init

# 3. Install a package
cd packages/my-module
pgpm install @pgpm/achievements

# 4. Deploy everything
pgpm deploy --createdb --database mydb1
```

## Core Concepts

### Levels
Define progression stages (e.g., 'newbie', 'intermediate', 'expert') in the `status_public.levels` table.

### Level Requirements
Specify what actions users must complete for each level in `status_public.level_requirements`:
- **name**: Action identifier (e.g., 'complete_profile', 'upload_photo')
- **level**: Which level this requirement belongs to
- **required_count**: How many times the action must be performed
- **priority**: Display order for requirements

### User Achievements
Automatically maintained table tracking user progress in `status_public.user_achievements`:
- Updated by trigger functions
- Tallies completion counts per user per action
- Should not be manually modified

### User Steps
Individual action records in `status_public.user_steps` for detailed tracking.

## Usage

### Setting Up Levels and Requirements

```sql
-- Create achievement levels
INSERT INTO status_public.levels (name) VALUES
  ('newbie'),
  ('intermediate'),
  ('expert');

-- Define requirements for newbie level
INSERT INTO status_public.level_requirements (name, level, required_count, priority) VALUES
  ('complete_profile', 'newbie', 1, 1),
  ('upload_photo', 'newbie', 1, 2),
  ('make_first_post', 'newbie', 1, 3);

-- Define requirements for intermediate level
INSERT INTO status_public.level_requirements (name, level, required_count, priority) VALUES
  ('make_first_post', 'intermediate', 10, 1),
  ('receive_likes', 'intermediate', 50, 2);
```

### Adding Achievement Triggers

Use trigger functions to automatically track achievements when users perform actions:

#### tg_achievement
Increments achievement on any column change:

```sql
CREATE TRIGGER track_profile_completion
AFTER UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION status_private.tg_achievement('bio', 'complete_profile');
```

#### tg_achievement_toggle
Increments achievement on NULL → value transition (first-time actions):

```sql
CREATE TRIGGER track_photo_upload
AFTER UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION status_private.tg_achievement_toggle('profile_image', 'upload_photo');
```

#### tg_achievement_boolean
Increments achievement when column becomes TRUE:

```sql
CREATE TRIGGER track_email_verification
AFTER UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION status_private.tg_achievement_boolean('email_verified', 'verify_email');
```

#### tg_achievement_toggle_boolean
Increments only on FALSE/NULL → TRUE transition:

```sql
CREATE TRIGGER track_terms_acceptance
AFTER UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION status_private.tg_achievement_toggle_boolean('terms_accepted', 'accept_terms');
```

### Checking User Progress

```sql
-- Check what steps remain for a user to reach a level
SELECT * FROM status_public.steps_required('newbie', 'user-uuid');

-- Check if user has achieved a level
SELECT status_public.user_achieved('newbie', 'user-uuid');

-- View user's current achievements
SELECT * FROM status_public.user_achievements
WHERE user_id = 'user-uuid';
```

### Using JWT Context

The package integrates with `@pgpm/jwt-claims` for automatic user context:

```sql
-- Check current user's progress (uses JWT claims)
SELECT * FROM status_public.steps_required('newbie');

-- Check if current user achieved level
SELECT status_public.user_achieved('intermediate');
```

## Functions Reference

### status_public.steps_required(level_name, user_id)
Returns remaining requirements for a user to complete a level.

**Parameters:**
- `level_name` (text): Level to check
- `user_id` (uuid): User identifier (defaults to current JWT user)

**Returns:** Set of level_requirements with remaining counts

### status_public.user_achieved(level_name, user_id)
Checks if user has completed all requirements for a level.

**Parameters:**
- `level_name` (text): Level to check
- `user_id` (uuid): User identifier (defaults to current JWT user)

**Returns:** Boolean indicating completion status

## Trigger Functions

### status_private.tg_achievement(column_name, achievement_name)
Increments achievement on any column change.

### status_private.tg_achievement_toggle(column_name, achievement_name)
Increments achievement on NULL → value transition.

### status_private.tg_achievement_boolean(column_name, achievement_name)
Increments achievement when column becomes TRUE.

### status_private.tg_achievement_toggle_boolean(column_name, achievement_name)
Increments achievement on FALSE/NULL → TRUE transition.

## Example: Complete Achievement System

```sql
-- 1. Set up levels
INSERT INTO status_public.levels (name) VALUES ('beginner'), ('pro');

-- 2. Define requirements
INSERT INTO status_public.level_requirements (name, level, required_count, priority) VALUES
  ('complete_profile', 'beginner', 1, 1),
  ('make_post', 'beginner', 3, 2),
  ('make_post', 'pro', 50, 1),
  ('receive_likes', 'pro', 100, 2);

-- 3. Add triggers to track actions
CREATE TRIGGER track_profile
AFTER UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION status_private.tg_achievement_toggle('bio', 'complete_profile');

CREATE TRIGGER track_posts
AFTER INSERT ON posts
FOR EACH ROW
EXECUTE FUNCTION status_private.tg_achievement('id', 'make_post');

CREATE TRIGGER track_likes
AFTER INSERT ON likes
FOR EACH ROW
EXECUTE FUNCTION status_private.tg_achievement('id', 'receive_likes');

-- 4. Check user progress
SELECT * FROM status_public.steps_required('beginner', 'user-uuid');
SELECT status_public.user_achieved('beginner', 'user-uuid');
```

## Dependencies

- `@pgpm/jwt-claims`: JWT claim handling for user context
- `@pgpm/verify`: Verification utilities

## Testing

```bash
pnpm test
```

## Related Tooling

* [pgpm](https://github.com/launchql/launchql/tree/main/packages/pgpm): **🖥️ PostgreSQL Package Manager** for modular Postgres development. Works with database workspaces, scaffolding, migrations, seeding, and installing database packages.
* [pgsql-test](https://github.com/launchql/launchql/tree/main/packages/pgsql-test): **📊 Isolated testing environments** with per-test transaction rollbacks—ideal for integration tests, complex migrations, and RLS simulation.
* [supabase-test](https://github.com/launchql/launchql/tree/main/packages/supabase-test): **🧪 Supabase-native test harness** preconfigured for the local Supabase stack—per-test rollbacks, JWT/role context helpers, and CI/GitHub Actions ready.
* [graphile-test](https://github.com/launchql/launchql/tree/main/packages/graphile-test): **🔐 Authentication mocking** for Graphile-focused test helpers and emulating row-level security contexts.
* [pgsql-parser](https://github.com/launchql/pgsql-parser): **🔄 SQL conversion engine** that interprets and converts PostgreSQL syntax.
* [libpg-query-node](https://github.com/launchql/libpg-query-node): **🌉 Node.js bindings** for `libpg_query`, converting SQL into parse trees.
* [pg-proto-parser](https://github.com/launchql/pg-proto-parser): **📦 Protobuf parser** for parsing PostgreSQL Protocol Buffers definitions to generate TypeScript interfaces, utility functions, and JSON mappings for enums.

## Disclaimer

AS DESCRIBED IN THE LICENSES, THE SOFTWARE IS PROVIDED "AS IS", AT YOUR OWN RISK, AND WITHOUT WARRANTIES OF ANY KIND.

No developer or entity involved in creating this software will be liable for any claims or damages whatsoever associated with your use, inability to use, or your interaction with other users of the code, including any direct, indirect, incidental, special, exemplary, punitive or consequential damages, or loss of profits, cryptocurrencies, tokens, or anything else of value.
