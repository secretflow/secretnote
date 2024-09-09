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

secretnote sf --config=/home/secretnote/.jupyter/jupyter_server_config.py --allow-root --no-browser --port $PORT
