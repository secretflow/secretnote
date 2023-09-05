#!/usr/bin/env bash

# PATH is currently a mess
source ~/.bashrc

ray start \
  --head \
  --port=6379 \
  --include-dashboard=True \
  --dashboard-host "0.0.0.0" \
  --resources="{\"$SELF_PARTY\": 4}"

jupyter lab --ip "0.0.0.0" --no-browser
