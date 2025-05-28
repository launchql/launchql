# pgvector/Dockerfile

FROM pyramation/node-sqitch:20.12.0

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

ENTRYPOINT ["/bin/sh"]