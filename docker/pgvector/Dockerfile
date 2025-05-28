FROM pyramation/postgis:13.3-alpine

# Install PGVector extension
RUN apk add --no-cache --virtual .build-deps \
      git \
      build-base \
      postgresql-dev \
    && git clone --branch v0.5.1 https://github.com/pgvector/pgvector.git \
    && cd pgvector \
    && make && make install \
    && cd .. && rm -rf pgvector \
    && apk del .build-deps