#!/bin/sh
# currently just a script to start the app in a docker container

if [ ! -f app.env ]; then
  printf "\e[0;91mRequires app.env file\e[0m"
fi

docker compose build \
  && docker compose up -d
