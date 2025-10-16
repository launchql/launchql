ARG BASE=postgres
ARG BASE_VERSION=13.3-alpine
FROM ${BASE}:${BASE_VERSION}

LABEL org.opencontainers.image.source="https://github.com/launchql/launchql"

# Install PGVector extension
RUN apk add --no-cache --virtual .build-deps \
      git \
      build-base \
      postgresql-dev \
      bash \
      make && \
    git clone --branch v0.5.1 https://github.com/pgvector/pgvector.git && \
    cd pgvector && make && make install && cd .. && rm -rf pgvector && \
    apk del .build-deps
