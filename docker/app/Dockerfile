# doesn't support linux/arm64

FROM alpine:3.14 as source-tree

RUN apk add --no-cache git
COPY . /repo
RUN git init \
  && git clean -fX . \
  && rm -rf .git \
  && rm -r /repo/docker

FROM secretflow/devcontainer-web:latest as build

ENV CI=true

USER root
WORKDIR /repo

COPY --from=source-tree /repo/pnpm-lock.yaml /repo/pnpm-lock.yaml

RUN pnpm fetch

COPY --from=source-tree /repo /repo

RUN pnpm install --frozen-lockfile --offline
# RUN rye sync --no-dev --no-lock --all-features

RUN pnpm exec nx run-many -t build:js -t build:py

RUN apt-get update && apt-get install -y rsync
RUN rsync -avm --include='pyprojects/**/dist/*.whl' -f 'hide,! */' /repo/./ /dist

FROM secretflow/secretflow-anolis8:1.3.0b0

COPY --from=build /dist /dist

RUN pip install /dist/pyprojects/secretnote/dist/*.whl

WORKDIR /root

COPY ./docker/app/root/scripts /root/scripts

ENV SELF_PARTY=alice
ENV ALL_PARTIES=alice

EXPOSE 8888

ENTRYPOINT [ "/root/scripts/start.sh" ]
