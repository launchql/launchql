ARG BASE=postgres
ARG BASE_VERSION=14
ARG BARMAN_VERSION=3.14.0
FROM ${BASE}:${BASE_VERSION}

LABEL org.opencontainers.image.source="https://github.com/launchql/launchql"
ARG BASE
ARG BASE_VERSION
ARG BARMAN_VERSION
ENV BASE_VERSION=${BASE_VERSION}
ENV PIP_BREAK_SYSTEM_PACKAGES=1

# Debian-based: install both pgvector and postgis from PGDG per-PG-major
# Plus CloudNativePG requirements: pgaudit, pg-failover-slots, barman-cloud
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
      postgresql-${PG_MAJOR}-pgaudit \
      postgresql-${PG_MAJOR}-pg-failover-slots \
      locales-all \
      build-essential \
      python3-dev \
      python3-pip \
      python3-psycopg2 \
      python3-setuptools \
      make \
      bash; \
    pip3 install --no-cache-dir barman[cloud,azure,snappy,google,zstandard,lz4]==${BARMAN_VERSION}; \
    apt-get remove -y --purge --autoremove build-essential python3-dev; \
    apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false; \
    rm -rf /var/lib/apt/lists/* /var/cache/* /var/log/*

# Change postgres user to UID 26 for CloudNativePG compatibility
RUN usermod -u 26 postgres

USER 26
