# 🚀 Quickstart: LaunchQL CLI Basics

### 1. Install the CLI

Make sure you have the LaunchQL CLI available:

```bash
npm install -g @launchql/cli
```

### 2. Initialize a workspace

Generate a workspace along with its default services configuration:

```bash
lql init --workspace # then enter workspace name
cd myworkspace
```

### 3. Run Postgres locally

The workspace includes a docker-compose.yml you can use to start Postgres and supporting services:

```bash
docker-compose up -d
```

If you already have Postgres installed locally, just ensure it is running and accessible.

### 4. Create a module & add changes

```bash
lql init
cd packages/mymodule

# Add schema
lql add --change schemas/myschema

# Add table (depends on schema)
lql add --change schemas/myschema/tables/mytable --requires schemas/myschema
```

### 5. Example generated SQL

`deploy/schemas/myschema.sql`

```sql
-- Deploy: schemas/myschema to pg
-- made with <3 @ launchql.com
CREATE SCHEMA myschema;
```

`deploy/schemas/myschema/tables/mytable.sql`

```sql
-- Deploy: schemas/myschema/tables/mytable to pg
-- made with <3 @ launchql.com
-- requires: schemas/myschema

CREATE TABLE myschema.mytable (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);
```

### 6. Deploy to Postgres

```bash
lql deploy --database testdb --createdb --yes
```

**Sample output highlights:**

* Creates database `testdb`
* Installs declared extensions (`citext`, `pgcrypto`)
* Initializes migration schema
* Deploys schema + table successfully

```
[deploy] SUCCESS: 🚀 Starting deployment to database testdb...
[migrate] SUCCESS: Successfully deployed: schemas/myschema
[migrate] SUCCESS: Successfully deployed: schemas/myschema/tables/mytable
[deploy] SUCCESS: ✅ Deployment complete for mymodule.
```

### 7. Explore

```bash
lql explorer
```

http://localhost:5555/graphiql (default)
http://myschema.testdb.localhost:5555/graphiql (specific to a schema)


### 8. Server

```bash
lql server
```
