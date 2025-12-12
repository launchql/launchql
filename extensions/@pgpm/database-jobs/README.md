# @pgpm/database-jobs

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/launchql/launchql/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/launchql/pgpm-modules/actions/workflows/ci.yml">
    <img height="20" src="https://github.com/launchql/pgpm-modules/actions/workflows/ci.yml/badge.svg" />
  </a>
   <a href="https://github.com/launchql/pgpm-modules/blob/main/LICENSE"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/@pgpm/database-jobs"><img height="20" src="https://img.shields.io/github/package-json/v/launchql/pgpm-modules?filename=packages%2Fjobs%2Fdatabase-jobs%2Fpackage.json"/></a>
</p>

Database-specific job handling and queue management.

## Overview

`@pgpm/database-jobs` provides a complete PostgreSQL-based background job processing system with persistent queues, scheduled jobs, and worker management. This package implements a robust job queue system entirely within PostgreSQL, enabling reliable background task processing with features like job locking, retries, priorities, and cron-style scheduling.

## Features

- **Persistent Job Queue**: Store jobs in PostgreSQL with ACID guarantees
- **Job Scheduling**: Cron-style and rule-based job scheduling
- **Worker Management**: Multiple workers with job locking and expiry
- **Priority Queue**: Process jobs by priority and run time
- **Automatic Retries**: Configurable retry attempts with exponential backoff
- **Job Keys**: Upsert semantics for idempotent job creation
- **Queue Management**: Named queues with independent locking
- **Notifications**: PostgreSQL LISTEN/NOTIFY for real-time job processing

## Installation

If you have `pgpm` installed:

```bash
pgpm install @pgpm/database-jobs
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
pgpm install @pgpm/database-jobs

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
pgpm install @pgpm/database-jobs

# 4. Deploy everything
pgpm deploy --createdb --database mydb1
```

## Core Concepts

### Jobs Table

The `app_jobs.jobs` table stores active jobs with the following key fields:
- `id`: Unique job identifier
- `database_id`: Database/tenant identifier
- `task_identifier`: Job type/handler name
- `payload`: JSON data for the job
- `priority`: Lower numbers = higher priority (default: 0)
- `run_at`: When the job should run
- `attempts`: Current attempt count
- `max_attempts`: Maximum retry attempts (default: 25)
- `locked_by`: Worker ID that locked this job
- `locked_at`: When the job was locked
- `key`: Optional unique key for upsert semantics

### Scheduled Jobs Table

The `app_jobs.scheduled_jobs` table stores recurring jobs with cron-style or rule-based scheduling.

### Job Queues Table

The `app_jobs.job_queues` table tracks queue statistics and locking state.

## Usage

### Adding Jobs

```sql
-- Add a simple job
SELECT app_jobs.add_job(
  db_id := '5b720132-17d5-424d-9bcb-ee7b17c13d43'::uuid,
  identifier := 'send_email',
  payload := '{"to": "user@example.com", "subject": "Hello"}'::json
);

-- Add a job with priority and delayed execution
SELECT app_jobs.add_job(
  db_id := '5b720132-17d5-424d-9bcb-ee7b17c13d43'::uuid,
  identifier := 'generate_report',
  payload := '{"report_id": 123}'::json,
  run_at := now() + interval '1 hour',
  priority := 10,
  max_attempts := 5
);

-- Add a job with a unique key (upsert semantics)
SELECT app_jobs.add_job(
  db_id := '5b720132-17d5-424d-9bcb-ee7b17c13d43'::uuid,
  identifier := 'daily_summary',
  payload := '{"date": "2025-01-15"}'::json,
  job_key := 'daily_summary_2025_01_15',
  queue_name := 'reports'
);
```

### Getting Jobs (Worker Side)

```sql
-- Worker fetches next available job
SELECT * FROM app_jobs.get_job(
  worker_id := 'worker-1',
  task_identifiers := ARRAY['send_email', 'generate_report'],
  job_expiry := interval '4 hours'
);

-- Returns NULL if no jobs available
-- Returns job row if job was successfully locked
```

### Completing Jobs

```sql
-- Mark job as complete
SELECT app_jobs.complete_job(
  worker_id := 'worker-1',
  job_id := 123
);
```

### Failing Jobs

```sql
-- Mark job as failed (will retry if attempts < max_attempts)
SELECT app_jobs.fail_job(
  worker_id := 'worker-1',
  job_id := 123,
  error_message := 'Connection timeout'
);
```

### Scheduled Jobs

