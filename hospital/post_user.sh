#!/bin/bash
for i in 0 1 2; do
  payload=$(jq -c ".[$i]" user.json)
  curl -X POST https://triagellmhospital.vercel.app/api/dispatch \
    -H "Content-Type: application/json" \
    -d "$payload"
done
