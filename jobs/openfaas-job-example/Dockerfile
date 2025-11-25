FROM pyramation/openfaas-node:0.7.2-12.18.2-alpine3.11

RUN addgroup -S app && adduser -S -g app app
RUN mkdir -p /home/app

WORKDIR /home/app
ARG NPM_TOKEN  
COPY .npmrc .npmrc 
COPY package.json .
COPY main /home/app/main
ENV NODE_ENV production
ENV NPM_CONFIG_LOGLEVEL warn
RUN yarn install --production
RUN rm .npmrc
RUN chown -R app:app /home/app

ENV cgi_headers="true"
ENV fprocess="node main/index.js"
ENV mode="http"
ENV PORT 10101
ENV upstream_url="http://127.0.0.1:10101"

ENV exec_timeout="20s" 
ENV write_timeout="25s" 
ENV read_timeout="25s" 

USER app
