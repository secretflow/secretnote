FROM rust:bullseye

ARG FNM_VERSION=1.35.1
ARG RYE_VERSION=0.15.1

ARG NODE_VERSION=18.18
ARG PYTHON_VERSION=3.8.18

# Install fnm (for Node)
RUN cargo install fnm \
  --version ${FNM_VERSION}

# Install Rye (for Python)
RUN cargo install rye \
  --git https://github.com/mitsuhiko/rye \
  --tag ${RYE_VERSION}

# Install Node
RUN fnm install ${NODE_VERSION} \
  && fnm default ${NODE_VERSION}

# Install PNPM
RUN eval $(fnm env) \
  && npm install -g pnpm \
  && SHELL=bash pnpm setup \
  && echo "" >> ~/.bashrc

# Install Python
RUN rye self install --yes

# Copy workspace
COPY . /home/vscode/workspace
WORKDIR /home/vscode/workspace

ENV PATH="/root/.cargo/bin:/root/.rye/shims:${PATH}"

RUN eval $(fnm env) \
  && pnpm run bootstrap

RUN eval $(fnm env) \
  && pnpm run ci:check:javascript \
  && pnpm run ci:check:python \
  && pnpm run ci:build

ENTRYPOINT [ "/bin/bash" ]
