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

RUN pnpm install --no-frozen-lockfile

RUN cargo install gcc
RUN pnpm exec nx run-many -t build:js -t build:py

RUN apt-get update && apt-get install -y rsync
RUN rsync -avm --include='pyprojects/**/dist/*.whl' -f 'hide,! */' /repo/./ /dist


FROM secretflow/secretflow-anolis8:1.6.1b0

RUN useradd -m secretnote

COPY --from=build /dist /dist

RUN pip install /dist/pyprojects/secretnote/dist/*.whl

WORKDIR /root

RUN curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
RUN yum install -y nodejs
RUN npm install @difizen/libro-analyzer

COPY ./docker/app/root/ /root/

RUN mkdir workspace

RUN chown -R secretnote:secretnote /root
USER secretnote

ENV SELF_PARTY=alice
ENV ALL_PARTIES=alice,bob

EXPOSE 8888

ENTRYPOINT [ "/root/scripts/start.sh" ]