```sql
-- Schedule a job with cron-style timing
INSERT INTO app_jobs.scheduled_jobs (
  database_id,
  task_identifier,
  payload,
  schedule_info
) VALUES (
  '5b720132-17d5-424d-9bcb-ee7b17c13d43'::uuid,
  'cleanup_old_data',
  '{"days": 30}'::json,
  '{
    "hour": [2],
    "minute": [0],
    "dayOfWeek": [0, 1, 2, 3, 4, 5, 6]
  }'::json
);

-- Schedule a job with a rule (every minute for 3 minutes)
SELECT app_jobs.add_scheduled_job(
  db_id := '5b720132-17d5-424d-9bcb-ee7b17c13d43'::uuid,
  identifier := 'heartbeat',
  payload := '{}'::json,
  schedule_info := json_build_object(
    'start', now() + interval '10 seconds',
    'end', now() + interval '3 minutes',
    'rule', '*/1 * * * *'
  )
);

-- Run a scheduled job (creates a job in the jobs table)
SELECT * FROM app_jobs.run_scheduled_job(scheduled_job_id := 1);
```

## Functions Reference

### app_jobs.add_job(...)

Adds a new job to the queue or updates an existing job if a key is provided.

**Parameters:**
- `db_id` (uuid): Database/tenant identifier
- `identifier` (text): Job type/handler name
- `payload` (json): Job data (default: `{}`)
- `job_key` (text): Optional unique key for upsert (default: NULL)
- `queue_name` (text): Optional queue name (default: random UUID)
- `run_at` (timestamptz): When to run (default: now())
- `max_attempts` (integer): Maximum retries (default: 25)
- `priority` (integer): Job priority (default: 0)

**Returns:** `app_jobs.jobs` row

**Behavior:**
- If `job_key` is provided and exists, updates the job (if not locked)
- If job is locked, removes the key and creates a new job
- Triggers notifications for workers

### app_jobs.get_job(...)

Fetches and locks the next available job for a worker.

**Parameters:**
- `worker_id` (text): Unique worker identifier
- `task_identifiers` (text[]): Optional filter for job types (default: NULL = all)
- `job_expiry` (interval): How long before locked jobs expire (default: 4 hours)

**Returns:** `app_jobs.jobs` row or NULL

**Behavior:**
- Selects jobs by priority, run_at, and id
- Locks the job and its queue
- Increments attempt counter
- Uses `FOR UPDATE SKIP LOCKED` for concurrency

### app_jobs.complete_job(...)

Marks a job as successfully completed and removes it from the queue.

**Parameters:**
- `worker_id` (text): Worker that processed the job
- `job_id` (bigint): Job identifier

**Returns:** `app_jobs.jobs` row

### app_jobs.fail_job(...)

Marks a job as failed and schedules retry if attempts remain.

**Parameters:**
- `worker_id` (text): Worker that processed the job
- `job_id` (bigint): Job identifier
- `error_message` (text): Error description (default: NULL)

**Returns:** `app_jobs.jobs` row

**Behavior:**
- Records error message
- Unlocks the job for retry if attempts < max_attempts
- Permanently fails if max_attempts reached

### app_jobs.add_scheduled_job(...)

Creates a scheduled job with cron-style or rule-based timing.

**Parameters:**
- `db_id` (uuid): Database/tenant identifier
- `identifier` (text): Job type/handler name
- `payload` (json): Job data
- `schedule_info` (json): Scheduling configuration
- `job_key` (text): Optional unique key
- `queue_name` (text): Optional queue name
- `max_attempts` (integer): Maximum retries
- `priority` (integer): Job priority

**Returns:** `app_jobs.scheduled_jobs` row

### app_jobs.run_scheduled_job(...)

Executes a scheduled job by creating a job in the jobs table.

**Parameters:**
- `scheduled_job_id` (bigint): Scheduled job identifier

**Returns:** `app_jobs.jobs` row

## Job Processing Pattern

```sql
-- Worker loop (simplified)
LOOP
  -- 1. Get next job
  SELECT * FROM app_jobs.get_job('worker-1', ARRAY['my_task']);
  
  -- 2. Process job
  -- ... application logic ...
  
  -- 3. Mark as complete or failed
  IF success THEN
    SELECT app_jobs.complete_job('worker-1', job_id);
  ELSE
    SELECT app_jobs.fail_job('worker-1', job_id, error_msg);
  END IF;
END LOOP;
```

## Triggers and Automation

The package includes several triggers for automatic management:

- **timestamps**: Automatically sets created_at/updated_at
- **notify_worker**: Sends LISTEN/NOTIFY events when jobs are added
- **increase_job_queue_count**: Updates queue statistics on insert
- **decrease_job_queue_count**: Updates queue statistics on delete/update

## Dependencies

- `@pgpm/default-roles`: Role-based access control definitions
- `@pgpm/verify`: Verification utilities for database objects

## Testing

```bash
pnpm test
```

The test suite validates:
- Job creation and retrieval
- Scheduled job creation with cron and rule-based timing
- Job key upsert semantics
- Worker locking and concurrency

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
