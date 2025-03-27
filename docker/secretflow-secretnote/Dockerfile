# This Dockerfile will build the secretflow/secretnote image for depolying a node
# for SecretNote.

ARG SECRETFLOW_VERSION="1.11.0b1"

# Get the repository and remove unncessary files
FROM alpine:3.14 AS source-tree
RUN apk add --no-cache git
COPY . /repo
RUN git init \
  && git clean -fX . \
  && rm -rf .git \
  && rm -r /repo/docker

# Build the project
FROM nikolaik/python-nodejs:python3.10-nodejs20 AS build
USER root
WORKDIR /repo
# Prepare building toolchain
ENV CI=true
RUN npm config set registry https://registry.npmmirror.com
RUN npm install -g pnpm@9.4.0
RUN pip install build --break-system-package
COPY --from=source-tree /repo /repo
RUN pnpm install --frozen-lockfile
RUN pnpm run ci:build
RUN apt-get update && apt-get install -y rsync
RUN rsync -avm --include='pyprojects/**/dist/*.whl' -f 'hide,! */' /repo/./ /dist

# Extend the base image
FROM secretflow/secretflow-anolis8:${SECRETFLOW_VERSION} AS extend
ARG TARGETPLATFORM
RUN useradd -m secretnote
COPY --from=build /dist /dist
# There is no psutil wheel for Anolis8 with ARM Docker host. Build it from source.
# Although the base image runs Python 3.10, Python 3.6 devel still works.
RUN if [ "$TARGETPLATFORM" = "linux/arm64" ] ; then yum install -y gcc python36-devel \
  && cp /usr/include/python3.6m/* /usr/local/include/ \
  && pip install --no-binary :all: psutil==5.9.8 ; fi
RUN pip install /dist/pyprojects/secretnote/dist/*.whl
WORKDIR /home/secretnote
COPY ./docker/secretflow-secretnote/root/ ./
RUN curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
RUN yum install -y nodejs
RUN npm config set registry https://registry.npmmirror.com
RUN npm install @difizen/pylez@0.1.2
RUN mkdir workspace
RUN chown -R secretnote:secretnote /home/secretnote
USER secretnote

# Start the project
ENV SELF_PARTY=alice
ENV ALL_PARTIES=alice,bob
EXPOSE 8888
ENTRYPOINT [ "/home/secretnote/scripts/start.sh" ]
