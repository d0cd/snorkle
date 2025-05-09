#! /bin/bash

curl -X POST http://0.0.0.0:3000/update \
  -H "Content-Type: application/json" \
  -d '{ "service": "example.com" }'
