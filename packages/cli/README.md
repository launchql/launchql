# LaunchQL CLI

**LaunchQL CLI** - Command-line interface for LaunchQL database-first GraphQL development

## NAME

**lql**, **launchql** - LaunchQL command-line interface for managing PostgreSQL-backed GraphQL projects

## SYNOPSIS

```
lql [GLOBAL_OPTIONS] <command> [COMMAND_OPTIONS] [ARGUMENTS]
launchql [GLOBAL_OPTIONS] <command> [COMMAND_OPTIONS] [ARGUMENTS]
```

## DESCRIPTION

LaunchQL CLI is a comprehensive command-line tool for building secure, role-aware GraphQL backends powered by PostgreSQL. It provides database-first development with automated schema generation, sophisticated migration management, and robust deployment capabilities.

The CLI supports both interactive prompts and command-line arguments, making it suitable for both development workflows and CI/CD automation.

## GLOBAL OPTIONS

**-h, --help**
    Display global help information and exit

**-v, --version**
    Display version information and exit

**--cwd** *DIRECTORY*
    Working directory (default: current directory)

## COMMANDS

### Core Database Operations

**deploy** - Deploy database changes and migrations
**verify** - Verify database state and migrations
**revert** - Revert database changes and migrations

### Project Management

**init** - Initialize LaunchQL workspace or module
**extension** - Manage module dependencies
**plan** - Generate module deployment plans
**package** - Package module for distribution

### Development Tools

**server** - Start LaunchQL GraphQL server
**explorer** - Launch GraphiQL explorer interface
**export** - Export database migrations from existing databases

### Database Administration

**kill** - Terminate database connections and optionally drop databases
**install** - Install LaunchQL modules
**tag** - Add tags to changes for versioning

### Migration Tools

**migrate** - Migration management subcommands
    - **init** - Initialize migration tracking
    - **status** - Show migration status
    - **list** - List all changes
    - **deps** - Show change dependencies

## COMMAND HELP

### Global Help

Display general CLI information and available commands:

```bash
lql --help
lql -h
launchql --help
launchql -h
```

### Individual Command Help

Get detailed help for specific commands:

```bash
lql <command> --help
lql <command> -h
```

Examples:
```bash
lql deploy --help
lql migrate --help
lql server -h
```

## DETAILED COMMAND REFERENCE

### deploy

Deploy database changes and migrations to target database.

**SYNOPSIS**
```
lql deploy [OPTIONS]
```

**OPTIONS**
- **--createdb** - Create database if it doesn't exist
- **--recursive** - Deploy recursively through dependencies
- **--package** *NAME* - Target specific package
- **--to** *TARGET* - Deploy to specific change or tag
- **--tx** - Use transactions (default: true)
- **--fast** - Use fast deployment strategy
- **--logOnly** - Log-only mode, skip script execution
- **--usePlan** - Use deployment plan
- **--cache** - Enable caching

**EXAMPLES**
```bash
# Deploy to selected database
lql deploy

# Deploy with database creation
lql deploy --createdb

# Deploy specific package to tag
lql deploy --package mypackage --to @v1.0.0

# Fast deployment without transactions
lql deploy --fast --no-tx
```

### verify

Verify database state matches expected migrations.

**SYNOPSIS**
```
lql verify [OPTIONS]
```

**OPTIONS**
- **--recursive** - Verify recursively through dependencies
- **--package** *NAME* - Verify specific package
- **--to** *TARGET* - Verify up to specific change or tag

**EXAMPLES**
```bash
# Verify current database state
lql verify

# Verify specific package
lql verify --package mypackage
```

### revert

Revert database changes and migrations.

**SYNOPSIS**
```
lql revert [OPTIONS]
```

**OPTIONS**
- **--recursive** - Revert recursively through dependencies
- **--package** *NAME* - Revert specific package
- **--to** *TARGET* - Revert to specific change or tag
- **--tx** - Use transactions (default: true)

**EXAMPLES**
```bash
# Revert latest changes
lql revert

# Revert to specific tag
lql revert --to @v1.0.0
```

### init

Initialize LaunchQL workspace or module.

**SYNOPSIS**
```
lql init [OPTIONS]
```

**OPTIONS**
- **--workspace** - Initialize workspace instead of module

**EXAMPLES**
```bash
# Initialize new module in existing workspace
lql init

# Initialize new workspace
lql init --workspace
```

### server

Start LaunchQL GraphQL development server.

**SYNOPSIS**
```
lql server [OPTIONS]
```

**OPTIONS**
- **--port** *NUMBER* - Server port (default: 5555)
- **--simpleInflection** - Use simple inflection (default: true)
- **--oppositeBaseNames** - Use opposite base names (default: false)
- **--postgis** - Enable PostGIS extension (default: true)
- **--metaApi** - Enable Meta API (default: true)

**EXAMPLES**
```bash
# Start server with defaults
lql server

# Start server on custom port
lql server --port 8080

# Start server without PostGIS
lql server --no-postgis
```

### explorer

Launch GraphiQL explorer interface.

**SYNOPSIS**
```
lql explorer [OPTIONS]
```

