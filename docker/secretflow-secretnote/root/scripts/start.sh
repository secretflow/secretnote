#!/usr/bin/env bash

ray start \
  --head \
  --port=6379 \
  --include-dashboard=False \
  --disable-usage-stats \
  --resources="{\"$SELF_PARTY\": 4}"

if [ -z "${PORT}" ]; then
  PORT=8888
fi

# `--_as-compute-node` is a private flag only used for SecretNote SF Docker image build
secretnote sf --_as-compute-node \
  --config=/home/secretnote/.jupyter/jupyter_server_config.py \
  --allow-root --no-browser --port $PORT
