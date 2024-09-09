# This Dockerfile will build the secretflow/secretnote image for depolying a node
# for SecretNote.

# Get the repository
FROM alpine:3.14 as source-tree
RUN apk add --no-cache git
COPY . /repo
RUN git init \
  && git clean -fX . \
  && rm -rf .git \
  && rm -r /repo/docker

# Build the project
FROM secretflow/devcontainer-web:amd64-v2 as build
ENV CI=true
USER root
WORKDIR /repo
SHELL ["/bin/bash", "-c"]
RUN SHELL=bash pnpm setup
RUN source /root/.bashrc
ENV PNPM_HOME="/root/.local/share/pnpm"
RUN PATH="$PNPM_HOME:$PATH" pnpm add -g pnpm@9.4.0
COPY --from=source-tree /repo/pnpm-lock.yaml /repo/.npmrc /repo/
RUN pnpm --version
RUN pnpm fetch
COPY --from=source-tree /repo /repo
RUN pnpm install --frozen-lockfile
RUN cargo install gcc
RUN pnpm run ci:build
RUN apt-get update && apt-get install -y rsync
RUN rsync -avm --include='pyprojects/**/dist/*.whl' -f 'hide,! */' /repo/./ /dist

# Config the runtime
# TODO Update the version here
FROM secretflow/secretflow-anolis8:1.6.1b0
RUN useradd -m secretnote
COPY --from=build /dist /dist
RUN pip install /dist/pyprojects/secretnote/dist/*.whl
WORKDIR /home/secretnote
COPY ./docker/app/root/ ./
RUN curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
RUN yum install -y nodejs
RUN npm config set registry https://registry.npmmirror.com
RUN npm install @difizen/libro-analyzer
RUN mkdir workspace
RUN chown -R secretnote:secretnote /home/secretnote
USER secretnote

# Start the project
ENV SELF_PARTY=alice
ENV ALL_PARTIES=alice,bob
EXPOSE 8888
ENTRYPOINT [ "/home/secretnote/scripts/start.sh" ]
