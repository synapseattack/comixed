# FROM openjdk:17-jdk-slim
FROM ghcr.io/linuxserver/baseimage-alpine:3.18

RUN apk update
RUN apk add -U --update --no-cache \
       openjdk17-jre \
       wget \
       bash \
       musl-locales \
       musl-locales-lang
#       locales \
#       locales-all
RUN rm -rf /var/lib/apt/lists/*
RUN locale -a

ENV LC_ALL en_US.UTF-8
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US.UTF-8
ENV PGID 1000
ENV PUID 1000

MAINTAINER The ComiXed Project "comixed-dev@freelists.org"

RUN mkdir -p /app /ul
WORKDIR /ul
# RUN wget -q -O comixed-release.zip https://github.com/comixed/comixed/releases/download/v2.0.0-0.dev/comixed-release-2.0.0-0.dev-GA.zip
RUN wget -q -O comixed-release.tar.gz https://github.com/synapseattack/comixed/releases/download/lsio-test-build/comixed-release-2.0.0-0.dev-local.tar.gz
RUN (cd /app; tar -xvzf /ul/*.tar.gz --strip-components=1)
RUN rm *.tar.gz
WORKDIR /app
RUN rm -r /ul

ENV PATH="$JAVA_HOME/bin:${PATH}"

EXPOSE 7171
VOLUME /comic_data
VOLUME /library
VOLUME /imports

CMD ["bash", "/app/bin/run.sh", "-L", "/library/comixed.log"]
