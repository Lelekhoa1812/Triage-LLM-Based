#!/bin/bash
for i in 0 1 2; do
  payload=$(node -pe "JSON.stringify(require('./user.json')[$i])")
  curl -X POST https://triagellmhospital.vercel.app/api/dispatch \
    -H "Content-Type: application/json" \
    -d "$payload"
done
