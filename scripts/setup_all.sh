#!/usr/bin/env bash

set -e

# Bootstrap this monorepo for development

# Setup Node environment

pnpm install --frozen-lockfile

# Setup Python environment

$(dirname $0)/setup_python.sh

# Run setup tasks

pnpm run ci:setup