**OPTIONS**
- **--port** *NUMBER* - Server port (default: 5555)
- **--origin** *URL* - CORS origin URL (default: http://localhost:3000)
- **--simpleInflection** - Use simple inflection (default: true)
- **--oppositeBaseNames** - Use opposite base names (default: false)
- **--postgis** - Enable PostGIS extension (default: true)

**EXAMPLES**
```bash
# Launch explorer with defaults
lql explorer

# Launch explorer with custom origin
lql explorer --origin http://localhost:4000
```

### migrate

Migration management subcommands.

**SYNOPSIS**
```
lql migrate <subcommand> [OPTIONS]
```

**SUBCOMMANDS**
- **init** - Initialize migration tracking in database
- **status** - Show current migration status
- **list** - List all changes (deployed and pending)
- **deps** - Show change dependencies

**OPTIONS**
- **--help, -h** - Show migrate help message
- **--cwd** - Working directory (default: current directory)

**EXAMPLES**
```bash
# Initialize migration tracking
lql migrate init

# Check migration status
lql migrate status

# List all changes
lql migrate list

# Show dependencies
lql migrate deps
```

### kill

Terminate database connections and optionally drop databases.

**SYNOPSIS**
```
lql kill [OPTIONS]
```

**OPTIONS**
- **--drop** - Drop databases after killing connections (default: true)
- **--no-drop** - Only kill connections, don't drop databases

**EXAMPLES**
```bash
# Kill connections and drop selected databases
lql kill

# Only kill connections, preserve databases
lql kill --no-drop
```

### install

Install LaunchQL modules into current module.

**SYNOPSIS**
```
lql install <package>...
```

**ARGUMENTS**
- **package** - One or more package names to install

**EXAMPLES**
```bash
# Install single package
lql install @launchql/base32

# Install multiple packages
lql install @launchql/base32 @launchql/utils
```

### tag

Add tags to changes for versioning.

**SYNOPSIS**
```
lql tag [tag_name] [OPTIONS]
```

**ARGUMENTS**
- **tag_name** - Name of the tag to create

**OPTIONS**
- **--package** *NAME* - Target specific package
- **--changeName** *NAME* - Target specific change (default: latest)
- **--comment** *TEXT* - Optional tag comment

**EXAMPLES**
```bash
# Add tag to latest change
lql tag v1.0.0

# Add tag with comment
lql tag v1.0.0 --comment "Initial release"

# Tag specific change in package
lql tag v1.1.0 --package mypackage --changeName my-change
```

### extension

Manage module dependencies interactively.

**SYNOPSIS**
```
lql extension
```

**DESCRIPTION**
Interactive command to select which modules the current module depends on.

**EXAMPLES**
```bash
# Manage current module dependencies
lql extension
```

### plan

Generate module deployment plans.

**SYNOPSIS**
```
lql plan
```

**DESCRIPTION**
Generates deployment plans for the current module, including package dependencies.

**EXAMPLES**
```bash
# Generate deployment plan
lql plan
```

### package

Package module for distribution.

**SYNOPSIS**
```
lql package [OPTIONS]
```

**OPTIONS**
- **--plan** - Include deployment plan (default: true)
- **--pretty** - Pretty-print output (default: true)
- **--functionDelimiter** *DELIMITER* - Function delimiter (default: $EOFCODE$)

**EXAMPLES**
```bash
# Package with defaults
lql package

# Package without plan
lql package --no-plan
```

### export

Export database migrations from existing databases.

**SYNOPSIS**
```
lql export
```

**DESCRIPTION**
Interactive command to export migrations from existing databases. Guides through database selection, schema selection, and migration generation.

**EXAMPLES**
```bash
# Export migrations interactively
lql export
```

## ENVIRONMENT VARIABLES

LaunchQL CLI respects standard PostgreSQL environment variables:

- **PGHOST** - PostgreSQL host
- **PGPORT** - PostgreSQL port
- **PGDATABASE** - Default database name
- **PGUSER** - PostgreSQL username
- **PGPASSWORD** - PostgreSQL password

## FILES

- **launchql.config.js** - LaunchQL configuration file
- **package.json** - Module package configuration
- **sql/** - SQL migration files
- **plans/** - Deployment plan files

## EXIT STATUS

- **0** - Success
- **1** - General error
- **2** - Invalid command or arguments

## EXAMPLES

### Basic Workflow

```bash
# Initialize new workspace
lql init --workspace

# Initialize new module
cd packages/
lql init

# Deploy changes
lql deploy

# Start development server
lql server
```

### Advanced Deployment

```bash
# Deploy specific package to production
lql deploy --package myapp --to @production

# Verify deployment
lql verify --package myapp --to @production

# Revert if needed
lql revert --package myapp --to @previous-tag
```

### Development Workflow

```bash
# Start explorer for GraphQL development
lql explorer --port 4000

# Add dependencies to current module
lql extension

# Generate deployment plan
lql plan

# Package for distribution
lql package
```

## SEE ALSO

- LaunchQL Documentation: https://github.com/launchql/launchql
- PostGraphile: https://www.graphile.org/postgraphile/
- PostgreSQL: https://www.postgresql.org/

## AUTHORS

LaunchQL CLI is developed by the LaunchQL team.

## REPORTING BUGS

Report bugs at: https://github.com/launchql/launchql/issues

