ARG BASE=postgres
ARG BASE_VERSION=13.3
FROM ${BASE}:${BASE_VERSION}

LABEL org.opencontainers.image.source="https://github.com/launchql/launchql"
ARG BASE
ARG BASE_VERSION
ENV BASE_VERSION=${BASE_VERSION}

# Install PostGIS extension
# - Detect PostgreSQL major version and install matching PostGIS packages
# - Handle archived Debian releases (Buster and earlier)
# - Ensure CA certificates exist before hitting apt-archive.postgresql.org over HTTPS
RUN set -eux; \
    export DEBIAN_FRONTEND=noninteractive; \
    PGDG_FILE="/etc/apt/sources.list.d/pgdg.list"; \
    # Temporarily disable PGDG so we can first try Debian's own repos
    [ -f "$PGDG_FILE" ] && mv "$PGDG_FILE" "$PGDG_FILE.disabled" || true; \
    \
    # If the base Debian release is EOL, switch to archive.debian.org for Debian repos
    if ! apt-get update 2>/dev/null; then \
      sed -i 's|http://deb.debian.org/debian|http://archive.debian.org/debian|g' /etc/apt/sources.list; \
      sed -i 's|http://security.debian.org/debian-security|http://archive.debian.org/debian-security|g' /etc/apt/sources.list; \
      sed -i '/-updates/d' /etc/apt/sources.list || true; \
    fi; \
    \
    # Update and install CA certificates so HTTPS apt repos work
    apt-get update; \
    apt-get install -y --no-install-recommends ca-certificates gnupg dirmngr; \
    update-ca-certificates || true; \
    \
    # Determine server major version
    PG_MAJOR=$(pg_config --version | sed 's/^PostgreSQL \([0-9]\+\).*/\1/'); \
    \
    # If Debian repos don't have PostGIS for this PG major, enable PGDG (archive only for EOL codenames)
    if ! apt-cache show "postgresql-${PG_MAJOR}-postgis-3" >/dev/null 2>&1; then \
      CODENAME=$(. /etc/os-release && echo "$VERSION_CODENAME"); \
      case "$CODENAME" in \
        stretch|buster) PGDG_URL="https://apt-archive.postgresql.org/pub/repos/apt" ;; \
        *)              PGDG_URL="https://apt.postgresql.org/pub/repos/apt" ;; \
      esac; \
      if [ -f "$PGDG_FILE.disabled" ]; then \
        sed -E 's#https?://(apt|apt-archive)\.postgresql\.org/pub/repos/apt#'"$PGDG_URL"'#g' "$PGDG_FILE.disabled" \
          | sed -E "s# (stretch|buster|bullseye|bookworm|trixie)-pgdg # ${CODENAME}-pgdg #g" \
          > "$PGDG_FILE"; \
        rm -f "$PGDG_FILE.disabled"; \
      else \
        echo "deb $PGDG_URL ${CODENAME}-pgdg main" > "$PGDG_FILE"; \
      fi; \
      apt-get update; \
    fi; \
    \
    # Install PostGIS matching PG major
    apt-get install -y --no-install-recommends \
      postgresql-${PG_MAJOR}-postgis-3 \
      postgresql-${PG_MAJOR}-postgis-3-scripts \
      postgis \
      make \
      bash; \
    rm -rf /var/lib/apt/lists/*
