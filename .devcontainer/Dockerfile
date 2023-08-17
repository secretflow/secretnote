FROM mcr.microsoft.com/devcontainers/base:bullseye

RUN apt-get update \
  && apt-get install -y unzip curl

# Default non-root user
USER vscode

# Install fnm
RUN curl -fsSL https://fnm.vercel.app/install \
  | bash -s -- --install-dir $HOME/.fnm

# Install Node
RUN $HOME/.fnm/fnm install 16.20 \
  && $HOME/.fnm/fnm default 16.20

# Install PNPM
RUN eval $($HOME/.fnm/fnm env) \
  && npm install -g pnpm \
  && SHELL=bash pnpm setup

# Install Rye
# https://rye-up.com/guide/installation/
RUN curl -fsS https://rye-up.com/get \
  | RYE_INSTALL_OPTION=--yes bash \
  && echo '\nsource "$HOME/.rye/env"' >> $HOME/.bashrc
