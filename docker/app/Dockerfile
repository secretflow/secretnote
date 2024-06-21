FROM alpine:3.14 as source-tree

RUN apk add --no-cache git
COPY . /repo
RUN git init \
  && git clean -fX . \
  && rm -rf .git \
  && rm -r /repo/docker


FROM secretflow/devcontainer-web:amd64-v2 as build

ENV CI=true

USER root
WORKDIR /repo

COPY --from=source-tree /repo/pnpm-lock.yaml /repo/.npmrc /repo/

RUN pnpm fetch

COPY --from=source-tree /repo /repo

RUN pnpm install --frozen-lockfile --offline

RUN cargo install gcc
RUN pnpm exec nx run-many -t build:js -t build:py

RUN apt-get update && apt-get install -y rsync
RUN rsync -avm --include='pyprojects/**/dist/*.whl' -f 'hide,! */' /repo/./ /dist


FROM python:3.10-slim-bullseye

COPY --from=build /dist /dist

RUN apt update
RUN apt install -y build-essential

RUN pip install /dist/pyprojects/secretnote/dist/*.whl

WORKDIR /root

RUN apt install -y nodejs
RUN apt install -y npm
RUN npm install @difizen/libro-analyzer

COPY ./docker/app/root/ /root/

RUN mkdir workspace

ENV SELF_PARTY=alice
ENV ALL_PARTIES=alice,bob

EXPOSE 8888

ENTRYPOINT [ "/root/scripts/start.sh" ]
