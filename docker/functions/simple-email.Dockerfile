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

# Install dependencies once for the whole workspace
RUN set -eux; \
    pnpm install --frozen-lockfile

# Build the simple-email function and its dependencies
ARG FUNCTION_DIR=functions/simple-email
RUN set -eux; \
    pnpm --filter "./${FUNCTION_DIR}"... build

################################################################################
FROM ${BASE}:${BASE_VERSION}

WORKDIR /app

RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends ca-certificates; \
    update-ca-certificates || true; \
    rm -rf /var/lib/apt/lists/*

# Copy the built repo from builder (keeps pnpm workspace wiring intact)
COPY --from=build /app /app

# simple-email function workspace directory
WORKDIR /app/functions/simple-email

ENV NODE_ENV=production

# Entry point for the simple-email function
CMD ["node", "dist/index.js"]

