#!/usr/bin/env bash

# node_modules is mounted as a volume, fix permissions
sudo chown -R "$(id -un):$(id -gn)" node_modules

# set pnpm to use node_modules/.pnpm-store as store-dir to support hardlinks
pnpm config set store-dir $PWD/node_modules/.pnpm-store
