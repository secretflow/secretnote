#!/bin/bash

# Bootstrap this monorepo for development

set -e -u -o pipefail

RED='\033[0;31m'
ORANGE='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Setup Python environment

if type "rye" &> /dev/null; then
  echo "Setting up Python virtual environment using rye"
  rye sync --no-lock

else
  echo "rye not found, falling back to Python"

  if ! type "python3" &> /dev/null; then
    echo -e $ORANGE"python3 not found, will not install Python dependencies"$NC
    echo -e $ORANGE"WARNING: Bootstrapping may fail"$NC

  else
    echo "Installing Python dependencies"

    echo -e $CYAN"Using $(python3 --version)"$NC
    echo -e $CYAN"$(type python3)"$NC

    if ! python3 -c "import sys; exit(int(sys.prefix == sys.base_prefix))"; then
      echo -e $ORANGE"WARNING: Not using a virtualenv. This is not recommended."$NC
    fi

    python3 -m pip install -r requirements.lock -r requirements-dev.lock
  fi
fi

# Setup Node environment
pnpm install --frozen-lockfile
