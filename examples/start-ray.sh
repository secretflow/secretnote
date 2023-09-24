#!/usr/bin/env bash

ray start --block --head --port 32400 \
  --dashboard-port 8265 \
  --include-dashboard True &
PID1=$!

ray start --block --head --port 32401 \
  --dashboard-port 8266 \
  --include-dashboard True &
PID2=$!

trap "kill $PID1 $PID2" SIGINT

wait $PID1 $PID2

exit 0
