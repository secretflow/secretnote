#!/usr/bin/env bash

PROTO_SOURCE=proto
PROTO_TEMPFILES=generated/proto
PROTO_TARGET=src/secretnote/proto

rm -rf $PROTO_TEMPFILES $PROTO_TARGET

buf generate \
  --template $PROTO_SOURCE/buf.gen.yaml \
  $PROTO_SOURCE

python -m datamodel_code_generator \
  --input $PROTO_TEMPFILES/jsonschema/secretnote.v1/Trace.json \
  --input-file-type jsonschema \
  --base-class secretnote.utils.pydantic.ProtoModel \
  --output-model-type pydantic.BaseModel \
  --output $PROTO_TARGET
