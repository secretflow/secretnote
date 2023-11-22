#!/usr/bin/env bash

COLOR_RED='\033[0;31m'
COLOR_ORANGE='\033[0;33m'
COLOR_BLUE='\033[0;34m'
COLOR_CYAN='\033[0;36m'
COLOR_RESET='\033[0m'

if type "rye" &> /dev/null; then
  echo -e $COLOR_BLUE"Setting up Python environment using Rye"$COLOR_RESET
  rye sync --no-lock
  exit $?
fi

echo "Setting up Python environment"

if ! type "python" &> /dev/null; then
  echo -e $COLOR_ORANGE"Python not found, aborting ..."$COLOR_RESET
  exit 1
fi

echo "Installing Python dependencies"

echo -e $COLOR_CYAN"Using $(python --version)"$NC

# Warn about not using a virtualenv if not in CI

if test -z $CI && ! python -c "import sys; exit(int(sys.prefix == sys.base_prefix))"; then
  echo -e $COLOR_ORANGE"Not using a virtualenv. This is not recommended."$COLOR_RESET
fi

python -m pip install -r requirements-dev.lock
