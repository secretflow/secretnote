#!/usr/bin/env bash

DIRNAME=$(dirname "$0")

# node_modules and .venv are mounted as a volume, fix permissions
sudo chown -R "$(id -un):$(id -gn)" node_modules .venv

# set pnpm to use node_modules/.pnpm-store as store-dir to support hardlinks
pnpm config set store-dir $PWD/node_modules/.pnpm-store

# preemptively create virtualenv
$DIRNAME/create-venv.sh
