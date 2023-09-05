#!/usr/bin/env bash

PYTHON_VENV_VERSION=$(cat .python-version | tr -d " \t\n\r")
REPO_ROOT=$(git rev-parse --show-toplevel)

rye fetch $PYTHON_VENV_VERSION

cd "$REPO_ROOT"/..

python +$PYTHON_VENV_VERSION -m venv "$REPO_ROOT/.venv"
printf '{"python": "%s"}' "$PYTHON_VENV_VERSION" > "$REPO_ROOT/.venv/rye-venv.json"
