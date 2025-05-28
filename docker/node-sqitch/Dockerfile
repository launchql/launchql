FROM node:20.12.0-alpine3.19 AS sqitch-build


# Install system dependencies.
WORKDIR /work
ARG VERSION=1.1.0
RUN mkdir -p /usr/share/man/man1 /usr/share/man/man7 \
    && apk add --no-cache --virtual .build-deps \
        alpine-sdk \
        perl-dev \
        curl \
        postgresql-dev \
        perl-dbd-pg \ 
        tzdata \ 
        gnupg \
    && apk add --no-cache perl \
    && curl -LO https://www.cpan.org/authors/id/D/DW/DWHEELER/App-Sqitch-v$VERSION.tar.gz \
    && mkdir src \
    && tar -zxf App-Sqitch-v$VERSION.tar.gz --strip-components 1 -C src

# Install cpan and build dependencies.
ENV PERL5LIB /work/local/lib/perl5
RUN curl -sL --compressed https://git.io/cpm > cpm && chmod +x cpm \
    && ./cpm install -L local --verbose --no-test ExtUtils::MakeMaker \
    && ./cpm install -L local --verbose --no-test --with-recommends \
        --with-configure --cpanfile src/dist/cpanfile

ENV TZ UTC
RUN cp /usr/share/zoneinfo/UTC /etc/localtime && \
	echo UTC > /etc/timezone

# Build, test, bundle, prune.
WORKDIR /work/src

RUN perl Build.PL --quiet --install_base /app --etcdir /etc/sqitch \
    --config installman1dir= --config installsiteman1dir= --config installman3dir= --config installsiteman3dir= \
    --with postgres \
    && ln -s  /usr/include/ibase.h \
    # && ./Build test
    && ./Build bundle \
    && rm -rf /app/man \
    && find /app -name '*.pod' | grep -v sqitch | xargs rm -rf

RUN apk del .build-deps

################################################################################
# Copy to the final image without all the build stuff.

FROM node:20.12.0-alpine3.19 AS sqitch

# Install runtime system dependencies and remove unnecesary files.
RUN mkdir -p /usr/share/man/man1 /usr/share/man/man7 \
    && apk add --no-cache --virtual .build-deps2 \
        # perl \
        ca-certificates \
        # libpq5 \
        # postgresql-client \
    && apk add --no-cache \
        perl \
        postgresql-client \
        # ca-certificates \
        # libpq5 \
    && mkdir -p /etc/pki/tls && ln -s /etc/ssl/certs /etc/pki/tls/ \
    && rm -rf /var/cache/apt/* /var/lib/apt/lists/* /usr/bin/mysql?* \
    && rm -rf /plibs /man /usr/share/man /usr/share/doc /usr/share/postgresql \
        /usr/share/nano /etc/nanorc \
    && find / -name '*.pod' | grep -v sqitch | xargs rm -rf \
    && find / -name '*.ph' -delete \
    && find / -name '*.h' -delete 

# Copy the app and config from the build image.
COPY --from=sqitch-build /app .
COPY --from=sqitch-build /etc/sqitch /etc/sqitch/
COPY --from=sqitch-build /etc/localtime /etc/localtime 
COPY --from=sqitch-build /etc/timezone /etc/timezone 

RUN apk del .build-deps2

# Set up environment, entrypoint, and default command.
ENV LESS=-R LC_ALL=C.UTF-8 LANG=C.UTF-8 SQITCH_EDITOR=vi SQITCH_PAGER=less

# for gyp and such
RUN apk update && apk add --no-cache bash git python3-dev make g++

ENTRYPOINT ["/bin/sh"]