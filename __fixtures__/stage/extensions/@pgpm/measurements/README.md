# @pgpm/measurements

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/launchql/launchql/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/launchql/pgpm-modules/actions/workflows/ci.yml">
    <img height="20" src="https://github.com/launchql/pgpm-modules/actions/workflows/ci.yml/badge.svg" />
  </a>
   <a href="https://github.com/launchql/pgpm-modules/blob/main/LICENSE"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/@pgpm/measurements"><img height="20" src="https://img.shields.io/github/package-json/v/launchql/pgpm-modules?filename=packages%2Fmetrics%2Fmeasurements%2Fpackage.json"/></a>
</p>

Measurement utilities for performance tracking and analytics.

## Overview

`@pgpm/measurements` provides a standardized system for tracking measurements and quantities in PostgreSQL applications. This package defines a schema for storing measurement types with their units and descriptions, enabling consistent metric tracking across your application.

## Features

- **Quantity Definitions**: Store measurement types with units and descriptions
- **Standardized Units**: Define consistent units across your application
- **Fixture Data**: Pre-populated common measurement types
- **Extensible Schema**: Easy to add custom measurement types

## Installation

If you have `pgpm` installed:

```bash
pgpm install @pgpm/measurements
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
pgpm install @pgpm/measurements

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
pgpm install @pgpm/measurements

# 4. Deploy everything
pgpm deploy --createdb --database mydb1
```

## Core Schema

### measurements.quantities Table

Stores measurement type definitions:
- `id`: Serial primary key
- `name`: Measurement identifier (e.g., 'distance', 'weight', 'temperature')
- `label`: Display label
- `unit`: Unit of measurement (e.g., 'meters', 'kilograms', 'celsius')
- `unit_desc`: Unit description
- `description`: Measurement description

## Usage

### Defining Measurement Types

```sql
-- Add custom measurement types
INSERT INTO measurements.quantities (name, label, unit, unit_desc, description) VALUES
  ('distance', 'Distance', 'm', 'meters', 'Linear distance measurement'),
  ('weight', 'Weight', 'kg', 'kilograms', 'Mass measurement'),
  ('temperature', 'Temperature', '°C', 'celsius', 'Temperature measurement'),
  ('duration', 'Duration', 's', 'seconds', 'Time duration');
```

### Querying Measurement Types

```sql
-- Get all measurement types
SELECT * FROM measurements.quantities;

-- Find specific measurement
SELECT * FROM measurements.quantities
WHERE name = 'distance';

-- Get measurements by unit
SELECT * FROM measurements.quantities
WHERE unit = 'kg';
```

### Using Measurements in Application Tables

```sql
-- Create a table that references measurement types
CREATE TABLE sensor_readings (
  id serial PRIMARY KEY,
  quantity_id integer REFERENCES measurements.quantities(id),
  value numeric NOT NULL,
  recorded_at timestamptz DEFAULT now()
);

-- Record measurements
INSERT INTO sensor_readings (quantity_id, value)
SELECT id, 23.5
FROM measurements.quantities
WHERE name = 'temperature';

-- Query with measurement details
SELECT 
  sr.value,
  q.label,
  q.unit,
  sr.recorded_at
FROM sensor_readings sr
JOIN measurements.quantities q ON sr.quantity_id = q.id;
```

## Use Cases

### Performance Metrics

Track application performance measurements:
- Response times
- Query durations
- Resource usage
- Throughput rates

### IoT and Sensor Data

Store sensor readings with proper units:
- Temperature sensors
- Distance sensors
- Weight scales
- Environmental monitors

### Business Metrics

Track business measurements:
- Sales volumes
- Revenue amounts
- User counts
- Conversion rates

### Scientific Data

Store scientific measurements with proper units:
- Laboratory measurements
- Research data
- Experimental results

## Dependencies

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
