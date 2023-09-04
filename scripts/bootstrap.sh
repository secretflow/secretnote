#!/bin/bash

# Bootstrap this monorepo for development

set -e -u -o pipefail

RED='\033[0;31m'
ORANGE='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Setup Python environment
if type "poetry" &> /dev/null; then
  echo "Setting up Python virtual environment using Poetry"
  poetry install
else
  echo -e $RED"Poetry not found, aborting"$NC
  exit 1
fi

# Setup Node environment
pnpm install --frozen-lockfile
