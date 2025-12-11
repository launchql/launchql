ARG BASE=node
ARG BASE_VERSION=20-bookworm

FROM ${BASE}:${BASE_VERSION} AS build

WORKDIR /app

# System deps and pnpm for building the monorepo
RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends \
      ca-certificates curl git python3 make g++; \
    update-ca-certificates || true; \
    npm install -g pnpm@10.10.0; \
    rm -rf /var/lib/apt/lists/*

# Build context MUST be the repo root when building this image
COPY . .

# Install dependencies and build the knative job service workspace
RUN set -eux; \
    pnpm install --frozen-lockfile; \
    pnpm --filter "@launchql/knative-job-service" build

################################################################################
FROM ${BASE}:${BASE_VERSION}

WORKDIR /app

RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends ca-certificates postgresql-client; \
    update-ca-certificates || true; \
    rm -rf /var/lib/apt/lists/*

# Copy the built repo from the builder (keeps pnpm workspace wiring intact)
COPY --from=build /app /app

ENV NODE_ENV=production

# knative-job-service workspace directory
WORKDIR /app/jobs/knative-job-service

# run.ts compiles to dist/run.js and boots worker + scheduler + callback server
CMD ["node", "dist/run.js"]

