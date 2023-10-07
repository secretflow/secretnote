FROM mcr.microsoft.com/devcontainers/base:bullseye

ARG FNM_VERSION=1.35.1
ARG RYE_VERSION=0.15.1
ARG NODE_VERSION=16.20

RUN apt-get update \
  && apt-get install -y \
  sudo \
  curl

# Default non-root user
USER vscode
WORKDIR /home/vscode

ENV PATH="/home/vscode/.cargo/bin:${PATH}"

# Install Rust
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y

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

# Install Python
RUN rye self install --yes

# Install PNPM
RUN eval $(fnm env) \
  && npm install -g pnpm \
  && SHELL=bash pnpm setup \
  && echo "" >> ~/.bashrc

# Setup shell
RUN echo 'eval "$(fnm env --use-on-cd)"' >> ~/.bashrc
RUN echo 'source "$HOME/.rye/env"' >> ~/.bashrc
