
# Docker Images

This directory contains Dockerfiles for PostgreSQL-based images that extend the official PostgreSQL images with additional extensions and tools.

## Available Images

- **pgvector** - PostgreSQL with pgvector extension for vector similarity search
- **postgis** - PostgreSQL with PostGIS extension for spatial/geographic data
- **pgvector-postgis** - PostgreSQL with both pgvector and PostGIS extensions, plus CloudNativePG compatibility (pgaudit, pg-failover-slots, barman-cloud)
- **node-sqitch** - Node.js with Sqitch for database change management

## LaunchQL Main Image

The main LaunchQL application image (built from the codebase) is now at the **root** of the repository:
- **Dockerfile**: `/Dockerfile` (root level)
- **GitHub Action**: `.github/workflows/docker-launchql.yaml`

The base image and version are specified directly in the Dockerfile using ARG directives. This separation keeps codebase-dependent images separate from extension-only images.

## Building Images

### Building Extension Images (this directory)

```bash
# Build a specific process
make PROCESS=pgvector build-process

# Build all processes
make build-all

# Build and push a specific process
make PROCESS=pgvector-postgis build-push-process

# Build and push all processes
make build-push-all
```

### Building LaunchQL Image (root level)

```bash
# From the root of the repository (uses default versions from Dockerfile)
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --file Dockerfile \
  -t ghcr.io/launchql/launchql:latest \
  .

# Or override base/version with build args
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --build-arg BASE=node \
  --build-arg BASE_VERSION=22-bookworm \
  --file Dockerfile \
  -t ghcr.io/launchql/launchql:22-bookworm \
  .
```

## GitHub Actions

- **docker.yaml** - Builds extension images from this directory (pgvector, postgis, etc.)
- **docker-launchql.yaml** - Builds the main LaunchQL image from the root Dockerfile

## Version Configuration

Each image directory contains a `version.yaml` file that specifies:
- `base`: The base Docker image to use
- `versions`: List of version tags to build

Example:
```yaml
base: postgres
versions:
  - 14
  - 15
  - 16
```

