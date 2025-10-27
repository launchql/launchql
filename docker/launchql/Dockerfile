ARG BASE=node
ARG BASE_VERSION=20-bookworm
FROM ${BASE}:${BASE_VERSION} AS build

LABEL org.opencontainers.image.source="https://github.com/launchql/launchql"
ARG BASE
ARG BASE_VERSION
ENV BASE_VERSION=${BASE_VERSION}

WORKDIR /app

# System deps for building native modules and tools used by the monorepo
RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends \
      ca-certificates curl git python3 make g++; \
    update-ca-certificates || true; \
    corepack enable; \
    corepack prepare yarn@1.22.22 --activate; \
    rm -rf /var/lib/apt/lists/*

# Copy full repo (build context must be repo root when building this image)
COPY . .

# Install and build all workspaces
RUN set -eux; \
    yarn install --frozen-lockfile; \
    yarn build

################################################################################
FROM ${BASE}:${BASE_VERSION} AS launchql

LABEL org.opencontainers.image.source="https://github.com/launchql/launchql"
WORKDIR /app

# Runtime deps (psql optional but handy for debugging)
RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends ca-certificates postgresql-client; \
    update-ca-certificates || true; \
    corepack enable; \
    corepack prepare yarn@1.22.22 --activate; \
    rm -rf /var/lib/apt/lists/*

# Copy built repo from builder
COPY --from=build /app /app

# Lightweight shims to expose CLI on PATH
RUN set -eux; \
    install -d /usr/local/bin; \
    printf '#!/usr/bin/env bash\nnode /app/packages/cli/dist/index.js "$@"\n' > /usr/local/bin/lql; \
    printf '#!/usr/bin/env bash\nnode /app/packages/cli/dist/index.js "$@"\n' > /usr/local/bin/launchql; \
    chmod +x /usr/local/bin/lql /usr/local/bin/launchql

ENTRYPOINT ["/usr/local/bin/lql"]
CMD ["--help"]
