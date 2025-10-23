ARG BASE=postgres
ARG BASE_VERSION=14
FROM ${BASE}:${BASE_VERSION}

LABEL org.opencontainers.image.source="https://github.com/launchql/launchql"
ARG BASE
ARG BASE_VERSION
ENV BASE_VERSION=${BASE_VERSION}

# Debian-based: install both pgvector and postgis from PGDG per-PG-major
RUN set -eux; \
    export DEBIAN_FRONTEND=noninteractive; \
    apt-get update; \
    apt-get install -y --no-install-recommends ca-certificates curl gnupg dirmngr; \
    update-ca-certificates || true; \
    CODENAME=$(. /etc/os-release && echo "$VERSION_CODENAME"); \
    install -d -m 0755 /usr/share/keyrings; \
    curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor -o /usr/share/keyrings/postgresql.gpg; \
    echo "deb [signed-by=/usr/share/keyrings/postgresql.gpg] https://apt.postgresql.org/pub/repos/apt ${CODENAME}-pgdg main" > /etc/apt/sources.list.d/pgdg.list; \
    apt-get update; \
    PG_MAJOR=$(pg_config --version | sed 's/^PostgreSQL \([0-9]\+\).*/\1/'); \
    apt-get install -y --no-install-recommends \
      postgresql-${PG_MAJOR}-postgis-3 \
      postgresql-${PG_MAJOR}-postgis-3-scripts \
      postgis \
      postgresql-${PG_MAJOR}-pgvector \
      make \
      bash; \
    rm -rf /var/lib/apt/lists/*

