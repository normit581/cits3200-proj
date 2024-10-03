#!/bin/sh
# currently just a script to start the app in a docker container

if [ ! -f deployment/app.env ]; then
  printf "\e[0;91mRequires app.env file in deployment directory\e[0m"
  exit 1
fi

docker compose build \
  && docker compose up -d
