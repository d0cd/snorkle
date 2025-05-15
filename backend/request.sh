#! /bin/bash

#GAME_ID='"${1}"'

curl -X POST http://0.0.0.0:3000/submit \
  -H "Content-Type: application/json" \
  -d '{ "game_id": "29d16147-102e-4bd8-99db-7ba3a6815a57" }'

