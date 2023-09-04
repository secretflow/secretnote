FROM mcr.microsoft.com/devcontainers/python:3.8-bullseye

RUN apt-get update \
  && apt-get install -y unzip curl python3-distutils

# Default non-root user
USER vscode
WORKDIR /home/vscode

# Install fnm
RUN curl -sSL https://raw.githubusercontent.com/Schniz/fnm/master/.ci/install.sh \
  | bash -s -- --install-dir $HOME/.fnm

# Install Node
RUN $HOME/.fnm/fnm install 16.20 \
  && $HOME/.fnm/fnm default 16.20

# Install PNPM
RUN eval $($HOME/.fnm/fnm env) \
  && npm install -g pnpm \
  && SHELL=bash pnpm setup

# Install Poetry
RUN curl -sSL https://install.python-poetry.org \
  | POETRY_NO_INTERACTION=1 python3 -
