#!/bin/bash

REPO_DIR="/home/ubuntu/app"

cd "$REPO_DIR" || exit

git fetch origin main

LOCAL_COMMIT=$(git rev-parse HEAD)
REMOTE_COMMIT=$(git rev-parse origin/main)

if [ "$LOCAL_COMMIT" != "$REMOTE_COMMIT" ]; then
    git pull
    ./deploy
fi
