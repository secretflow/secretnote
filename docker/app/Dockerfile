# This Dockerfile will build the secretflow/secretnote image for depolying a node
# for SecretNote.

# Get the repository and remove unncessary files
FROM alpine:3.14 AS source-tree
RUN apk add --no-cache git
COPY . /repo
RUN git init \
  && git clean -fX . \
  && rm -rf .git \
  && rm -r /repo/docker

# Build the project
FROM nikolaik/python-nodejs:python3.10-nodejs18 AS build
ENV CI=true
USER root
WORKDIR /repo
RUN npm config set registry https://registry.npmmirror.com
RUN npm install -g pnpm@9.4.0
RUN pip install build --break-system-packages
COPY --from=source-tree /repo/pnpm-lock.yaml /repo/.npmrc /repo/
RUN pnpm fetch
COPY --from=source-tree /repo /repo
RUN pnpm install --frozen-lockfile
RUN pnpm run ci:build
RUN apt-get update && apt-get install -y rsync
RUN rsync -avm --include='pyprojects/**/dist/*.whl' -f 'hide,! */' /repo/./ /dist

# Config the runtime
# TODO Update the version here
FROM secretflow/secretflow-anolis8:1.9.0b0
RUN python --version
RUN useradd -m secretnote
COPY --from=build /dist /dist
RUN pip install /dist/pyprojects/secretnote/dist/*.whl
WORKDIR /home/secretnote
COPY ./docker/app/root/ ./
RUN curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
RUN yum install -y nodejs
RUN npm config set registry https://registry.npmmirror.com
RUN npm install @difizen/libro-analyzer@0.1.2
RUN mkdir workspace
RUN chown -R secretnote:secretnote /home/secretnote
USER secretnote

# Start the project
ENV SELF_PARTY=alice
ENV ALL_PARTIES=alice,bob
EXPOSE 8888
ENTRYPOINT [ "/home/secretnote/scripts/start.sh" ]
