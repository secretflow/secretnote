FROM mcr.microsoft.com/devcontainers/base:bullseye

ARG FNM_VERSION=1.35.1
ARG RYE_VERSION=0.13.0
ARG NODE_VERSION=16.20

RUN apt-get update \
  && apt-get install -y \
  sudo \
  unzip \
  curl

# Install fnm (for Node)
RUN curl -sSL https://github.com/Schniz/fnm/releases/download/v${FNM_VERSION}/fnm-linux.zip \
  -o fnm.zip \
  && unzip -d /usr/local/bin fnm.zip fnm \
  && chmod +x /usr/local/bin/fnm \
  && rm fnm.zip

# Install Rye (for Python)
RUN curl -sSL https://github.com/mitsuhiko/rye/releases/download/${RYE_VERSION}/rye-x86_64-linux.gz \
  | gunzip > /usr/local/bin/rye \
  && chmod +x /usr/local/bin/rye

# Default non-root user
USER vscode
WORKDIR /home/vscode

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
