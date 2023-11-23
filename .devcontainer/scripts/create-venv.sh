#!/usr/bin/env bash

PYTHON_VERSION="3.8.17"
REPO_ROOT=$(git rev-parse --show-toplevel)

# Download Python
rye fetch $PYTHON_VERSION

# Remove current virtual environment
find .venv -exec rm -rf {} + 2> /dev/null

# Create new virtual environment
cd "$REPO_ROOT"/..
python +$PYTHON_VERSION -m venv "$REPO_ROOT/.venv"

# Write auxiliary files for Rye
printf '{"python": "%s"}\n' "$PYTHON_VERSION" > "$REPO_ROOT/.venv/rye-venv.json"
printf '%s\n' "$PYTHON_VERSION" > "$REPO_ROOT/.python-version"
