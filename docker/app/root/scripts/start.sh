#!/usr/bin/env bash

ray start \
  --head \
  --port=6379 \
  --include-dashboard=False \
  --disable-usage-stats \
  --resources="{\"$SELF_PARTY\": 4}"

secretnote --allow-root --no-browser
